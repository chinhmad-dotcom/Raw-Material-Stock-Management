using Microsoft.EntityFrameworkCore;
using StockRM.Domain.Entities;
using StockRM.Domain.Enums;
using StockRM.Domain.Interfaces;
using StockRM.Infrastructure.Persistence;

namespace StockRM.Infrastructure.Repositories;

public class AdditiveStockRepository : IAdditiveStockRepository
{
    private readonly StockRMDbContext _db;
    public AdditiveStockRepository(StockRMDbContext db) => _db = db;

    public async Task<AdditiveStock?> GetByIdAsync(int id) =>
        await _db.AdditiveStocks.Include(a => a.Material).FirstOrDefaultAsync(a => a.Id == id);

    public async Task<IEnumerable<AdditiveStock>> GetByDateAsync(DateTime date) =>
        await _db.AdditiveStocks
            .Include(a => a.Material)
            .Where(a => a.StockDate.Date == date.Date)
            .OrderBy(a => a.Material.Name)
            .ToListAsync();

    public async Task<IEnumerable<AdditiveStock>> GetByMaterialIdAsync(
        int materialId, DateTime? from = null, DateTime? to = null)
    {
        var q = _db.AdditiveStocks.Where(a => a.MaterialId == materialId);
        if (from.HasValue) q = q.Where(a => a.StockDate >= from.Value);
        if (to.HasValue) q = q.Where(a => a.StockDate <= to.Value);
        return await q.OrderByDescending(a => a.StockDate).ToListAsync();
    }

    public async Task<AdditiveStock?> GetLatestByMaterialAsync(int materialId) =>
        await _db.AdditiveStocks
            .Where(a => a.MaterialId == materialId)
            .OrderByDescending(a => a.StockDate)
            .FirstOrDefaultAsync();

    public async Task<IEnumerable<AdditiveStock>> GetAllActiveAlertsAsync() =>
        await _db.AdditiveStocks
            .Include(a => a.Material)
            .Where(a => a.IsLowStockAlert || a.IsCriticalAgeAlert)
            .ToListAsync();

    public async Task<IEnumerable<AdditiveStock>> GetRecentForAverageAsync(
        int materialId, int days = 7) =>
        await _db.AdditiveStocks
            .Where(a => a.MaterialId == materialId &&
                        a.StockDate >= DateTime.UtcNow.Date.AddDays(-days))
            .OrderByDescending(a => a.StockDate)
            .Take(days)
            .ToListAsync();

    public async Task<IEnumerable<AdditiveStock>> GetDashboardSnapshotAsync()
    {
        var latestDates = await _db.AdditiveStocks
            .GroupBy(a => a.MaterialId)
            .Select(g => new { MaterialId = g.Key, LatestDate = g.Max(a => a.StockDate) })
            .ToListAsync();

        var result = new List<AdditiveStock>();
        foreach (var key in latestDates)
        {
            var record = await _db.AdditiveStocks
                .Include(a => a.Material)
                .Where(a => a.MaterialId == key.MaterialId && a.StockDate == key.LatestDate)
                .FirstOrDefaultAsync();
            if (record != null) result.Add(record);
        }
        return result;
    }

    public async Task<AdditiveStock> AddAsync(AdditiveStock stock)
    {
        _db.AdditiveStocks.Add(stock);
        await _db.SaveChangesAsync();
        return stock;
    }

    public async Task UpdateAsync(AdditiveStock stock)
    {
        _db.AdditiveStocks.Update(stock);
        await _db.SaveChangesAsync();
    }
}

// ─────────────────────────────────────────────────────────────────────────────

public class MaterialRepository : Domain.Interfaces.IMaterialRepository
{
    private readonly StockRMDbContext _db;
    public MaterialRepository(StockRMDbContext db) => _db = db;

    public async Task<Material?> GetByIdAsync(int id) =>
        await _db.Materials.Include(m => m.AgeStandard).FirstOrDefaultAsync(m => m.Id == id);

    public async Task<Material?> GetByCodeAsync(string code) =>
        await _db.Materials.Include(m => m.AgeStandard)
            .FirstOrDefaultAsync(m => m.Code == code.ToUpper());

    public async Task<IEnumerable<Material>> GetAllAsync(bool includeInactive = false)
    {
        var q = _db.Materials.Include(m => m.AgeStandard).AsQueryable();
        if (!includeInactive) q = q.Where(m => m.IsActive);
        return await q.OrderBy(m => m.Name).ToListAsync();
    }

    public async Task<IEnumerable<Material>> GetByTypeAsync(MaterialType type) =>
        await _db.Materials.Include(m => m.AgeStandard)
            .Where(m => m.Type == type && m.IsActive)
            .OrderBy(m => m.Name).ToListAsync();

    public async Task<Material> AddAsync(Material material)
    {
        material.Code = material.Code.ToUpper();
        _db.Materials.Add(material);
        await _db.SaveChangesAsync();
        return material;
    }

    public async Task UpdateAsync(Material material)
    {
        _db.Materials.Update(material);
        await _db.SaveChangesAsync();
    }

    public async Task SoftDeleteAsync(int id)
    {
        var m = await _db.Materials.FindAsync(id);
        if (m != null) { m.IsDeleted = true; await _db.SaveChangesAsync(); }
    }

    public async Task<bool> ExistsAsync(string code) =>
        await _db.Materials.AnyAsync(m => m.Code == code.ToUpper());
}

// ─────────────────────────────────────────────────────────────────────────────

public class AlertRepository : IAlertRepository
{
    private readonly StockRMDbContext _db;
    public AlertRepository(StockRMDbContext db) => _db = db;

    public async Task<IEnumerable<Alert>> GetActiveAlertsAsync() =>
        await _db.Alerts
            .Include(a => a.Material)
            .Include(a => a.Silo)
            .Where(a => !a.IsResolved)
            .OrderByDescending(a => (int)a.Severity)
            .ToListAsync();

    public async Task<IEnumerable<Alert>> GetByMaterialIdAsync(int materialId) =>
        await _db.Alerts.Where(a => a.MaterialId == materialId).ToListAsync();

    public async Task<Alert> AddAsync(Alert alert)
    {
        _db.Alerts.Add(alert);
        await _db.SaveChangesAsync();
        return alert;
    }

    public async Task ResolveAlertAsync(int alertId)
    {
        var alert = await _db.Alerts.FindAsync(alertId);
        if (alert != null)
        {
            alert.IsResolved = true;
            alert.ResolvedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task ResolveByMaterialAsync(int materialId, AlertType type)
    {
        var alerts = await _db.Alerts
            .Where(a => a.MaterialId == materialId && a.AlertType == type && !a.IsResolved)
            .ToListAsync();
        foreach (var a in alerts) { a.IsResolved = true; a.ResolvedAt = DateTime.UtcNow; }
        await _db.SaveChangesAsync();
    }
}

// ─────────────────────────────────────────────────────────────────────────────

public class AuditLogRepository : IAuditLogRepository
{
    private readonly StockRMDbContext _db;
    public AuditLogRepository(StockRMDbContext db) => _db = db;

    public async Task AddAsync(AuditLog log)
    {
        _db.AuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetByUserIdAsync(int userId, int page = 1, int pageSize = 50) =>
        await _db.AuditLogs
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync();

    public async Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityName, int entityId) =>
        await _db.AuditLogs
            .Where(l => l.EntityName == entityName && l.EntityId == entityId)
            .OrderByDescending(l => l.CreatedAt).ToListAsync();

    public async Task<IEnumerable<AuditLog>> GetRecentAsync(int count = 100) =>
        await _db.AuditLogs
            .Include(l => l.User)
            .OrderByDescending(l => l.CreatedAt)
            .Take(count).ToListAsync();
}

// ─────────────────────────────────────────────────────────────────────────────

public class AgeStandardRepository : IAgeStandardRepository
{
    private readonly StockRMDbContext _db;
    public AgeStandardRepository(StockRMDbContext db) => _db = db;

    public async Task<AgeStandard?> GetByMaterialIdAsync(int materialId) =>
        await _db.AgeStandards.FirstOrDefaultAsync(a => a.MaterialId == materialId);

    public async Task<IEnumerable<AgeStandard>> GetAllAsync() =>
        await _db.AgeStandards.Include(a => a.Material).ToListAsync();

    public async Task<AgeStandard> AddAsync(AgeStandard standard)
    {
        _db.AgeStandards.Add(standard);
        await _db.SaveChangesAsync();
        return standard;
    }

    public async Task UpdateAsync(AgeStandard standard)
    {
        _db.AgeStandards.Update(standard);
        await _db.SaveChangesAsync();
    }
}

// ─────────────────────────────────────────────────────────────────────────────

public class StockTransactionRepository : IStockTransactionRepository
{
    private readonly StockRMDbContext _db;
    public StockTransactionRepository(StockRMDbContext db) => _db = db;

    public async Task<StockTransaction> AddAsync(StockTransaction transaction)
    {
        _db.StockTransactions.Add(transaction);
        await _db.SaveChangesAsync();
        return transaction;
    }

    public async Task<IEnumerable<StockTransaction>> GetByMaterialAsync(
        int materialId, DateTime? from = null, DateTime? to = null)
    {
        var q = _db.StockTransactions
            .Include(t => t.User)
            .Where(t => t.MaterialId == materialId);
        if (from.HasValue) q = q.Where(t => t.TransactionDate >= from.Value);
        if (to.HasValue) q = q.Where(t => t.TransactionDate <= to.Value);
        return await q.OrderByDescending(t => t.TransactionDate).ToListAsync();
    }

    public async Task<IEnumerable<StockTransaction>> GetBySiloAsync(
        int siloId, DateTime? from = null, DateTime? to = null)
    {
        var q = _db.StockTransactions
            .Include(t => t.Material)
            .Include(t => t.User)
            .Where(t => t.SiloId == siloId);
        if (from.HasValue) q = q.Where(t => t.TransactionDate >= from.Value);
        if (to.HasValue) q = q.Where(t => t.TransactionDate <= to.Value);
        return await q.OrderByDescending(t => t.TransactionDate).ToListAsync();
    }

    public async Task<IEnumerable<StockTransaction>> GetRecentAsync(int count = 50) =>
        await _db.StockTransactions
            .Include(t => t.Material)
            .Include(t => t.User)
            .OrderByDescending(t => t.TransactionDate)
            .Take(count).ToListAsync();
}
