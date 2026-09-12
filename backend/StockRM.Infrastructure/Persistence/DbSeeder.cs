using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using StockRM.Domain.Entities;
using StockRM.Domain.Enums;
using StockRM.Infrastructure.Persistence;

namespace StockRM.Infrastructure.Persistence;

/// <summary>
/// Seeds the database with default admin user, materials, age standards, and silos.
/// Runs only if the data does not already exist (idempotent).
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<StockRMDbContext>();
        var logger = services.GetRequiredService<ILogger<StockRMDbContext>>();

        // ── Users ─────────────────────────────────────────────────────────────
        if (!await db.Users.AnyAsync())
        {
            logger.LogInformation("Seeding default users...");
            db.Users.AddRange(
                new AppUser
                {
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    FullName = "System Administrator",
                    Email = "admin@stockrm.local",
                    Role = UserRole.Admin,
                    IsActive = true
                },
                new AppUser
                {
                    Username = "silo.op",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Silo@123"),
                    FullName = "Nhân viên Silo",
                    Email = "silo@stockrm.local",
                    Role = UserRole.SiloOperator,
                    IsActive = true
                },
                new AppUser
                {
                    Username = "wh.op",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Warehouse@123"),
                    FullName = "Nhân viên Kho",
                    Email = "warehouse@stockrm.local",
                    Role = UserRole.WarehouseOperator,
                    IsActive = true
                },
                new AppUser
                {
                    Username = "director",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Director@123"),
                    FullName = "Ban Giám Đốc",
                    Email = "director@stockrm.local",
                    Role = UserRole.BoardOfDirectors,
                    IsActive = true
                });
            await db.SaveChangesAsync();
        }

        // ── Materials ─────────────────────────────────────────────────────────
        if (!await db.Materials.AnyAsync())
        {
            logger.LogInformation("Seeding materials...");
            db.Materials.AddRange(
                // Silo materials
                new Material { Code = "DDGS",   Name = "Distillers Dried Grains with Solubles", NameVi = "Bã rượu ngô sấy khô", Type = MaterialType.Silo,     Unit = "Ton", IsActive = true },
                new Material { Code = "RBF",    Name = "Rice Bran Full Fat",                    NameVi = "Cám gạo nguyên dầu",   Type = MaterialType.Silo,     Unit = "Ton", IsActive = true },
                new Material { Code = "CORN",   Name = "Corn / Maize",                          NameVi = "Ngô hạt",               Type = MaterialType.Silo,     Unit = "Ton", IsActive = true },
                new Material { Code = "WHEAT",  Name = "Wheat",                                 NameVi = "Lúa mì",                Type = MaterialType.Silo,     Unit = "Ton", IsActive = true },
                new Material { Code = "SOYA",   Name = "Soybean Meal",                          NameVi = "Khô đậu nành",          Type = MaterialType.Silo,     Unit = "Ton", IsActive = true },
                // Additive materials
                new Material { Code = "MYCOC",  Name = "Mycocurb",                              NameVi = "Mycocurb",              Type = MaterialType.Additive, Unit = "Ton", IsActive = true },
                new Material { Code = "BETAF",  Name = "Betafin",                               NameVi = "Betafin",               Type = MaterialType.Additive, Unit = "Ton", IsActive = true },
                new Material { Code = "LYSIN",  Name = "L-Lysine HCl",                         NameVi = "L-Lysine",              Type = MaterialType.Additive, Unit = "Ton", IsActive = true },
                new Material { Code = "METHIO", Name = "DL-Methionine",                         NameVi = "DL-Methionine",         Type = MaterialType.Additive, Unit = "Ton", IsActive = true },
                new Material { Code = "VITPRE", Name = "Vitamin Premix",                        NameVi = "Premix Vitamin",        Type = MaterialType.Additive, Unit = "Ton", IsActive = true }
            );
            await db.SaveChangesAsync();
        }

        // ── Age Standards (Tiêu chuẩn ngày tuổi tối đa) ──────────────────────
        if (!await db.AgeStandards.AnyAsync())
        {
            logger.LogInformation("Seeding age standards...");
            var mats = await db.Materials.ToDictionaryAsync(m => m.Code);

            var standards = new List<AgeStandard>();
            void AddStd(string code, int maxDays, int warnPct = 80) {
                if (mats.TryGetValue(code, out var m))
                    standards.Add(new AgeStandard {
                        MaterialId = m.Id,
                        MaxStorageAgeDays = maxDays,
                        WarningThresholdPercent = warnPct
                    });
            }

            AddStd("DDGS",   30, 80);  // 30 days max, warn at 24 days
            AddStd("RBF",    21, 80);  // 21 days max, warn at 17 days
            AddStd("CORN",   90, 80);  // 90 days max, warn at 72 days
            AddStd("WHEAT",  90, 80);
            AddStd("SOYA",   60, 80);
            AddStd("MYCOC",  365, 80); // 1 year max for additives
            AddStd("BETAF",  365, 80);
            AddStd("LYSIN",  365, 80);
            AddStd("METHIO", 365, 80);
            AddStd("VITPRE", 180, 80); // 6 months for vitamin premix

            db.AgeStandards.AddRange(standards);
            await db.SaveChangesAsync();
        }

        // ── Silos ─────────────────────────────────────────────────────────────
        if (!await db.Silos.AnyAsync())
        {
            logger.LogInformation("Seeding silos...");
            db.Silos.AddRange(
                new Silo { Code = "S01", Name = "Silo 01", CapacityTons = 500,  Location = "Khu A", IsActive = true },
                new Silo { Code = "S02", Name = "Silo 02", CapacityTons = 500,  Location = "Khu A", IsActive = true },
                new Silo { Code = "S03", Name = "Silo 03", CapacityTons = 1000, Location = "Khu B", IsActive = true },
                new Silo { Code = "S04", Name = "Silo 04", CapacityTons = 1000, Location = "Khu B", IsActive = true },
                new Silo { Code = "S05", Name = "Silo 05", CapacityTons = 800,  Location = "Khu C", IsActive = true }
            );
            await db.SaveChangesAsync();
        }

        logger.LogInformation("Database seeding completed.");
    }
}
