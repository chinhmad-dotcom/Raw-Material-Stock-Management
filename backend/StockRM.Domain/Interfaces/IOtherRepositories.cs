using StockRM.Domain.Entities;

namespace StockRM.Domain.Interfaces;

public interface IUserRepository
{
    Task<AppUser?> GetByIdAsync(int id);
    Task<AppUser?> GetByUsernameAsync(string username);
    Task<AppUser?> GetByRefreshTokenAsync(string refreshToken);
    Task<IEnumerable<AppUser>> GetAllAsync();
    Task<AppUser> AddAsync(AppUser user);
    Task UpdateAsync(AppUser user);
    Task SoftDeleteAsync(int id);
}

public interface IAgeStandardRepository
{
    Task<AgeStandard?> GetByMaterialIdAsync(int materialId);
    Task<IEnumerable<AgeStandard>> GetAllAsync();
    Task<AgeStandard> AddAsync(AgeStandard standard);
    Task UpdateAsync(AgeStandard standard);
}

public interface IAlertRepository
{
    Task<IEnumerable<Alert>> GetActiveAlertsAsync();
    Task<IEnumerable<Alert>> GetByMaterialIdAsync(int materialId);
    Task<Alert> AddAsync(Alert alert);
    Task ResolveAlertAsync(int alertId);
    Task ResolveByMaterialAsync(int materialId, Domain.Enums.AlertType type);
}

public interface IAuditLogRepository
{
    Task AddAsync(AuditLog log);
    Task<IEnumerable<AuditLog>> GetByUserIdAsync(int userId, int page = 1, int pageSize = 50);
    Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityName, int entityId);
    Task<IEnumerable<AuditLog>> GetRecentAsync(int count = 100);
}

public interface IStockTransactionRepository
{
    Task<StockTransaction> AddAsync(StockTransaction transaction);
    Task<IEnumerable<StockTransaction>> GetByMaterialAsync(int materialId, DateTime? from = null, DateTime? to = null);
    Task<IEnumerable<StockTransaction>> GetBySiloAsync(int siloId, DateTime? from = null, DateTime? to = null);
    Task<IEnumerable<StockTransaction>> GetRecentAsync(int count = 50);
}
