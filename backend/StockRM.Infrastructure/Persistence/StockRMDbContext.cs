using Microsoft.EntityFrameworkCore;
using StockRM.Domain.Entities;

namespace StockRM.Infrastructure.Persistence;

public class StockRMDbContext : DbContext
{
    public StockRMDbContext(DbContextOptions<StockRMDbContext> options) : base(options) { }

    // ── Tables ───────────────────────────────────────────────────────────────
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Material> Materials => Set<Material>();
    public DbSet<AgeStandard> AgeStandards => Set<AgeStandard>();
    public DbSet<Silo> Silos => Set<Silo>();
    public DbSet<SiloStock> SiloStocks => Set<SiloStock>();
    public DbSet<AdditiveStock> AdditiveStocks => Set<AdditiveStock>();
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(StockRMDbContext).Assembly);

        // Global query filters — exclude soft-deleted records everywhere
        modelBuilder.Entity<AppUser>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Material>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Silo>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<AgeStandard>().HasQueryFilter(e => !e.IsDeleted);
    }

    // ── Audit on SaveChanges ─────────────────────────────────────────────────
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries<Domain.Common.BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }
        return await base.SaveChangesAsync(cancellationToken);
    }
}
