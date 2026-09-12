using StockRM.Domain.Entities;

namespace StockRM.Domain.Interfaces;

public interface ISiloStockRepository
{
    Task<SiloStock?> GetByIdAsync(int id);
    Task<IEnumerable<SiloStock>> GetByDateAsync(DateTime date);
    Task<IEnumerable<SiloStock>> GetBySiloIdAsync(int siloId, DateTime? from = null, DateTime? to = null);
    Task<IEnumerable<SiloStock>> GetByMaterialIdAsync(int materialId, DateTime? from = null, DateTime? to = null);
    Task<SiloStock?> GetLatestBySiloAndMaterialAsync(int siloId, int materialId);
    Task<IEnumerable<SiloStock>> GetAllActiveAlertsAsync();

    /// <summary>Get 7-day history for rolling average consumption calculation</summary>
    Task<IEnumerable<SiloStock>> GetRecentForAverageAsync(int siloId, int materialId, int days = 7);

    Task<SiloStock> AddAsync(SiloStock stock);
    Task UpdateAsync(SiloStock stock);
    Task<IEnumerable<SiloStock>> GetDashboardSnapshotAsync();
}

public interface IAdditiveStockRepository
{
    Task<AdditiveStock?> GetByIdAsync(int id);
    Task<IEnumerable<AdditiveStock>> GetByDateAsync(DateTime date);
    Task<IEnumerable<AdditiveStock>> GetByMaterialIdAsync(int materialId, DateTime? from = null, DateTime? to = null);
    Task<AdditiveStock?> GetLatestByMaterialAsync(int materialId);
    Task<IEnumerable<AdditiveStock>> GetAllActiveAlertsAsync();
    Task<IEnumerable<AdditiveStock>> GetRecentForAverageAsync(int materialId, int days = 7);
    Task<AdditiveStock> AddAsync(AdditiveStock stock);
    Task UpdateAsync(AdditiveStock stock);
    Task<IEnumerable<AdditiveStock>> GetDashboardSnapshotAsync();
}
