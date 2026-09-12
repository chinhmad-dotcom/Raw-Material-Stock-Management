using StockRM.Domain.Common;
using StockRM.Domain.Enums;

namespace StockRM.Domain.Entities;

/// <summary>
/// Represents a raw material (e.g., DDGS, Corn, Mycocurb, Betafin)
/// </summary>
public class Material : BaseEntity
{
    public string Code { get; set; } = string.Empty;          // e.g., "DDGS", "CORN"
    public string Name { get; set; } = string.Empty;          // e.g., "Distillers Dried Grains"
    public string NameVi { get; set; } = string.Empty;        // Vietnamese name
    public MaterialType Type { get; set; }                     // Silo or Additive
    public string Unit { get; set; } = "Ton";                 // Measurement unit
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public AgeStandard? AgeStandard { get; set; }
    public ICollection<SiloStock> SiloStocks { get; set; } = new List<SiloStock>();
    public ICollection<AdditiveStock> AdditiveStocks { get; set; } = new List<AdditiveStock>();
    public ICollection<StockTransaction> StockTransactions { get; set; } = new List<StockTransaction>();
}
