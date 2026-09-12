using StockRM.Domain.Common;
using StockRM.Domain.Enums;

namespace StockRM.Domain.Entities;

/// <summary>
/// Immutable audit trail for every stock movement event
/// </summary>
public class StockTransaction : BaseEntity
{
    public int MaterialId { get; set; }
    public int? SiloId { get; set; }                   // Null for additives
    public TransactionType TransactionType { get; set; }
    public decimal QuantityTons { get; set; }
    public DateTime TransactionDate { get; set; }
    public string? BatchNumber { get; set; }
    public string? SupplierName { get; set; }
    public string? ReferenceNumber { get; set; }       // PO / GRN / dispatch note number
    public string? Notes { get; set; }
    public string? ImportedFromFile { get; set; }      // Excel file name if imported

    // Who performed the transaction
    public int UserId { get; set; }

    // Snapshot values at time of transaction (for auditing)
    public decimal StockBeforeTons { get; set; }
    public decimal StockAfterTons { get; set; }

    // Navigation
    public Material Material { get; set; } = null!;
    public Silo? Silo { get; set; }
    public AppUser User { get; set; } = null!;
}
