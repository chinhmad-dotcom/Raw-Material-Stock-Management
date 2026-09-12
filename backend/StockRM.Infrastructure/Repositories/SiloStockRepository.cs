using Microsoft.EntityFrameworkCore;
using StockRM.Domain.Entities;
using StockRM.Domain.Interfaces;
using StockRM.Infrastructure.Persistence;

namespace StockRM.Infrastructure.Repositories;

public class SiloStockRepository : ISiloStockRepository
{
    private readonly StockRMDbContext _db;
    public SiloStockRepository(StockRMDbContext db) => _db = db;

    public async Task<SiloStock?> GetByIdAsync(int id) =>
        await _db.SiloStocks
            .Include(s => s.Silo)
            .Include(s => s.Material)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<IEnumerable<SiloStock>> GetByDateAsync(DateTime date) =>
        await _db.SiloStocks
            .Include(s => s.Silo)
            .Include(s => s.Material)
            .Where(s => s.StockDate.Date == date.Date)
            .OrderBy(s => s.Silo.Code)
            .ToListAsync();

    public async Task<IEnumerable<SiloStock>> GetBySiloIdAsync(
        int siloId, DateTime? from = null, DateTime? to = null)
    {
        var q = _db.SiloStocks
            .Include(s => s.Material)
            .Where(s => s.SiloId == siloId);
        if (from.HasValue) q = q.Where(s => s.StockDate >= from.Value);
        if (to.HasValue) q = q.Where(s => s.StockDate <= to.Value);
        return await q.OrderByDescending(s => s.StockDate).ToListAsync();
    }

    public async Task<IEnumerable<SiloStock>> GetByMaterialIdAsync(
        int materialId, DateTime? from = null, DateTime? to = null)
    {
        var q = _db.SiloStocks
            .Include(s => s.Silo)
            .Where(s => s.MaterialId == materialId);
        if (from.HasValue) q = q.Where(s => s.StockDate >= from.Value);
        if (to.HasValue) q = q.Where(s => s.StockDate <= to.Value);
        return await q.OrderByDescending(s => s.StockDate).ToListAsync();
    }

    public async Task<SiloStock?> GetLatestBySiloAndMaterialAsync(int siloId, int materialId) =>
        await _db.SiloStocks
            .Where(s => s.SiloId == siloId && s.MaterialId == materialId)
            .OrderByDescending(s => s.StockDate)
            .FirstOrDefaultAsync();

    public async Task<IEnumerable<SiloStock>> GetAllActiveAlertsAsync() =>
        await _db.SiloStocks
            .Include(s => s.Silo)
            .Include(s => s.Material)
            .Where(s => s.IsLowStockAlert || s.IsCriticalAgeAlert)
            .ToListAsync();

    public async Task<IEnumerable<SiloStock>> GetRecentForAverageAsync(
        int siloId, int materialId, int days = 7) =>
        await _db.SiloStocks
            .Where(s => s.SiloId == siloId && s.MaterialId == materialId &&
                        s.StockDate >= DateTime.UtcNow.Date.AddDays(-days))
            .OrderByDescending(s => s.StockDate)
            .Take(days)
            .ToListAsync();

    /// <summary>
    /// Returns ONE latest record per (Silo, Material) pair — used for dashboard cards.
    /// Uses a subquery to get the most recent StockDate per group.
    /// </summary>
    public async Task<IEnumerable<SiloStock>> GetDashboardSnapshotAsync()
    {
        // Get the max date per silo+material combination
        var latestDates = await _db.SiloStocks
            .GroupBy(s => new { s.SiloId, s.MaterialId })
            .Select(g => new
            {
                g.Key.SiloId,
                g.Key.MaterialId,
                LatestDate = g.Max(s => s.StockDate)
            })
            .ToListAsync();

        // Load those specific records with navigation properties
        var result = new List<SiloStock>();
        foreach (var key in latestDates)
        {
            var record = await _db.SiloStocks
                .Include(s => s.Silo)
                .Include(s => s.Material)
                .Where(s => s.SiloId == key.SiloId &&
                            s.MaterialId == key.MaterialId &&
                            s.StockDate == key.LatestDate)
                .FirstOrDefaultAsync();
            if (record != null) result.Add(record);
        }
        return result;
    }

    public async Task<SiloStock> AddAsync(SiloStock stock)
    {
        _db.SiloStocks.Add(stock);
        await _db.SaveChangesAsync();
        return stock;
    }

    public async Task UpdateAsync(SiloStock stock)
    {
        _db.SiloStocks.Update(stock);
        await _db.SaveChangesAsync();
    }
}
