using Microsoft.Extensions.Logging;
using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;
using StockRM.Domain.Entities;
using StockRM.Domain.Enums;
using StockRM.Domain.Interfaces;

namespace StockRM.Application.Services;

/// <summary>
/// Evaluates all stock data and generates/resolves Alert records.
/// Should be called after every stock entry save and on a scheduled basis.
/// </summary>
public class AlertService : IAlertService
{
    private const int LOW_DOH_THRESHOLD = 3;

    private readonly ISiloStockRepository _siloStockRepo;
    private readonly IAdditiveStockRepository _additiveStockRepo;
    private readonly IAgeStandardRepository _ageStandardRepo;
    private readonly IAlertRepository _alertRepo;
    private readonly ILogger<AlertService> _logger;

    public AlertService(
        ISiloStockRepository siloStockRepo,
        IAdditiveStockRepository additiveStockRepo,
        IAgeStandardRepository ageStandardRepo,
        IAlertRepository alertRepo,
        ILogger<AlertService> logger)
    {
        _siloStockRepo = siloStockRepo;
        _additiveStockRepo = additiveStockRepo;
        _ageStandardRepo = ageStandardRepo;
        _alertRepo = alertRepo;
        _logger = logger;
    }

    // ─────────────────────────────────────────────────────────────────────────

    public async Task<IEnumerable<AlertDto>> GetActiveAlertsAsync()
    {
        var alerts = await _alertRepo.GetActiveAlertsAsync();
        return alerts.Select(MapToDto);
    }

    public async Task ResolveAlertAsync(int alertId, int userId)
    {
        await _alertRepo.ResolveAlertAsync(alertId);
        _logger.LogInformation("Alert {AlertId} resolved by user {UserId}", alertId, userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Main Evaluation Engine
    // ─────────────────────────────────────────────────────────────────────────

    public async Task EvaluateAndUpdateAlertsAsync()
    {
        _logger.LogInformation("Starting alert evaluation at {Time}", DateTime.UtcNow);

        var ageStandards = (await _ageStandardRepo.GetAllAsync())
            .ToDictionary(a => a.MaterialId);

        await EvaluateSiloAlertsAsync(ageStandards);
        await EvaluateAdditiveAlertsAsync(ageStandards);

        _logger.LogInformation("Alert evaluation completed at {Time}", DateTime.UtcNow);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Silo Alert Evaluation
    // ─────────────────────────────────────────────────────────────────────────

    private async Task EvaluateSiloAlertsAsync(Dictionary<int, AgeStandard> ageStandards)
    {
        var siloStocks = await _siloStockRepo.GetDashboardSnapshotAsync();

        foreach (var stock in siloStocks)
        {
            // ── Low Stock DOH Alert ──
            if (stock.IsLowStockAlert)
            {
                var severity = stock.DayOnHand < 1
                    ? AlertSeverity.Critical
                    : AlertSeverity.Warning;

                await UpsertAlertAsync(new Alert
                {
                    MaterialId = stock.MaterialId,
                    SiloId = stock.SiloId,
                    AlertType = AlertType.LowStock,
                    Severity = severity,
                    Message = $"[SILO {stock.Silo?.Code}] {stock.Material?.Name}: " +
                              $"DOH = {stock.DayOnHand:F1} days (threshold: {LOW_DOH_THRESHOLD} days)",
                    CurrentValue = stock.DayOnHand,
                    ThresholdValue = LOW_DOH_THRESHOLD,
                    AlertDate = DateTime.UtcNow
                });
            }
            else
            {
                // Auto-resolve if stock has recovered
                await _alertRepo.ResolveByMaterialAsync(stock.MaterialId, AlertType.LowStock);
            }

            // ── Critical Age Alert ──
            if (ageStandards.TryGetValue(stock.MaterialId, out var std))
            {
                int ageInDays = (int)(DateTime.UtcNow.Date - stock.ReceiptDate.Date).TotalDays;

                if (stock.IsCriticalAgeAlert)
                {
                    await UpsertAlertAsync(new Alert
                    {
                        MaterialId = stock.MaterialId,
                        SiloId = stock.SiloId,
                        AlertType = AlertType.CriticalAge,
                        Severity = AlertSeverity.Critical,
                        Message = $"[SILO {stock.Silo?.Code}] {stock.Material?.Name}: " +
                                  $"Age = {ageInDays} days — EXCEEDS max {std.MaxStorageAgeDays} days!",
                        CurrentValue = ageInDays,
                        ThresholdValue = std.MaxStorageAgeDays,
                        AlertDate = DateTime.UtcNow
                    });
                }
                else if (ageInDays >= std.MaxStorageAgeDays * std.WarningThresholdPercent / 100.0)
                {
                    // Near-expiry warning
                    await UpsertAlertAsync(new Alert
                    {
                        MaterialId = stock.MaterialId,
                        SiloId = stock.SiloId,
                        AlertType = AlertType.NearExpiry,
                        Severity = AlertSeverity.Warning,
                        Message = $"[SILO {stock.Silo?.Code}] {stock.Material?.Name}: " +
                                  $"Age = {ageInDays} days — approaching limit of {std.MaxStorageAgeDays} days",
                        CurrentValue = ageInDays,
                        ThresholdValue = std.MaxStorageAgeDays,
                        AlertDate = DateTime.UtcNow
                    });
                }
                else
                {
                    await _alertRepo.ResolveByMaterialAsync(stock.MaterialId, AlertType.CriticalAge);
                    await _alertRepo.ResolveByMaterialAsync(stock.MaterialId, AlertType.NearExpiry);
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Additive Alert Evaluation
    // ─────────────────────────────────────────────────────────────────────────

    private async Task EvaluateAdditiveAlertsAsync(Dictionary<int, AgeStandard> ageStandards)
    {
        var additiveStocks = await _additiveStockRepo.GetDashboardSnapshotAsync();

        foreach (var stock in additiveStocks)
        {
            // ── Low Stock DOH Alert ──
            if (stock.IsLowStockAlert)
            {
                var severity = stock.DayOnHand < 1
                    ? AlertSeverity.Critical
                    : AlertSeverity.Warning;

                await UpsertAlertAsync(new Alert
                {
                    MaterialId = stock.MaterialId,
                    SiloId = null,
                    AlertType = AlertType.LowStock,
                    Severity = severity,
                    Message = $"[ADDITIVE] {stock.Material?.Name}: " +
                              $"DOH = {stock.DayOnHand:F1} days (threshold: {LOW_DOH_THRESHOLD} days)",
                    CurrentValue = stock.DayOnHand,
                    ThresholdValue = LOW_DOH_THRESHOLD,
                    AlertDate = DateTime.UtcNow
                });
            }
            else
            {
                await _alertRepo.ResolveByMaterialAsync(stock.MaterialId, AlertType.LowStock);
            }

            // ── Critical Age Alert ──
            if (ageStandards.TryGetValue(stock.MaterialId, out var std))
            {
                int ageInDays = (int)(DateTime.UtcNow.Date - stock.ReceiptDate.Date).TotalDays;

                if (stock.IsCriticalAgeAlert)
                {
                    await UpsertAlertAsync(new Alert
                    {
                        MaterialId = stock.MaterialId,
                        SiloId = null,
                        AlertType = AlertType.CriticalAge,
                        Severity = AlertSeverity.Critical,
                        Message = $"[ADDITIVE] {stock.Material?.Name}: " +
                                  $"Age = {ageInDays} days — EXCEEDS max {std.MaxStorageAgeDays} days!",
                        CurrentValue = ageInDays,
                        ThresholdValue = std.MaxStorageAgeDays,
                        AlertDate = DateTime.UtcNow
                    });
                }
                else if (ageInDays >= std.MaxStorageAgeDays * std.WarningThresholdPercent / 100.0)
                {
                    await UpsertAlertAsync(new Alert
                    {
                        MaterialId = stock.MaterialId,
                        SiloId = null,
                        AlertType = AlertType.NearExpiry,
                        Severity = AlertSeverity.Warning,
                        Message = $"[ADDITIVE] {stock.Material?.Name}: " +
                                  $"Age = {ageInDays} days — approaching limit of {std.MaxStorageAgeDays} days",
                        CurrentValue = ageInDays,
                        ThresholdValue = std.MaxStorageAgeDays,
                        AlertDate = DateTime.UtcNow
                    });
                }
                else
                {
                    await _alertRepo.ResolveByMaterialAsync(stock.MaterialId, AlertType.CriticalAge);
                    await _alertRepo.ResolveByMaterialAsync(stock.MaterialId, AlertType.NearExpiry);
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────

    private async Task UpsertAlertAsync(Alert alert)
    {
        // Only add if no identical unresolved alert already exists today
        var existing = await _alertRepo.GetByMaterialIdAsync(alert.MaterialId);
        bool alreadyActive = existing.Any(a =>
            !a.IsResolved &&
            a.AlertType == alert.AlertType &&
            a.SiloId == alert.SiloId &&
            a.AlertDate.Date == DateTime.UtcNow.Date);

        if (!alreadyActive)
        {
            await _alertRepo.AddAsync(alert);
            _logger.LogWarning("Alert raised: {Message}", alert.Message);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mapping
    // ─────────────────────────────────────────────────────────────────────────

    private static AlertDto MapToDto(Alert a) => new(
        a.Id,
        a.MaterialId,
        a.Material?.Code ?? "",
        a.Material?.Name ?? "",
        a.SiloId,
        a.Silo?.Name,
        a.AlertType,
        a.AlertType.ToString(),
        a.Severity,
        a.Severity.ToString(),
        a.Message,
        a.CurrentValue,
        a.ThresholdValue,
        a.IsResolved,
        a.AlertDate);
}
