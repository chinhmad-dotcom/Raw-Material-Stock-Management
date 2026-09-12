using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockRM.Domain.Entities;

namespace StockRM.Infrastructure.Persistence.Configurations;

public class MaterialConfiguration : IEntityTypeConfiguration<Material>
{
    public void Configure(EntityTypeBuilder<Material> builder)
    {
        builder.ToTable("Materials");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Code).IsRequired().HasMaxLength(20);
        builder.Property(m => m.Name).IsRequired().HasMaxLength(150);
        builder.Property(m => m.NameVi).IsRequired().HasMaxLength(150);
        builder.Property(m => m.Unit).IsRequired().HasMaxLength(20);
        builder.Property(m => m.Description).HasMaxLength(500);
        builder.HasIndex(m => m.Code).IsUnique();

        builder.HasOne(m => m.AgeStandard)
               .WithOne(a => a.Material)
               .HasForeignKey<AgeStandard>(a => a.MaterialId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

public class AgeStandardConfiguration : IEntityTypeConfiguration<AgeStandard>
{
    public void Configure(EntityTypeBuilder<AgeStandard> builder)
    {
        builder.ToTable("AgeStandards");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Notes).HasMaxLength(500);
        builder.HasIndex(a => a.MaterialId).IsUnique();
    }
}

public class SiloConfiguration : IEntityTypeConfiguration<Silo>
{
    public void Configure(EntityTypeBuilder<Silo> builder)
    {
        builder.ToTable("Silos");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Code).IsRequired().HasMaxLength(20);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(100);
        builder.Property(s => s.CapacityTons).HasColumnType("decimal(18,4)");
        builder.Property(s => s.Location).HasMaxLength(200);
        builder.HasIndex(s => s.Code).IsUnique();
    }
}

public class SiloStockConfiguration : IEntityTypeConfiguration<SiloStock>
{
    public void Configure(EntityTypeBuilder<SiloStock> builder)
    {
        builder.ToTable("SiloStocks");
        builder.HasKey(s => s.Id);

        // Decimal precision
        builder.Property(s => s.OpeningStockTons).HasColumnType("decimal(18,4)");
        builder.Property(s => s.IntakeTons).HasColumnType("decimal(18,4)");
        builder.Property(s => s.DispatchTons).HasColumnType("decimal(18,4)");
        builder.Property(s => s.ClosingStockTons).HasColumnType("decimal(18,4)");
        builder.Property(s => s.AverageDailyConsumptionTons).HasColumnType("decimal(18,4)");
        builder.Property(s => s.DayOnHand).HasColumnType("decimal(18,4)");

        builder.Property(s => s.BatchNumber).HasMaxLength(100);
        builder.Property(s => s.SupplierName).HasMaxLength(200);
        builder.Property(s => s.Notes).HasMaxLength(500);

        // Indexes for common query patterns
        builder.HasIndex(s => s.StockDate);
        builder.HasIndex(s => new { s.SiloId, s.MaterialId, s.StockDate });
        builder.HasIndex(s => s.IsLowStockAlert);
        builder.HasIndex(s => s.IsCriticalAgeAlert);

        builder.HasOne(s => s.Silo)
               .WithMany(si => si.SiloStocks)
               .HasForeignKey(s => s.SiloId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Material)
               .WithMany(m => m.SiloStocks)
               .HasForeignKey(s => s.MaterialId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class AdditiveStockConfiguration : IEntityTypeConfiguration<AdditiveStock>
{
    public void Configure(EntityTypeBuilder<AdditiveStock> builder)
    {
        builder.ToTable("AdditiveStocks");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.OpeningStockTons).HasColumnType("decimal(18,4)");
        builder.Property(a => a.ReceiptTons).HasColumnType("decimal(18,4)");
        builder.Property(a => a.IssueTons).HasColumnType("decimal(18,4)");
        builder.Property(a => a.ClosingStockTons).HasColumnType("decimal(18,4)");
        builder.Property(a => a.AverageDailyConsumptionTons).HasColumnType("decimal(18,4)");
        builder.Property(a => a.DayOnHand).HasColumnType("decimal(18,4)");

        builder.Property(a => a.BatchNumber).HasMaxLength(100);
        builder.Property(a => a.SupplierName).HasMaxLength(200);
        builder.Property(a => a.InvoiceNumber).HasMaxLength(100);
        builder.Property(a => a.WarehouseLocation).HasMaxLength(200);
        builder.Property(a => a.Notes).HasMaxLength(500);

        builder.HasIndex(a => a.StockDate);
        builder.HasIndex(a => new { a.MaterialId, a.StockDate });
        builder.HasIndex(a => a.IsLowStockAlert);
        builder.HasIndex(a => a.IsCriticalAgeAlert);

        builder.HasOne(a => a.Material)
               .WithMany(m => m.AdditiveStocks)
               .HasForeignKey(a => a.MaterialId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class StockTransactionConfiguration : IEntityTypeConfiguration<StockTransaction>
{
    public void Configure(EntityTypeBuilder<StockTransaction> builder)
    {
        builder.ToTable("StockTransactions");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.QuantityTons).HasColumnType("decimal(18,4)");
        builder.Property(t => t.StockBeforeTons).HasColumnType("decimal(18,4)");
        builder.Property(t => t.StockAfterTons).HasColumnType("decimal(18,4)");
        builder.Property(t => t.BatchNumber).HasMaxLength(100);
        builder.Property(t => t.SupplierName).HasMaxLength(200);
        builder.Property(t => t.ReferenceNumber).HasMaxLength(100);
        builder.Property(t => t.Notes).HasMaxLength(500);
        builder.Property(t => t.ImportedFromFile).HasMaxLength(255);

        builder.HasIndex(t => t.TransactionDate);
        builder.HasIndex(t => new { t.MaterialId, t.TransactionDate });

        // Transactions are never deleted — no soft delete filter
        builder.HasOne(t => t.Material)
               .WithMany(m => m.StockTransactions)
               .HasForeignKey(t => t.MaterialId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.User)
               .WithMany(u => u.StockTransactions)
               .HasForeignKey(t => t.UserId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Silo)
               .WithMany()
               .HasForeignKey(t => t.SiloId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Username).IsRequired().HasMaxLength(100);
        builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(255);
        builder.Property(u => u.FullName).IsRequired().HasMaxLength(200);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(200);
        builder.Property(u => u.PhoneNumber).HasMaxLength(20);
        builder.Property(u => u.RefreshToken).HasMaxLength(500);
        builder.HasIndex(u => u.Username).IsUnique();
        builder.HasIndex(u => u.Email).IsUnique();
    }
}

public class AlertConfiguration : IEntityTypeConfiguration<Alert>
{
    public void Configure(EntityTypeBuilder<Alert> builder)
    {
        builder.ToTable("Alerts");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Message).IsRequired().HasMaxLength(500);
        builder.Property(a => a.CurrentValue).HasColumnType("decimal(18,4)");
        builder.Property(a => a.ThresholdValue).HasColumnType("decimal(18,4)");
        builder.HasIndex(a => a.IsResolved);
        builder.HasIndex(a => new { a.MaterialId, a.AlertType, a.IsResolved });

        builder.HasOne(a => a.Material)
               .WithMany()
               .HasForeignKey(a => a.MaterialId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Silo)
               .WithMany()
               .HasForeignKey(a => a.SiloId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Action).IsRequired().HasMaxLength(100);
        builder.Property(a => a.EntityName).IsRequired().HasMaxLength(100);
        builder.Property(a => a.IpAddress).HasMaxLength(50);
        builder.Property(a => a.UserAgent).HasMaxLength(500);
        builder.HasIndex(a => new { a.UserId, a.CreatedAt });
        builder.HasIndex(a => new { a.EntityName, a.EntityId });

        builder.HasOne(a => a.User)
               .WithMany(u => u.AuditLogs)
               .HasForeignKey(a => a.UserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
