using StockRM.Domain.Enums;

namespace StockRM.Application.DTOs;

// ─── Auth ───────────────────────────────────────────────────────────────────

public record LoginRequestDto(string Username, string Password);

public record LoginResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User);

public record RefreshTokenRequestDto(string RefreshToken);

// ─── User ───────────────────────────────────────────────────────────────────

public record UserDto(
    int Id,
    string Username,
    string FullName,
    string Email,
    string? PhoneNumber,
    UserRole Role,
    string RoleName,
    bool IsActive,
    DateTime? LastLoginAt);

public record CreateUserDto(
    string Username,
    string Password,
    string FullName,
    string Email,
    string? PhoneNumber,
    UserRole Role);

public record UpdateUserDto(
    string FullName,
    string Email,
    string? PhoneNumber,
    UserRole Role,
    bool IsActive);

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword,
    string ConfirmPassword);

// ─── Material ───────────────────────────────────────────────────────────────

public record MaterialDto(
    int Id,
    string Code,
    string Name,
    string NameVi,
    MaterialType Type,
    string TypeName,
    string Unit,
    string? Description,
    bool IsActive,
    AgeStandardDto? AgeStandard);

public record CreateMaterialDto(
    string Code,
    string Name,
    string NameVi,
    MaterialType Type,
    string Unit = "Ton",
    string? Description = null);

public record UpdateMaterialDto(
    string Name,
    string NameVi,
    string Unit,
    string? Description,
    bool IsActive);

// ─── Age Standard ───────────────────────────────────────────────────────────

public record AgeStandardDto(
    int Id,
    int MaterialId,
    string MaterialName,
    int MaxStorageAgeDays,
    int WarningThresholdPercent,
    string? Notes);

public record CreateAgeStandardDto(
    int MaterialId,
    int MaxStorageAgeDays,
    int WarningThresholdPercent = 80,
    string? Notes = null);

public record UpdateAgeStandardDto(
    int MaxStorageAgeDays,
    int WarningThresholdPercent,
    string? Notes);

// ─── Silo ───────────────────────────────────────────────────────────────────

public record SiloDto(
    int Id,
    string Code,
    string Name,
    decimal CapacityTons,
    string? Location,
    bool IsActive);

public record CreateSiloDto(
    string Code,
    string Name,
    decimal CapacityTons,
    string? Location = null);
