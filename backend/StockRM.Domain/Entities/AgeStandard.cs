using StockRM.Domain.Common;

namespace StockRM.Domain.Entities;

/// <summary>
/// Max storage age standard per material (Tiêu chuẩn ngày tuổi tối đa)
/// </summary>
public class AgeStandard : BaseEntity
{
    public int MaterialId { get; set; }
    public int MaxStorageAgeDays { get; set; }           // e.g., 30 days for DDGS
    public int WarningThresholdPercent { get; set; } = 80; // Warn at 80% of max age
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public Material Material { get; set; } = null!;
}
