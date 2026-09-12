using Microsoft.Extensions.Logging;
using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;
using StockRM.Domain.Entities;
using StockRM.Domain.Enums;
using StockRM.Domain.Interfaces;

namespace StockRM.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly ISiloStockRepository _siloStockRepo;
    private readonly IAdditiveStockRepository _additiveStockRepo;
    private readonly IAgeStandardRepository _ageStandardRepo;
    private readonly IAlertRepository _alertRepo;
    private readonly StockCalculationService _calc;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(
        ISiloStockRepository siloStockRepo,
        IAdditiveStockRepository additiveStockRepo,
        IAgeStandardRepository ageStandardRepo,
        IAlertRepository alertRepo,
        StockCalculationService calc,
        ILogger<DashboardService> logger)
    {
        _siloStockRepo = siloStockRepo;
        _additiveStockRepo = additiveStockRepo;
        _ageStandardRepo = ageStandardRepo;
        _alertRepo = alertRepo;
        _calc = calc;
        _logger = logger;
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
    {
        var siloStocks = (await _siloStockRepo.GetDashboardSnapshotAsync()).ToList();
        var additiveStocks = (await _additiveStockRepo.GetDashboardSnapshotAsync()).ToList();
        var activeAlerts = (await _alertRepo.GetActiveAlertsAsync()).ToList();
        var ageStandards = (await _ageStandardRepo.GetAllAsync())
            .ToDictionary(a => a.MaterialId);

        var siloCards = siloStocks.Select(s =>
        {
            ageStandards.TryGetValue(s.MaterialId, out var std);
            int maxAge = std?.MaxStorageAgeDays ?? 0;
            int warnPct = std?.WarningThresholdPercent ?? 80;
            decimal agePercent = _calc.CalculateAgePercent(s.AgeInDays, maxAge);
            decimal fillPercent = _calc.CalculateFillPercent(
                s.ClosingStockTons, s.Silo?.CapacityTons ?? 1);

            return new SiloDashboardCardDto(
                s.SiloId,
                s.Silo?.Code ?? "",
                s.Silo?.Name ?? "",
                s.MaterialId,
                s.Material?.Code ?? "",
                s.Material?.Name ?? "",
                s.ClosingStockTons,
                s.Silo?.CapacityTons ?? 0,
                fillPercent,
                s.DayOnHand == decimal.MaxValue ? 999 : s.DayOnHand,
                s.AgeInDays,
                maxAge,
                agePercent,
                s.IsLowStockAlert,
                s.IsCriticalAgeAlert,
                _calc.IsNearExpiry(s.AgeInDays, maxAge, warnPct),
                s.ReceiptDate,
                s.BatchNumber);
        }).ToList();

        var additiveCards = additiveStocks.Select(a =>
        {
            ageStandards.TryGetValue(a.MaterialId, out var std);
            int maxAge = std?.MaxStorageAgeDays ?? 0;
            int warnPct = std?.WarningThresholdPercent ?? 80;
            decimal agePercent = _calc.CalculateAgePercent(a.AgeInDays, maxAge);

            return new AdditiveDashboardCardDto(
                a.MaterialId,
                a.Material?.Code ?? "",
                a.Material?.Name ?? "",
                a.ClosingStockTons,
                a.DayOnHand == decimal.MaxValue ? 999 : a.DayOnHand,
                a.AgeInDays,
                maxAge,
                agePercent,
                a.IsLowStockAlert,
                a.IsCriticalAgeAlert,
                _calc.IsNearExpiry(a.AgeInDays, maxAge, warnPct),
                a.ReceiptDate,
                a.WarehouseLocation);
        }).ToList();

        var alertDtos = activeAlerts.Select(al => new AlertDto(
            al.Id, al.MaterialId, al.Material?.Code ?? "", al.Material?.Name ?? "",
            al.SiloId, al.Silo?.Name, al.AlertType, al.AlertType.ToString(),
            al.Severity, al.Severity.ToString(), al.Message,
            al.CurrentValue, al.ThresholdValue, al.IsResolved, al.AlertDate)).ToList();

        return new DashboardSummaryDto(
            TotalActiveSilos: siloCards.Select(s => s.SiloId).Distinct().Count(),
            TotalActiveAdditives: additiveCards.Count,
            CriticalAlertCount: alertDtos.Count(a => a.Severity == AlertSeverity.Critical),
            WarningAlertCount: alertDtos.Count(a => a.Severity == AlertSeverity.Warning),
            TotalSiloStockTons: siloCards.Sum(s => s.CurrentStockTons),
            TotalAdditiveStockTons: additiveCards.Sum(a => a.CurrentStockTons),
            Silos: siloCards,
            Additives: additiveCards,
            ActiveAlerts: alertDtos.OrderByDescending(a => (int)a.Severity),
            GeneratedAt: DateTime.UtcNow);
    }

    public async Task<IEnumerable<StockTrendDto>> GetSiloTrendAsync(int siloId, int materialId, int days = 30)
    {
        var from = DateTime.UtcNow.Date.AddDays(-days);
        var history = await _siloStockRepo.GetBySiloIdAsync(siloId, from, DateTime.UtcNow.Date);
        return history
            .Where(s => s.MaterialId == materialId)
            .OrderBy(s => s.StockDate)
            .Select(s => new StockTrendDto(
                s.StockDate, s.ClosingStockTons,
                s.IntakeTons, s.DispatchTons, s.DayOnHand));
    }

    public async Task<IEnumerable<StockTrendDto>> GetAdditiveTrendAsync(int materialId, int days = 30)
    {
        var from = DateTime.UtcNow.Date.AddDays(-days);
        var history = await _additiveStockRepo.GetByMaterialIdAsync(materialId, from, DateTime.UtcNow.Date);
        return history
            .OrderBy(s => s.StockDate)
            .Select(s => new StockTrendDto(
                s.StockDate, s.ClosingStockTons,
                s.ReceiptTons, s.IssueTons, s.DayOnHand));
    }

    public async Task<DailyReportDto> GetDailyReportAsync(DateTime date)
    {
        var siloStocks = await _siloStockRepo.GetByDateAsync(date);
        var additiveStocks = await _additiveStockRepo.GetByDateAsync(date);
        var ageStandards = (await _ageStandardRepo.GetAllAsync()).ToDictionary(a => a.MaterialId);
        var alerts = await _alertRepo.GetActiveAlertsAsync();

        return new DailyReportDto(
            date,
            siloStocks.Select(s => MapSiloToDto(s, ageStandards)),
            additiveStocks.Select(a => MapAdditiveToDto(a, ageStandards)),
            alerts.Select(al => new AlertDto(
                al.Id, al.MaterialId, al.Material?.Code ?? "", al.Material?.Name ?? "",
                al.SiloId, al.Silo?.Name, al.AlertType, al.AlertType.ToString(),
                al.Severity, al.Severity.ToString(), al.Message,
                al.CurrentValue, al.ThresholdValue, al.IsResolved, al.AlertDate)),
            "System",
            DateTime.UtcNow);
    }

    private SiloStockDto MapSiloToDto(SiloStock s, Dictionary<int, AgeStandard> ageStandards)
    {
        ageStandards.TryGetValue(s.MaterialId, out var std);
        int maxAge = std?.MaxStorageAgeDays ?? 0;
        int warnPct = std?.WarningThresholdPercent ?? 80;
        return new SiloStockDto(
            s.Id, s.SiloId, s.Silo?.Code ?? "", s.Silo?.Name ?? "",
            s.MaterialId, s.Material?.Code ?? "", s.Material?.Name ?? "",
            s.ReceiptDate, s.AgeInDays, maxAge,
            _calc.CalculateAgePercent(s.AgeInDays, maxAge),
            s.OpeningStockTons, s.IntakeTons, s.DispatchTons, s.ClosingStockTons,
            s.Silo?.CapacityTons ?? 0,
            _calc.CalculateFillPercent(s.ClosingStockTons, s.Silo?.CapacityTons ?? 1),
            s.AverageDailyConsumptionTons,
            s.DayOnHand == decimal.MaxValue ? 999 : s.DayOnHand,
            s.IsLowStockAlert, s.IsCriticalAgeAlert,
            _calc.IsNearExpiry(s.AgeInDays, maxAge, warnPct),
            s.StockDate, s.BatchNumber, s.SupplierName, s.Notes);
    }

    private AdditiveStockDto MapAdditiveToDto(AdditiveStock a, Dictionary<int, AgeStandard> ageStandards)
    {
        ageStandards.TryGetValue(a.MaterialId, out var std);
        int maxAge = std?.MaxStorageAgeDays ?? 0;
        int warnPct = std?.WarningThresholdPercent ?? 80;
        return new AdditiveStockDto(
            a.Id, a.MaterialId, a.Material?.Code ?? "", a.Material?.Name ?? "",
            a.ReceiptDate, a.AgeInDays, maxAge,
            _calc.CalculateAgePercent(a.AgeInDays, maxAge),
            a.OpeningStockTons, a.ReceiptTons, a.IssueTons, a.ClosingStockTons,
            a.AverageDailyConsumptionTons,
            a.DayOnHand == decimal.MaxValue ? 999 : a.DayOnHand,
            a.IsLowStockAlert, a.IsCriticalAgeAlert,
            _calc.IsNearExpiry(a.AgeInDays, maxAge, warnPct),
            a.StockDate, a.BatchNumber, a.SupplierName,
            a.InvoiceNumber, a.WarehouseLocation, a.Notes);
    }
}
