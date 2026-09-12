using StockRM.Domain.Enums;

namespace StockRM.Application.DTOs;

// ─── Silo Stock ─────────────────────────────────────────────────────────────

public record SiloStockDto(
    int Id,
    int SiloId,
    string SiloCode,
    string SiloName,
    int MaterialId,
    string MaterialCode,
    string MaterialName,
    DateTime ReceiptDate,
    int AgeInDays,
    int MaxStorageAgeDays,
    decimal AgePercent,
    decimal OpeningStockTons,
    decimal IntakeTons,
    decimal DispatchTons,
    decimal ClosingStockTons,
    decimal CapacityTons,
    decimal FillPercent,
    decimal AverageDailyConsumptionTons,
    decimal DayOnHand,
    bool IsLowStockAlert,
    bool IsCriticalAgeAlert,
    bool IsNearExpiryAlert,
    DateTime StockDate,
    string? BatchNumber,
    string? SupplierName,
    string? Notes);

public record CreateSiloStockDto(
    int SiloId,
    int MaterialId,
    DateTime ReceiptDate,
    decimal OpeningStockTons,
    decimal IntakeTons,
    decimal DispatchTons,
    DateTime StockDate,
    string? BatchNumber = null,
    string? SupplierName = null,
    string? Notes = null);

public record UpdateSiloStockDto(
    decimal OpeningStockTons,
    decimal IntakeTons,
    decimal DispatchTons,
    decimal AverageDailyConsumptionTons,
    string? BatchNumber,
    string? SupplierName,
    string? Notes);

// ─── Additive Stock ──────────────────────────────────────────────────────────

public record AdditiveStockDto(
    int Id,
    int MaterialId,
    string MaterialCode,
    string MaterialName,
    DateTime ReceiptDate,
    int AgeInDays,
    int MaxStorageAgeDays,
    decimal AgePercent,
    decimal OpeningStockTons,
    decimal ReceiptTons,
    decimal IssueTons,
    decimal ClosingStockTons,
    decimal AverageDailyConsumptionTons,
    decimal DayOnHand,
    bool IsLowStockAlert,
    bool IsCriticalAgeAlert,
    bool IsNearExpiryAlert,
    DateTime StockDate,
    string? BatchNumber,
    string? SupplierName,
    string? InvoiceNumber,
    string? WarehouseLocation,
    string? Notes);

public record CreateAdditiveStockDto(
    int MaterialId,
    DateTime ReceiptDate,
    decimal OpeningStockTons,
    decimal ReceiptTons,
    decimal IssueTons,
    DateTime StockDate,
    string? BatchNumber = null,
    string? SupplierName = null,
    string? InvoiceNumber = null,
    string? WarehouseLocation = null,
    string? Notes = null);

public record UpdateAdditiveStockDto(
    decimal OpeningStockTons,
    decimal ReceiptTons,
    decimal IssueTons,
    decimal AverageDailyConsumptionTons,
    string? BatchNumber,
    string? SupplierName,
    string? InvoiceNumber,
    string? WarehouseLocation,
    string? Notes);

// ─── Stock Transaction ───────────────────────────────────────────────────────

public record StockTransactionDto(
    int Id,
    int MaterialId,
    string MaterialName,
    int? SiloId,
    string? SiloName,
    TransactionType TransactionType,
    string TransactionTypeName,
    decimal QuantityTons,
    DateTime TransactionDate,
    string? BatchNumber,
    string? ReferenceNumber,
    decimal StockBeforeTons,
    decimal StockAfterTons,
    string CreatedBy,
    DateTime CreatedAt,
    string? Notes);

// ─── Alert ───────────────────────────────────────────────────────────────────

public record AlertDto(
    int Id,
    int MaterialId,
    string MaterialCode,
    string MaterialName,
    int? SiloId,
    string? SiloName,
    AlertType AlertType,
    string AlertTypeName,
    AlertSeverity Severity,
    string SeverityName,
    string Message,
    decimal? CurrentValue,
    decimal? ThresholdValue,
    bool IsResolved,
    DateTime AlertDate);

// ─── Dashboard ───────────────────────────────────────────────────────────────

public record DashboardSummaryDto(
    int TotalActiveSilos,
    int TotalActiveAdditives,
    int CriticalAlertCount,
    int WarningAlertCount,
    decimal TotalSiloStockTons,
    decimal TotalAdditiveStockTons,
    IEnumerable<SiloDashboardCardDto> Silos,
    IEnumerable<AdditiveDashboardCardDto> Additives,
    IEnumerable<AlertDto> ActiveAlerts,
    DateTime GeneratedAt);

public record SiloDashboardCardDto(
    int SiloId,
    string SiloCode,
    string SiloName,
    int MaterialId,
    string MaterialCode,
    string MaterialName,
    decimal CurrentStockTons,
    decimal CapacityTons,
    decimal FillPercent,
    decimal DayOnHand,
    int AgeInDays,
    int MaxStorageAgeDays,
    decimal AgePercent,
    bool IsLowStockAlert,
    bool IsCriticalAgeAlert,
    bool IsNearExpiryAlert,
    DateTime? LastReceiptDate,
    string? BatchNumber);

public record AdditiveDashboardCardDto(
    int MaterialId,
    string MaterialCode,
    string MaterialName,
    decimal CurrentStockTons,
    decimal DayOnHand,
    int AgeInDays,
    int MaxStorageAgeDays,
    decimal AgePercent,
    bool IsLowStockAlert,
    bool IsCriticalAgeAlert,
    bool IsNearExpiryAlert,
    DateTime? LastReceiptDate,
    string? WarehouseLocation);

// ─── Report / Analytics ───────────────────────────────────────────────────────

public record StockTrendDto(
    DateTime Date,
    decimal StockTons,
    decimal IntakeTons,
    decimal ConsumptionTons,
    decimal DayOnHand);

public record DailyReportDto(
    DateTime ReportDate,
    IEnumerable<SiloStockDto> SiloStocks,
    IEnumerable<AdditiveStockDto> AdditiveStocks,
    IEnumerable<AlertDto> Alerts,
    string GeneratedBy,
    DateTime GeneratedAt);

// ─── Excel Import ─────────────────────────────────────────────────────────────

public record ExcelImportResultDto(
    int TotalRows,
    int SuccessCount,
    int ErrorCount,
    IEnumerable<string> Errors,
    string FileName,
    DateTime ImportedAt);

// ─── Pagination ───────────────────────────────────────────────────────────────

public record PagedResultDto<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages);
