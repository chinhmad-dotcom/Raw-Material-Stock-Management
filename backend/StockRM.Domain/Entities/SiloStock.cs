using StockRM.Domain.Common;

namespace StockRM.Domain.Entities;

/// <summary>
/// Daily stock snapshot for Silo materials — one record per silo per date per material batch
/// </summary>
public class SiloStock : BaseEntity
{
    public int SiloId { get; set; }
    public int MaterialId { get; set; }

    public DateTime ReceiptDate { get; set; }              // Ngày nhập — used for age calculation
    public decimal OpeningStockTons { get; set; }          // Tồn đầu ngày
    public decimal IntakeTons { get; set; }                // Nhập trong ngày
    public decimal DispatchTons { get; set; }              // Xuất trong ngày
    public decimal ClosingStockTons { get; set; }          // Tồn cuối ngày (calculated)
    public decimal AverageDailyConsumptionTons { get; set; } // Tiêu thụ TB/ngày (7-day rolling)

    public DateTime StockDate { get; set; }                // The date this snapshot represents
    public string? BatchNumber { get; set; }               // Số lô
    public string? SupplierName { get; set; }
    public string? Notes { get; set; }

    // Computed / cached values (updated by background job)
    public decimal DayOnHand { get; set; }                 // DOH = ClosingStock / AvgDailyConsumption
    public int AgeInDays { get; set; }                     // Current Date - ReceiptDate
    public bool IsLowStockAlert { get; set; }              // DOH < 3
    public bool IsCriticalAgeAlert { get; set; }           // AgeInDays > MaxStorageAge

    // Navigation
    public Silo Silo { get; set; } = null!;
    public Material Material { get; set; } = null!;
}
