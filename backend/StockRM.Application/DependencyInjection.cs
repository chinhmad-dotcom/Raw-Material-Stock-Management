using Microsoft.Extensions.DependencyInjection;
using StockRM.Application.Interfaces;
using StockRM.Application.Services;

namespace StockRM.Application;

/// <summary>
/// Extension method to register all Application layer services into the DI container.
/// Called from WebAPI Program.cs: builder.Services.AddApplicationServices();
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Core calculation engine (singleton — pure logic, no state)
        services.AddSingleton<StockCalculationService>();

        // Business services
        services.AddScoped<IAlertService, AlertService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IMaterialService, MaterialService>();
        services.AddScoped<ISiloStockService, SiloStockService>();
        services.AddScoped<IAdditiveStockService, AdditiveStockService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAgeStandardService, AgeStandardService>();
        services.AddScoped<ISiloService, SiloService>();

        return services;
    }
}
