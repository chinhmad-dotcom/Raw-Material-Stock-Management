using Microsoft.Extensions.Logging;
using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;
using StockRM.Domain.Entities;
using StockRM.Domain.Enums;
using StockRM.Domain.Interfaces;

namespace StockRM.Application.Services;

/// <summary>
/// Core engine: computes DOH, age, fill%, and derives all alert flags.
/// This service is the single source of truth for all stock calculations.
/// </summary>
public class StockCalculationService
{
    private const int LOW_STOCK_DOH_THRESHOLD = 3;     // < 3 days → Low Stock Alert
    private const int DEFAULT_ROLLING_DAYS = 7;         // 7-day rolling average

    private readonly IAgeStandardRepository _ageStandardRepo;
    private readonly ILogger<StockCalculationService> _logger;

    public StockCalculationService(
        IAgeStandardRepository ageStandardRepo,
        ILogger<StockCalculationService> logger)
    {
        _ageStandardRepo = ageStandardRepo;
        _logger = logger;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DOH Calculation
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Day on Hand = Current Stock / Average Daily Consumption.
    /// Returns decimal.MaxValue when consumption is 0 (no risk of stockout).
    /// </summary>
    public decimal CalculateDOH(decimal currentStockTons, decimal avgDailyConsumptionTons)
    {
        if (avgDailyConsumptionTons <= 0)
        {
            _logger.LogDebug("Avg daily consumption is 0 — DOH set to MaxValue (infinite)");
            return decimal.MaxValue;
        }

        var doh = currentStockTons / avgDailyConsumptionTons;
        return Math.Round(doh, 2);
    }

    /// <summary>
    /// Calculate rolling average consumption from a list of recent dispatch/issue quantities.
    /// Uses available days if fewer than <paramref name="days"/> records exist.
    /// </summary>
    public decimal CalculateRollingAverageConsumption(
        IEnumerable<decimal> dailyConsumptionValues,
        int days = DEFAULT_ROLLING_DAYS)
    {
        var values = dailyConsumptionValues.ToList();
        if (!values.Any()) return 0m;

        var relevant = values.TakeLast(days).ToList();
        return relevant.Count > 0
            ? Math.Round(relevant.Average(), 4)
            : 0m;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Age Calculation
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Age in calendar days from receipt date to today.
    /// </summary>
    public int CalculateAgeInDays(DateTime receiptDate)
        => (int)(DateTime.UtcNow.Date - receiptDate.Date).TotalDays;

    /// <summary>
    /// Age as a percentage of the configured max storage age.
    /// </summary>
    public decimal CalculateAgePercent(int ageInDays, int maxStorageAgeDays)
    {
        if (maxStorageAgeDays <= 0) return 0m;
        return Math.Round((decimal)ageInDays / maxStorageAgeDays * 100, 1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Alert Flag Derivation
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Determines if a Low Stock alert should fire: DOH &lt; 3 days.
    /// </summary>
    public bool IsLowStock(decimal doh)
        => doh != decimal.MaxValue && doh < LOW_STOCK_DOH_THRESHOLD;

    /// <summary>
    /// Determines if a Critical Age alert should fire: age > max storage age.
    /// </summary>
    public bool IsCriticalAge(int ageInDays, int maxStorageAgeDays)
        => maxStorageAgeDays > 0 && ageInDays > maxStorageAgeDays;

    /// <summary>
    /// Near Expiry: age >= warningThreshold% of max storage age but not yet exceeded.
    /// </summary>
    public bool IsNearExpiry(int ageInDays, int maxStorageAgeDays, int warningThresholdPercent = 80)
    {
        if (maxStorageAgeDays <= 0) return false;
        var warningDays = maxStorageAgeDays * warningThresholdPercent / 100.0;
        return ageInDays >= warningDays && ageInDays <= maxStorageAgeDays;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Silo Fill Percentage
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Fill percent = closing stock / silo capacity × 100. Capped at 100%.
    /// </summary>
    public decimal CalculateFillPercent(decimal closingStockTons, decimal capacityTons)
    {
        if (capacityTons <= 0) return 0m;
        return Math.Min(100m, Math.Round(closingStockTons / capacityTons * 100, 1));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Stock Closing Balance
    // ─────────────────────────────────────────────────────────────────────────

    public decimal CalculateClosingStock(decimal opening, decimal intake, decimal dispatch)
        => opening + intake - dispatch;

    public decimal CalculateClosingStockAdditive(decimal opening, decimal receipt, decimal issue)
        => opening + receipt - issue;

    // ─────────────────────────────────────────────────────────────────────────
    // Composite: Enrich a SiloStock with all calculated fields
    // ─────────────────────────────────────────────────────────────────────────

    public async Task EnrichSiloStockAsync(
        SiloStock stock,
        IEnumerable<decimal> recentDailyConsumptions,
        decimal siloCapacityTons)
    {
        var ageStd = await _ageStandardRepo.GetByMaterialIdAsync(stock.MaterialId);
        int maxAge = ageStd?.MaxStorageAgeDays ?? 0;
        int warnPct = ageStd?.WarningThresholdPercent ?? 80;

        stock.ClosingStockTons = CalculateClosingStock(
            stock.OpeningStockTons, stock.IntakeTons, stock.DispatchTons);

        stock.AverageDailyConsumptionTons =
            CalculateRollingAverageConsumption(recentDailyConsumptions);

        stock.DayOnHand = CalculateDOH(stock.ClosingStockTons, stock.AverageDailyConsumptionTons);
        stock.AgeInDays = CalculateAgeInDays(stock.ReceiptDate);
        stock.IsLowStockAlert = IsLowStock(stock.DayOnHand);
        stock.IsCriticalAgeAlert = IsCriticalAge(stock.AgeInDays, maxAge);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Composite: Enrich an AdditiveStock with all calculated fields
    // ─────────────────────────────────────────────────────────────────────────

    public async Task EnrichAdditiveStockAsync(
        AdditiveStock stock,
        IEnumerable<decimal> recentDailyConsumptions)
    {
        var ageStd = await _ageStandardRepo.GetByMaterialIdAsync(stock.MaterialId);
        int maxAge = ageStd?.MaxStorageAgeDays ?? 0;

        stock.ClosingStockTons = CalculateClosingStockAdditive(
            stock.OpeningStockTons, stock.ReceiptTons, stock.IssueTons);

        stock.AverageDailyConsumptionTons =
            CalculateRollingAverageConsumption(recentDailyConsumptions);

        stock.DayOnHand = CalculateDOH(stock.ClosingStockTons, stock.AverageDailyConsumptionTons);
        stock.AgeInDays = CalculateAgeInDays(stock.ReceiptDate);
        stock.IsLowStockAlert = IsLowStock(stock.DayOnHand);
        stock.IsCriticalAgeAlert = IsCriticalAge(stock.AgeInDays, maxAge);
    }
}
