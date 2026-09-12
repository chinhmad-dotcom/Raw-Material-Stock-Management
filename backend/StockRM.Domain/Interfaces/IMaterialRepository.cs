using StockRM.Domain.Entities;

namespace StockRM.Domain.Interfaces;

public interface IMaterialRepository
{
    Task<Material?> GetByIdAsync(int id);
    Task<Material?> GetByCodeAsync(string code);
    Task<IEnumerable<Material>> GetAllAsync(bool includeInactive = false);
    Task<IEnumerable<Material>> GetByTypeAsync(Domain.Enums.MaterialType type);
    Task<Material> AddAsync(Material material);
    Task UpdateAsync(Material material);
    Task SoftDeleteAsync(int id);
    Task<bool> ExistsAsync(string code);
}
