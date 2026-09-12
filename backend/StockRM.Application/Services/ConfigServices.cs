using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;
using StockRM.Domain.Entities;
using StockRM.Domain.Enums;
using StockRM.Domain.Interfaces;

namespace StockRM.Application.Services;

public class MaterialService : IMaterialService
{
    private readonly IMaterialRepository _repo;
    private readonly IAuditLogRepository _audit;

    public MaterialService(IMaterialRepository repo, IAuditLogRepository audit)
    {
        _repo = repo;
        _audit = audit;
    }

    public async Task<MaterialDto?> GetByIdAsync(int id)
    {
        var m = await _repo.GetByIdAsync(id);
        return m == null ? null : MapToDto(m);
    }

    public async Task<IEnumerable<MaterialDto>> GetAllAsync(bool includeInactive = false)
        => (await _repo.GetAllAsync(includeInactive)).Select(MapToDto);

    public async Task<IEnumerable<MaterialDto>> GetByTypeAsync(MaterialType type)
        => (await _repo.GetByTypeAsync(type)).Select(MapToDto);

    public async Task<MaterialDto> CreateAsync(CreateMaterialDto dto, int userId)
    {
        if (await _repo.ExistsAsync(dto.Code))
            throw new InvalidOperationException($"Material with code '{dto.Code}' already exists.");

        var entity = new Material
        {
            Code = dto.Code.ToUpper(),
            Name = dto.Name,
            NameVi = dto.NameVi,
            Type = dto.Type,
            Unit = dto.Unit,
            Description = dto.Description,
            IsActive = true,
            CreatedBy = userId.ToString()
        };
        var created = await _repo.AddAsync(entity);
        await _audit.AddAsync(new AuditLog {
            UserId = userId, Action = "CREATE_MATERIAL",
            EntityName = "Material", EntityId = created.Id,
            NewValues = System.Text.Json.JsonSerializer.Serialize(dto)
        });
        return MapToDto(created);
    }

    public async Task<MaterialDto> UpdateAsync(int id, UpdateMaterialDto dto, int userId)
    {
        var entity = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Material {id} not found.");
        var oldValues = System.Text.Json.JsonSerializer.Serialize(MapToDto(entity));

        entity.Name = dto.Name;
        entity.NameVi = dto.NameVi;
        entity.Unit = dto.Unit;
        entity.Description = dto.Description;
        entity.IsActive = dto.IsActive;
        entity.UpdatedBy = userId.ToString();

        await _repo.UpdateAsync(entity);
        await _audit.AddAsync(new AuditLog {
            UserId = userId, Action = "UPDATE_MATERIAL",
            EntityName = "Material", EntityId = id,
            OldValues = oldValues,
            NewValues = System.Text.Json.JsonSerializer.Serialize(dto)
        });
        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var entity = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Material {id} not found.");
        await _repo.SoftDeleteAsync(id);
        await _audit.AddAsync(new AuditLog {
            UserId = userId, Action = "DELETE_MATERIAL",
            EntityName = "Material", EntityId = id
        });
    }

    private static MaterialDto MapToDto(Material m) => new(
        m.Id, m.Code, m.Name, m.NameVi, m.Type, m.Type.ToString(),
        m.Unit, m.Description, m.IsActive,
        m.AgeStandard == null ? null : new AgeStandardDto(
            m.AgeStandard.Id, m.AgeStandard.MaterialId, m.Name,
            m.AgeStandard.MaxStorageAgeDays,
            m.AgeStandard.WarningThresholdPercent, m.AgeStandard.Notes));
}

// ─────────────────────────────────────────────────────────────────────────────

public class AgeStandardService : IAgeStandardService
{
    private readonly IAgeStandardRepository _repo;
    private readonly IMaterialRepository _matRepo;
    private readonly IAuditLogRepository _audit;

    public AgeStandardService(IAgeStandardRepository repo, IMaterialRepository matRepo,
        IAuditLogRepository audit)
    {
        _repo = repo;
        _matRepo = matRepo;
        _audit = audit;
    }

    public async Task<AgeStandardDto?> GetByMaterialIdAsync(int materialId)
    {
        var std = await _repo.GetByMaterialIdAsync(materialId);
        if (std == null) return null;
        var mat = await _matRepo.GetByIdAsync(materialId);
        return MapToDto(std, mat?.Name ?? "");
    }

    public async Task<IEnumerable<AgeStandardDto>> GetAllAsync()
    {
        var all = await _repo.GetAllAsync();
        return all.Select(s => MapToDto(s, s.Material?.Name ?? ""));
    }

    public async Task<AgeStandardDto> CreateOrUpdateAsync(CreateAgeStandardDto dto, int userId)
    {
        var existing = await _repo.GetByMaterialIdAsync(dto.MaterialId);
        var mat = await _matRepo.GetByIdAsync(dto.MaterialId)
            ?? throw new KeyNotFoundException($"Material {dto.MaterialId} not found.");

        if (existing != null)
        {
            existing.MaxStorageAgeDays = dto.MaxStorageAgeDays;
            existing.WarningThresholdPercent = dto.WarningThresholdPercent;
            existing.Notes = dto.Notes;
            existing.UpdatedBy = userId.ToString();
            await _repo.UpdateAsync(existing);
            await _audit.AddAsync(new AuditLog { UserId = userId, Action = "UPDATE_AGE_STANDARD",
                EntityName = "AgeStandard", EntityId = existing.Id });
            return MapToDto(existing, mat.Name);
        }
        else
        {
            var entity = new AgeStandard {
                MaterialId = dto.MaterialId,
                MaxStorageAgeDays = dto.MaxStorageAgeDays,
                WarningThresholdPercent = dto.WarningThresholdPercent,
                Notes = dto.Notes,
                CreatedBy = userId.ToString()
            };
            var created = await _repo.AddAsync(entity);
            await _audit.AddAsync(new AuditLog { UserId = userId, Action = "CREATE_AGE_STANDARD",
                EntityName = "AgeStandard", EntityId = created.Id });
            return MapToDto(created, mat.Name);
        }
    }

    private static AgeStandardDto MapToDto(AgeStandard s, string matName) =>
        new(s.Id, s.MaterialId, matName, s.MaxStorageAgeDays, s.WarningThresholdPercent, s.Notes);
}

// ─────────────────────────────────────────────────────────────────────────────

public class SiloService : ISiloService
{
    private readonly Domain.Interfaces.ISiloStockRepository _siloStockRepo; // for navigation
    private readonly IAuditLogRepository _audit;
    private readonly Infrastructure.Persistence.StockRMDbContext _db;

    // Direct EF access for Silo CRUD (Silo entity doesn't have its own repo interface)
    public SiloService(Infrastructure.Persistence.StockRMDbContext db, IAuditLogRepository audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<SiloDto?> GetByIdAsync(int id)
    {
        var s = await _db.Silos.FindAsync(id);
        return s == null ? null : MapToDto(s);
    }

    public async Task<IEnumerable<SiloDto>> GetAllAsync()
    {
        var silos = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
            .ToListAsync(_db.Silos.Where(s => s.IsActive)
            .OrderBy(s => s.Code));
        return silos.Select(MapToDto);
    }

    public async Task<SiloDto> CreateAsync(CreateSiloDto dto, int userId)
    {
        var entity = new Silo {
            Code = dto.Code.ToUpper(), Name = dto.Name,
            CapacityTons = dto.CapacityTons, Location = dto.Location,
            IsActive = true, CreatedBy = userId.ToString()
        };
        _db.Silos.Add(entity);
        await _db.SaveChangesAsync();
        await _audit.AddAsync(new AuditLog { UserId = userId, Action = "CREATE_SILO",
            EntityName = "Silo", EntityId = entity.Id });
        return MapToDto(entity);
    }

    public async Task<SiloDto> UpdateAsync(int id, CreateSiloDto dto, int userId)
    {
        var entity = await _db.Silos.FindAsync(id)
            ?? throw new KeyNotFoundException($"Silo {id} not found.");
        entity.Name = dto.Name;
        entity.CapacityTons = dto.CapacityTons;
        entity.Location = dto.Location;
        entity.UpdatedBy = userId.ToString();
        await _db.SaveChangesAsync();
        await _audit.AddAsync(new AuditLog { UserId = userId, Action = "UPDATE_SILO",
            EntityName = "Silo", EntityId = id });
        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var entity = await _db.Silos.FindAsync(id)
            ?? throw new KeyNotFoundException($"Silo {id} not found.");
        entity.IsDeleted = true;
        await _db.SaveChangesAsync();
        await _audit.AddAsync(new AuditLog { UserId = userId, Action = "DELETE_SILO",
            EntityName = "Silo", EntityId = id });
    }

    private static SiloDto MapToDto(Silo s) =>
        new(s.Id, s.Code, s.Name, s.CapacityTons, s.Location, s.IsActive);
}
