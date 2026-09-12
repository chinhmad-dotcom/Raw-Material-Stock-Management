using StockRM.Domain.Common;

namespace StockRM.Domain.Entities;

/// <summary>
/// Daily stock snapshot for Additive materials (warehouse items)
/// </summary>
public class AdditiveStock : BaseEntity
{
    public int MaterialId { get; set; }

    public DateTime ReceiptDate { get; set; }              // Ngày nhập — used for age calculation
    public decimal OpeningStockTons { get; set; }          // Tồn đầu ngày
    public decimal ReceiptTons { get; set; }               // Nhập trong ngày
    public decimal IssueTons { get; set; }                 // Xuất (cấp phát) trong ngày
    public decimal ClosingStockTons { get; set; }          // Tồn cuối ngày (calculated)
    public decimal AverageDailyConsumptionTons { get; set; } // Tiêu thụ TB/ngày

    public DateTime StockDate { get; set; }
    public string? BatchNumber { get; set; }
    public string? SupplierName { get; set; }
    public string? InvoiceNumber { get; set; }             // Số hóa đơn
    public string? WarehouseLocation { get; set; }         // Vị trí kho
    public string? Notes { get; set; }

    // Computed / cached values
    public decimal DayOnHand { get; set; }
    public int AgeInDays { get; set; }
    public bool IsLowStockAlert { get; set; }
    public bool IsCriticalAgeAlert { get; set; }

    // Navigation
    public Material Material { get; set; } = null!;
}
