using StockRM.Domain.Common;

namespace StockRM.Domain.Entities;

/// <summary>
/// Full audit log for Admin review — records all user actions
/// </summary>
public class AuditLog : BaseEntity
{
    public int UserId { get; set; }
    public string Action { get; set; } = string.Empty;        // e.g., "CREATE_SILO_STOCK"
    public string EntityName { get; set; } = string.Empty;    // e.g., "SiloStock"
    public int? EntityId { get; set; }
    public string? OldValues { get; set; }                    // JSON serialized old state
    public string? NewValues { get; set; }                    // JSON serialized new state
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    // Navigation
    public AppUser User { get; set; } = null!;
}
