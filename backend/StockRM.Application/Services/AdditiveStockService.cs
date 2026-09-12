using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;
using StockRM.Domain.Entities;
using StockRM.Domain.Enums;
using StockRM.Domain.Interfaces;

namespace StockRM.Application.Services;

public class AdditiveStockService : IAdditiveStockService
{
    private readonly IAdditiveStockRepository _repo;
    private readonly IAgeStandardRepository _ageRepo;
    private readonly IStockTransactionRepository _txRepo;
    private readonly IAuditLogRepository _audit;
    private readonly IAlertService _alertService;
    private readonly StockCalculationService _calc;
    private readonly Infrastructure.Persistence.StockRMDbContext _db;

    public AdditiveStockService(
        IAdditiveStockRepository repo,
        IAgeStandardRepository ageRepo,
        IStockTransactionRepository txRepo,
        IAuditLogRepository audit,
        IAlertService alertService,
        StockCalculationService calc,
        Infrastructure.Persistence.StockRMDbContext db)
    {
        _repo = repo;
        _ageRepo = ageRepo;
        _txRepo = txRepo;
        _audit = audit;
        _alertService = alertService;
        _calc = calc;
        _db = db;
    }

    public async Task<AdditiveStockDto?> GetByIdAsync(int id)
    {
        var a = await _repo.GetByIdAsync(id);
        return a == null ? null : await MapToDtoAsync(a);
    }

    public async Task<IEnumerable<AdditiveStockDto>> GetByDateAsync(DateTime date)
        => await MapManyAsync(await _repo.GetByDateAsync(date));

    public async Task<IEnumerable<AdditiveStockDto>> GetByMaterialAsync(int materialId, DateTime? from, DateTime? to)
        => await MapManyAsync(await _repo.GetByMaterialIdAsync(materialId, from, to));

    public async Task<PagedResultDto<StockTransactionDto>> GetTransactionsAsync(
        int page, int pageSize, DateTime? from, DateTime? to)
    {
        var query = _db.StockTransactions
            .Include(t => t.Material)
            .Include(t => t.User)
            .Where(t => t.SiloId == null);

        if (from.HasValue)
            query = query.Where(t => t.TransactionDate >= from.Value);
        if (to.HasValue)
            query = query.Where(t => t.TransactionDate <= to.Value);

        var total = await query.CountAsync();
        
        var items = await query.OrderByDescending(t => t.TransactionDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<StockTransactionDto>(
            items.Select(MapTxToDto),
            total, page, pageSize,
            (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<AdditiveStockDto> CreateAsync(CreateAdditiveStockDto dto, int userId)
    {
        var recent = await _repo.GetRecentForAverageAsync(dto.MaterialId, 7);
        var consumptions = recent.Select(r => r.IssueTons).ToList();

        var entity = new AdditiveStock
        {
            MaterialId = dto.MaterialId,
            ReceiptDate = dto.ReceiptDate,
            OpeningStockTons = dto.OpeningStockTons,
            ReceiptTons = dto.ReceiptTons,
            IssueTons = dto.IssueTons,
            StockDate = dto.StockDate,
            BatchNumber = dto.BatchNumber,
            SupplierName = dto.SupplierName,
            InvoiceNumber = dto.InvoiceNumber,
            WarehouseLocation = dto.WarehouseLocation,
            Notes = dto.Notes,
            CreatedBy = userId.ToString()
        };

        await _calc.EnrichAdditiveStockAsync(entity, consumptions);

        var created = await _repo.AddAsync(entity);

        // Record transaction
        await _txRepo.AddAsync(new StockTransaction
        {
            MaterialId = dto.MaterialId,
            SiloId = null,
            TransactionType = dto.ReceiptTons > 0 ? TransactionType.Receipt : TransactionType.Issue,
            QuantityTons = dto.ReceiptTons > 0 ? dto.ReceiptTons : dto.IssueTons,
            TransactionDate = dto.StockDate,
            BatchNumber = dto.BatchNumber,
            SupplierName = dto.SupplierName,
            ReferenceNumber = dto.InvoiceNumber,
            StockBeforeTons = dto.OpeningStockTons,
            StockAfterTons = entity.ClosingStockTons,
            UserId = userId,
            Notes = dto.Notes
        });

        await _audit.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "CREATE_ADDITIVE_STOCK",
            EntityName = "AdditiveStock",
            EntityId = created.Id,
            NewValues = System.Text.Json.JsonSerializer.Serialize(dto)
        });

        await _alertService.EvaluateAndUpdateAlertsAsync();

        return await MapToDtoAsync(created);
    }

    public async Task<AdditiveStockDto> UpdateAsync(int id, UpdateAdditiveStockDto dto, int userId)
    {
        var entity = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"AdditiveStock {id} not found.");
        var oldValues = System.Text.Json.JsonSerializer.Serialize(entity);

        entity.OpeningStockTons = dto.OpeningStockTons;
        entity.ReceiptTons = dto.ReceiptTons;
        entity.IssueTons = dto.IssueTons;
        entity.BatchNumber = dto.BatchNumber;
        entity.SupplierName = dto.SupplierName;
        entity.InvoiceNumber = dto.InvoiceNumber;
        entity.WarehouseLocation = dto.WarehouseLocation;
        entity.Notes = dto.Notes;
        entity.UpdatedBy = userId.ToString();

        var recent = await _repo.GetRecentForAverageAsync(entity.MaterialId, 7);
        await _calc.EnrichAdditiveStockAsync(entity, recent.Select(r => r.IssueTons));

        await _repo.UpdateAsync(entity);

        await _audit.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "UPDATE_ADDITIVE_STOCK",
            EntityName = "AdditiveStock",
            EntityId = id,
            OldValues = oldValues,
            NewValues = System.Text.Json.JsonSerializer.Serialize(dto)
        });

        await _alertService.EvaluateAndUpdateAlertsAsync();

        return await MapToDtoAsync(entity);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var entity = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"AdditiveStock {id} not found.");
        
        entity.IsDeleted = true;
        await _repo.UpdateAsync(entity);

        await _audit.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "DELETE_ADDITIVE_STOCK",
            EntityName = "AdditiveStock",
            EntityId = id
        });
    }

    public async Task<ExcelImportResultDto> ImportFromExcelAsync(Stream fileStream, string fileName, int userId)
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
            new[] { "ReceiptTons", "Receipt Tons", "Receipt" },
            new[] { "IssueTons", "Issue Tons", "Issue" }
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
                var materialId = await ResolveMaterialIdAsync(worksheet, row, headers);
                var receiptDate = ExcelImportHelper.GetRequiredDate(worksheet, row, headers, new[] { "ReceiptDate", "Receipt Date" }, "ReceiptDate");
                var stockDate = ExcelImportHelper.GetRequiredDate(worksheet, row, headers, new[] { "StockDate", "Stock Date" }, "StockDate");
                var openingStock = ExcelImportHelper.GetRequiredDecimal(worksheet, row, headers, "OpeningStockTons", "Opening Stock Tons", "Opening Stock");
                var receiptTons = ExcelImportHelper.GetRequiredDecimal(worksheet, row, headers, "ReceiptTons", "Receipt Tons", "Receipt");
                var issueTons = ExcelImportHelper.GetRequiredDecimal(worksheet, row, headers, "IssueTons", "Issue Tons", "Issue");
                var batchNumber = ExcelImportHelper.GetOptionalString(worksheet, row, headers, "BatchNumber", "Batch Number");
                var supplierName = ExcelImportHelper.GetOptionalString(worksheet, row, headers, "SupplierName", "Supplier");
                var invoiceNumber = ExcelImportHelper.GetOptionalString(worksheet, row, headers, "InvoiceNumber", "Invoice Number", "Invoice");
                var warehouseLocation = ExcelImportHelper.GetOptionalString(worksheet, row, headers, "WarehouseLocation", "Warehouse Location", "Location");
                var notes = ExcelImportHelper.GetOptionalString(worksheet, row, headers, "Notes", "Remarks");

                var recent = await _repo.GetRecentForAverageAsync(materialId, 7);
                var consumptions = recent.Select(r => r.IssueTons).ToList();

                var entity = new AdditiveStock
                {
                    MaterialId = materialId,
                    ReceiptDate = receiptDate,
                    OpeningStockTons = openingStock,
                    ReceiptTons = receiptTons,
                    IssueTons = issueTons,
                    StockDate = stockDate,
                    BatchNumber = batchNumber,
                    SupplierName = supplierName,
                    InvoiceNumber = invoiceNumber,
                    WarehouseLocation = warehouseLocation,
                    Notes = notes,
                    CreatedBy = userId.ToString()
                };

                await _calc.EnrichAdditiveStockAsync(entity, consumptions);
                var created = await _repo.AddAsync(entity);

                await _txRepo.AddAsync(new StockTransaction
                {
                    MaterialId = materialId,
                    SiloId = null,
                    TransactionType = receiptTons > 0 ? TransactionType.Receipt : TransactionType.Issue,
                    QuantityTons = receiptTons > 0 ? receiptTons : issueTons,
                    TransactionDate = stockDate,
                    BatchNumber = batchNumber,
                    SupplierName = supplierName,
                    ReferenceNumber = invoiceNumber,
                    StockBeforeTons = openingStock,
                    StockAfterTons = entity.ClosingStockTons,
                    ImportedFromFile = fileName,
                    UserId = userId,
                    Notes = notes
                });

                await _audit.AddAsync(new AuditLog
                {
                    UserId = userId,
                    Action = "IMPORT_ADDITIVE_STOCK",
                    EntityName = "AdditiveStock",
                    EntityId = created.Id,
                    NewValues = System.Text.Json.JsonSerializer.Serialize(new { materialId, receiptDate, openingStock, receiptTons, issueTons, stockDate, batchNumber, supplierName, invoiceNumber, warehouseLocation, notes })
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

    private async Task<IEnumerable<AdditiveStockDto>> MapManyAsync(IEnumerable<AdditiveStock> items)
    {
        var ageStds = (await _ageRepo.GetAllAsync()).ToDictionary(a => a.MaterialId);
        return items.Select(a => MapToDto(a, ageStds));
    }

    private async Task<AdditiveStockDto> MapToDtoAsync(AdditiveStock a)
    {
        var ageStds = (await _ageRepo.GetAllAsync()).ToDictionary(a => a.MaterialId);
        return MapToDto(a, ageStds);
    }

    private AdditiveStockDto MapToDto(AdditiveStock a, Dictionary<int, AgeStandard> ageStds)
    {
        ageStds.TryGetValue(a.MaterialId, out var std);
        int maxAge = std?.MaxStorageAgeDays ?? 0;
        int warnPct = std?.WarningThresholdPercent ?? 80;
        return new AdditiveStockDto(
            a.Id,
            a.MaterialId,
            a.Material?.Code ?? "",
            a.Material?.Name ?? "",
            a.ReceiptDate,
            a.AgeInDays,
            maxAge,
            _calc.CalculateAgePercent(a.AgeInDays, maxAge),
            a.OpeningStockTons,
            a.ReceiptTons,
            a.IssueTons,
            a.ClosingStockTons,
            a.AverageDailyConsumptionTons,
            a.DayOnHand == decimal.MaxValue ? 999 : a.DayOnHand,
            a.IsLowStockAlert,
            a.IsCriticalAgeAlert,
            _calc.IsNearExpiry(a.AgeInDays, maxAge, warnPct),
            a.StockDate,
            a.BatchNumber,
            a.SupplierName,
            a.InvoiceNumber,
            a.WarehouseLocation,
            a.Notes);
    }

    private static StockTransactionDto MapTxToDto(StockTransaction t) => new(
        t.Id, t.MaterialId, t.Material?.Name ?? "", t.SiloId, t.Silo?.Name,
        t.TransactionType, t.TransactionType.ToString(), t.QuantityTons,
        t.TransactionDate, t.BatchNumber, t.ReferenceNumber,
        t.StockBeforeTons, t.StockAfterTons,
        t.User?.Username ?? "", t.CreatedAt, t.Notes);
}
