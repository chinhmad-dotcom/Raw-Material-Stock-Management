using StockRM.Domain.Common;
using StockRM.Domain.Enums;

namespace StockRM.Domain.Entities;

/// <summary>
/// System-generated alerts that are persisted for dashboard display
/// </summary>
public class Alert : BaseEntity
{
    public int MaterialId { get; set; }
    public int? SiloId { get; set; }
    public AlertType AlertType { get; set; }
    public AlertSeverity Severity { get; set; }
    public string Message { get; set; } = string.Empty;
    public decimal? CurrentValue { get; set; }      // e.g., DOH = 1.5 days
    public decimal? ThresholdValue { get; set; }    // e.g., Threshold = 3 days
    public bool IsResolved { get; set; } = false;
    public DateTime? ResolvedAt { get; set; }
    public DateTime AlertDate { get; set; } = DateTime.UtcNow;

    // Navigation
    public Material Material { get; set; } = null!;
    public Silo? Silo { get; set; }
}
