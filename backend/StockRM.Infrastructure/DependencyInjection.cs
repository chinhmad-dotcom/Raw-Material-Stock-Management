using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StockRM.Domain.Interfaces;
using StockRM.Infrastructure.Persistence;
using StockRM.Infrastructure.Repositories;
using StockRM.Infrastructure.Services;

namespace StockRM.Infrastructure;

/// <summary>
/// Registers all Infrastructure layer dependencies.
/// Called from WebAPI Program.cs: builder.Services.AddInfrastructureServices(configuration);
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── EF Core ──────────────────────────────────────────────────────────
        services.AddDbContext<StockRMDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                sql => sql.MigrationsAssembly(typeof(StockRMDbContext).Assembly.FullName)
                          .CommandTimeout(60)
                          .EnableRetryOnFailure(3)));

        // ── Repositories ─────────────────────────────────────────────────────
        services.AddScoped<ISiloStockRepository, SiloStockRepository>();
        services.AddScoped<IAdditiveStockRepository, AdditiveStockRepository>();
        services.AddScoped<IMaterialRepository, MaterialRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAgeStandardRepository, AgeStandardRepository>();
        services.AddScoped<IAlertRepository, AlertRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IStockTransactionRepository, StockTransactionRepository>();

        // ── Infrastructure Services ───────────────────────────────────────────
        services.AddScoped<IJwtService, JwtService>();

        return services;
    }
}
