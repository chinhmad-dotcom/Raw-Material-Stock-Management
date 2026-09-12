using StockRM.Domain.Common;

namespace StockRM.Domain.Entities;

/// <summary>
/// Represents a physical Silo tank with capacity tracking
/// </summary>
public class Silo : BaseEntity
{
    public string Code { get; set; } = string.Empty;      // e.g., "S01", "S02"
    public string Name { get; set; } = string.Empty;      // e.g., "Silo 1"
    public decimal CapacityTons { get; set; }              // Max physical capacity
    public string? Location { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<SiloStock> SiloStocks { get; set; } = new List<SiloStock>();
}
