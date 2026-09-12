using OfficeOpenXml;
using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;
using StockRM.Domain.Entities;
using StockRM.Domain.Enums;
using StockRM.Domain.Interfaces;

namespace StockRM.Application.Services;

public class SiloStockService : ISiloStockService
{
    private readonly ISiloStockRepository _repo;
    private readonly IAgeStandardRepository _ageRepo;
    private readonly IStockTransactionRepository _txRepo;
    private readonly IAuditLogRepository _audit;
    private readonly IAlertService _alertService;
    private readonly StockCalculationService _calc;
    private readonly Infrastructure.Persistence.StockRMDbContext _db;

    public SiloStockService(
        ISiloStockRepository repo,
        IAgeStandardRepository ageRepo,
        IStockTransactionRepository txRepo,
        IAuditLogRepository audit,
        IAlertService alertService,
        StockCalculationService calc,
        Infrastructure.Persistence.StockRMDbContext db)
    {
        _repo = repo; _ageRepo = ageRepo; _txRepo = txRepo;
        _audit = audit; _alertService = alertService; _calc = calc; _db = db;
    }

    public async Task<SiloStockDto?> GetByIdAsync(int id)
    {
        var s = await _repo.GetByIdAsync(id);
        return s == null ? null : await MapToDtoAsync(s);
    }

    public async Task<IEnumerable<SiloStockDto>> GetByDateAsync(DateTime date)
        => await MapManyAsync(await _repo.GetByDateAsync(date));

    public async Task<IEnumerable<SiloStockDto>> GetBySiloAsync(int siloId, DateTime? from, DateTime? to)
        => await MapManyAsync(await _repo.GetBySiloIdAsync(siloId, from, to));

    public async Task<IEnumerable<SiloStockDto>> GetByMaterialAsync(int materialId, DateTime? from, DateTime? to)
        => await MapManyAsync(await _repo.GetByMaterialIdAsync(materialId, from, to));

    public async Task<PagedResultDto<StockTransactionDto>> GetTransactionsAsync(
        int page, int pageSize, DateTime? from, DateTime? to)
    {
        var allTx = await _txRepo.GetByMaterialAsync(0, from, to); // 0 = all materials
        var paged = allTx.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return new PagedResultDto<StockTransactionDto>(
            paged.Select(MapTxToDto),
            allTx.Count(), page, pageSize,
            (int)Math.Ceiling(allTx.Count() / (double)pageSize));
    }

    public async Task<SiloStockDto> CreateAsync(CreateSiloStockDto dto, int userId)
    {
        // Retrieve recent consumption for rolling average
        var recent = await _repo.GetRecentForAverageAsync(dto.SiloId, dto.MaterialId, 7);
        var consumptions = recent.Select(r => r.DispatchTons).ToList();

        var entity = new SiloStock
        {
            SiloId = dto.SiloId,
            MaterialId = dto.MaterialId,
            ReceiptDate = dto.ReceiptDate,
            OpeningStockTons = dto.OpeningStockTons,
            IntakeTons = dto.IntakeTons,
            DispatchTons = dto.DispatchTons,
            StockDate = dto.StockDate,
            BatchNumber = dto.BatchNumber,
            SupplierName = dto.SupplierName,
            Notes = dto.Notes,
            CreatedBy = userId.ToString()
        };

        await _calc.EnrichSiloStockAsync(entity, consumptions, GetSiloCapacity(dto.SiloId));

        var created = await _repo.AddAsync(entity);

        // Record transaction
        await _txRepo.AddAsync(new StockTransaction
        {
            MaterialId = dto.MaterialId,
            SiloId = dto.SiloId,
            TransactionType = dto.IntakeTons > 0 ? TransactionType.Intake : TransactionType.Dispatch,
            QuantityTons = dto.IntakeTons > 0 ? dto.IntakeTons : dto.DispatchTons,
            TransactionDate = dto.StockDate,
            BatchNumber = dto.BatchNumber,
            StockBeforeTons = dto.OpeningStockTons,
            StockAfterTons = entity.ClosingStockTons,
            UserId = userId
        });

        await _audit.AddAsync(new AuditLog { UserId = userId, Action = "CREATE_SILO_STOCK",
            EntityName = "SiloStock", EntityId = created.Id });

        // Re-evaluate all alerts after stock change
        await _alertService.EvaluateAndUpdateAlertsAsync();

        return await MapToDtoAsync(created);
    }

    public async Task<SiloStockDto> UpdateAsync(int id, UpdateSiloStockDto dto, int userId)
    {
        var entity = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"SiloStock {id} not found.");
        var oldValues = System.Text.Json.JsonSerializer.Serialize(entity);

        entity.OpeningStockTons = dto.OpeningStockTons;
        entity.IntakeTons = dto.IntakeTons;
        entity.DispatchTons = dto.DispatchTons;
        entity.BatchNumber = dto.BatchNumber;
        entity.SupplierName = dto.SupplierName;
        entity.Notes = dto.Notes;
        entity.UpdatedBy = userId.ToString();

        var recent = await _repo.GetRecentForAverageAsync(entity.SiloId, entity.MaterialId, 7);
        await _calc.EnrichSiloStockAsync(entity, recent.Select(r => r.DispatchTons),
            GetSiloCapacity(entity.SiloId));

        await _repo.UpdateAsync(entity);
        await _audit.AddAsync(new AuditLog { UserId = userId, Action = "UPDATE_SILO_STOCK",
            EntityName = "SiloStock", EntityId = id, OldValues = oldValues });
        await _alertService.EvaluateAndUpdateAlertsAsync();

        return await MapToDtoAsync(entity);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var entity = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"SiloStock {id} not found.");
        entity.IsDeleted = true;
        await _repo.UpdateAsync(entity);
        await _audit.AddAsync(new AuditLog { UserId = userId, Action = "DELETE_SILO_STOCK",
            EntityName = "SiloStock", EntityId = id });
    }

    public async Task<ExcelImportResultDto> ImportFromExcelAsync(
        Stream fileStream, string fileName, int userId)
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

        using var package = new ExcelPackage(fileStream);
        var worksheet = package.Workbook.Worksheets.FirstOrDefault();
        if (worksheet == null)
        {
            throw new InvalidOperationException("Excel workbook contains no worksheet.");
        }

        var headers = ExcelImportHelper.BuildHeaderMap(worksheet);
        var requiredHeaders = new[]
        {
            new[] { "ReceiptDate", "Receipt Date" },
            new[] { "StockDate", "Stock Date" },
            new[] { "OpeningStockTons", "Opening Stock Tons", "Opening Stock" },
            new[] { "IntakeTons", "Intake Tons", "Intake" },
            new[] { "DispatchTons", "Dispatch Tons", "Dispatch" }
        };
        if (!ExcelImportHelper.TryValidateHeaders(headers, requiredHeaders, out var missingHeaders, out var _))
        {
            throw new InvalidOperationException($"Missing required columns: {string.Join(", ", missingHeaders)}");
        }

        var rowCount = worksheet.Dimension.End.Row;
        var successCount = 0;
        var errorCount = 0;
        var errors = new List<string>();

        for (var row = 2; row <= rowCount; row++)
        {
            if (ExcelImportHelper.IsRowEmpty(worksheet, row, headers.Values))
            {
                continue;
            }

            try
            {
                var siloId = await ResolveSiloIdAsync(worksheet, row, headers);
                var materialId = await ResolveMaterialIdAsync(worksheet, row, headers);
                var receiptDate = ExcelImportHelper.GetRequiredDate(worksheet, row, headers, new[] { "ReceiptDate", "Receipt Date" }, "ReceiptDate");
                var stockDate = ExcelImportHelper.GetRequiredDate(worksheet, row, headers, new[] { "StockDate", "Stock Date" }, "StockDate");
                var openingStock = ExcelImportHelper.GetRequiredDecimal(worksheet, row, headers, "OpeningStockTons", "Opening Stock Tons", "Opening Stock");
                var intakeTons = ExcelImportHelper.GetRequiredDecimal(worksheet, row, headers, "IntakeTons", "Intake Tons", "Intake");
                var dispatchTons = ExcelImportHelper.GetRequiredDecimal(worksheet, row, headers, "DispatchTons", "Dispatch Tons", "Dispatch");
                var batchNumber = ExcelImportHelper.GetOptionalString(worksheet, row, headers, "BatchNumber", "Batch Number");
                var supplierName = ExcelImportHelper.GetOptionalString(worksheet, row, headers, "SupplierName", "Supplier");
                var notes = ExcelImportHelper.GetOptionalString(worksheet, row, headers, "Notes", "Remarks");

                var recent = await _repo.GetRecentForAverageAsync(siloId, materialId, 7);
                var consumptions = recent.Select(r => r.DispatchTons).ToList();

                var entity = new SiloStock
                {
                    SiloId = siloId,
                    MaterialId = materialId,
                    ReceiptDate = receiptDate,
                    OpeningStockTons = openingStock,
                    IntakeTons = intakeTons,
                    DispatchTons = dispatchTons,
                    StockDate = stockDate,
                    BatchNumber = batchNumber,
                    SupplierName = supplierName,
                    Notes = notes,
                    CreatedBy = userId.ToString()
                };

                await _calc.EnrichSiloStockAsync(entity, consumptions, GetSiloCapacity(siloId));
                var created = await _repo.AddAsync(entity);

                await _txRepo.AddAsync(new StockTransaction
                {
                    MaterialId = materialId,
                    SiloId = siloId,
                    TransactionType = intakeTons > 0 ? TransactionType.Intake : TransactionType.Dispatch,
                    QuantityTons = intakeTons > 0 ? intakeTons : dispatchTons,
                    TransactionDate = stockDate,
                    BatchNumber = batchNumber,
                    StockBeforeTons = openingStock,
                    StockAfterTons = entity.ClosingStockTons,
                    ImportedFromFile = fileName,
                    UserId = userId
                });

                await _audit.AddAsync(new AuditLog
                {
                    UserId = userId,
                    Action = "IMPORT_SILO_STOCK",
                    EntityName = "SiloStock",
                    EntityId = created.Id,
                    NewValues = System.Text.Json.JsonSerializer.Serialize(new { siloId, materialId, receiptDate, openingStock, intakeTons, dispatchTons, stockDate, batchNumber, supplierName, notes })
                });

                successCount++;
            }
            catch (Exception ex)
            {
                errorCount++;
                errors.Add($"Row {row}: {ex.Message}");
            }
        }

        if (successCount > 0)
        {
            await _alertService.EvaluateAndUpdateAlertsAsync();
        }

        return new ExcelImportResultDto(rowCount - 1, successCount, errorCount, errors, fileName, DateTime.UtcNow);
    }

    private async Task<int> ResolveSiloIdAsync(ExcelWorksheet sheet, int row, Dictionary<string, int> headers)
    {
        if (ExcelImportHelper.TryGetInt(sheet, row, headers, new[] { "SiloId", "Silo Id" }, out var siloId) && siloId > 0)
        {
            var silo = await _db.Silos.FindAsync(siloId);
            if (silo == null) throw new KeyNotFoundException($"Silo with Id {siloId} not found.");
            return siloId;
        }

        var siloCode = ExcelImportHelper.GetOptionalString(sheet, row, headers, "SiloCode", "Silo Code", "Silo");
        if (!string.IsNullOrWhiteSpace(siloCode))
        {
            var silo = await _db.Silos.FirstOrDefaultAsync(s => s.Code == siloCode.Trim().ToUpper());
            if (silo != null) return silo.Id;
            throw new KeyNotFoundException($"Silo with Code '{siloCode}' not found.");
        }

        throw new InvalidOperationException("Either SiloId or SiloCode is required.");
    }

    private async Task<int> ResolveMaterialIdAsync(ExcelWorksheet sheet, int row, Dictionary<string, int> headers)
    {
        if (ExcelImportHelper.TryGetInt(sheet, row, headers, new[] { "MaterialId", "Material Id" }, out var materialId) && materialId > 0)
        {
            var material = await _db.Materials.FindAsync(materialId);
            if (material == null) throw new KeyNotFoundException($"Material with Id {materialId} not found.");
            return materialId;
        }

        var materialCode = ExcelImportHelper.GetOptionalString(sheet, row, headers, "MaterialCode", "Material Code", "Material");
        if (!string.IsNullOrWhiteSpace(materialCode))
        {
            var material = await _db.Materials.FirstOrDefaultAsync(m => m.Code == materialCode.Trim().ToUpper());
            if (material != null) return material.Id;
            throw new KeyNotFoundException($"Material with Code '{materialCode}' not found.");
        }

        throw new InvalidOperationException("Either MaterialId or MaterialCode is required.");
    }

    // ── Mapping helpers ──────────────────────────────────────────────────────

    private async Task<IEnumerable<SiloStockDto>> MapManyAsync(IEnumerable<SiloStock> items)
    {
        var ageStds = (await _ageRepo.GetAllAsync()).ToDictionary(a => a.MaterialId);
        return items.Select(s => MapToDto(s, ageStds));
    }

    private async Task<SiloStockDto> MapToDtoAsync(SiloStock s)
    {
        var ageStds = (await _ageRepo.GetAllAsync()).ToDictionary(a => a.MaterialId);
        return MapToDto(s, ageStds);
    }

    private SiloStockDto MapToDto(SiloStock s, Dictionary<int, AgeStandard> ageStds)
    {
        ageStds.TryGetValue(s.MaterialId, out var std);
        int maxAge = std?.MaxStorageAgeDays ?? 0;
        int warnPct = std?.WarningThresholdPercent ?? 80;
        decimal cap = s.Silo?.CapacityTons ?? 1;
        return new SiloStockDto(
            s.Id, s.SiloId, s.Silo?.Code ?? "", s.Silo?.Name ?? "",
            s.MaterialId, s.Material?.Code ?? "", s.Material?.Name ?? "",
            s.ReceiptDate, s.AgeInDays, maxAge,
            _calc.CalculateAgePercent(s.AgeInDays, maxAge),
            s.OpeningStockTons, s.IntakeTons, s.DispatchTons, s.ClosingStockTons,
            cap, _calc.CalculateFillPercent(s.ClosingStockTons, cap),
            s.AverageDailyConsumptionTons,
            s.DayOnHand == decimal.MaxValue ? 999 : s.DayOnHand,
            s.IsLowStockAlert, s.IsCriticalAgeAlert,
            _calc.IsNearExpiry(s.AgeInDays, maxAge, warnPct),
            s.StockDate, s.BatchNumber, s.SupplierName, s.Notes);
    }

    private static StockTransactionDto MapTxToDto(StockTransaction t) => new(
        t.Id, t.MaterialId, t.Material?.Name ?? "", t.SiloId, t.Silo?.Name,
        t.TransactionType, t.TransactionType.ToString(), t.QuantityTons,
        t.TransactionDate, t.BatchNumber, t.ReferenceNumber,
        t.StockBeforeTons, t.StockAfterTons,
        t.User?.Username ?? "", t.CreatedAt, t.Notes);

    private decimal GetSiloCapacity(int siloId)
    {
        var silo = _db.Silos.Find(siloId);
        return silo?.CapacityTons ?? 1000m;
    }
}
