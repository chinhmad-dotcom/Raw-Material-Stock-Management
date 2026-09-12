using StockRM.Application.DTOs;
using StockRM.Domain.Enums;

namespace StockRM.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task<LoginResponseDto> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(int userId);
}

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(int id);
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto> CreateAsync(CreateUserDto dto, int createdByUserId);
    Task<UserDto> UpdateAsync(int id, UpdateUserDto dto, int updatedByUserId);
    Task DeleteAsync(int id, int deletedByUserId);
    Task ChangePasswordAsync(int userId, ChangePasswordDto dto);
}

public interface IMaterialService
{
    Task<MaterialDto?> GetByIdAsync(int id);
    Task<IEnumerable<MaterialDto>> GetAllAsync(bool includeInactive = false);
    Task<IEnumerable<MaterialDto>> GetByTypeAsync(MaterialType type);
    Task<MaterialDto> CreateAsync(CreateMaterialDto dto, int userId);
    Task<MaterialDto> UpdateAsync(int id, UpdateMaterialDto dto, int userId);
    Task DeleteAsync(int id, int userId);
}

public interface IAgeStandardService
{
    Task<AgeStandardDto?> GetByMaterialIdAsync(int materialId);
    Task<IEnumerable<AgeStandardDto>> GetAllAsync();
    Task<AgeStandardDto> CreateOrUpdateAsync(CreateAgeStandardDto dto, int userId);
}

public interface ISiloService
{
    Task<SiloDto?> GetByIdAsync(int id);
    Task<IEnumerable<SiloDto>> GetAllAsync();
    Task<SiloDto> CreateAsync(CreateSiloDto dto, int userId);
    Task<SiloDto> UpdateAsync(int id, CreateSiloDto dto, int userId);
    Task DeleteAsync(int id, int userId);
}

public interface ISiloStockService
{
    Task<SiloStockDto?> GetByIdAsync(int id);
    Task<IEnumerable<SiloStockDto>> GetByDateAsync(DateTime date);
    Task<IEnumerable<SiloStockDto>> GetBySiloAsync(int siloId, DateTime? from, DateTime? to);
    Task<IEnumerable<SiloStockDto>> GetByMaterialAsync(int materialId, DateTime? from, DateTime? to);
    Task<PagedResultDto<StockTransactionDto>> GetTransactionsAsync(int page, int pageSize, DateTime? from, DateTime? to);
    Task<SiloStockDto> CreateAsync(CreateSiloStockDto dto, int userId);
    Task<SiloStockDto> UpdateAsync(int id, UpdateSiloStockDto dto, int userId);
    Task DeleteAsync(int id, int userId);
    Task<ExcelImportResultDto> ImportFromExcelAsync(Stream fileStream, string fileName, int userId);
}

public interface IAdditiveStockService
{
    Task<AdditiveStockDto?> GetByIdAsync(int id);
    Task<IEnumerable<AdditiveStockDto>> GetByDateAsync(DateTime date);
    Task<IEnumerable<AdditiveStockDto>> GetByMaterialAsync(int materialId, DateTime? from, DateTime? to);
    Task<PagedResultDto<StockTransactionDto>> GetTransactionsAsync(int page, int pageSize, DateTime? from, DateTime? to);
    Task<AdditiveStockDto> CreateAsync(CreateAdditiveStockDto dto, int userId);
    Task<AdditiveStockDto> UpdateAsync(int id, UpdateAdditiveStockDto dto, int userId);
    Task DeleteAsync(int id, int userId);
    Task<ExcelImportResultDto> ImportFromExcelAsync(Stream fileStream, string fileName, int userId);
}

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync();
    Task<IEnumerable<StockTrendDto>> GetSiloTrendAsync(int siloId, int materialId, int days = 30);
    Task<IEnumerable<StockTrendDto>> GetAdditiveTrendAsync(int materialId, int days = 30);
    Task<DailyReportDto> GetDailyReportAsync(DateTime date);
}

public interface IAlertService
{
    Task<IEnumerable<AlertDto>> GetActiveAlertsAsync();
    Task EvaluateAndUpdateAlertsAsync();   // Called by scheduled job or after every stock entry
    Task ResolveAlertAsync(int alertId, int userId);
}
