using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;
using StockRM.Domain.Entities;
using StockRM.Domain.Interfaces;

namespace StockRM.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepo;
    private readonly IAuditLogRepository _audit;

    public UserService(IUserRepository userRepo, IAuditLogRepository audit)
    {
        _userRepo = userRepo;
        _audit = audit;
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _userRepo.GetByIdAsync(id);
        return user == null ? null : MapToUserDto(user);
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _userRepo.GetAllAsync();
        return users.Select(MapToUserDto);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto, int createdByUserId)
    {
        var existing = await _userRepo.GetByUsernameAsync(dto.Username);
        if (existing != null)
            throw new InvalidOperationException($"Username '{dto.Username}' already exists.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var entity = new AppUser
        {
            Username = dto.Username.ToLower(),
            PasswordHash = passwordHash,
            FullName = dto.FullName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            Role = dto.Role,
            IsActive = true,
            CreatedBy = createdByUserId.ToString()
        };

        var created = await _userRepo.AddAsync(entity);

        await _audit.AddAsync(new AuditLog
        {
            UserId = createdByUserId,
            Action = "CREATE_USER",
            EntityName = "AppUser",
            EntityId = created.Id,
            NewValues = System.Text.Json.JsonSerializer.Serialize(new
            {
                dto.Username,
                dto.FullName,
                dto.Email,
                dto.PhoneNumber,
                dto.Role
            })
        });

        return MapToUserDto(created);
    }

    public async Task<UserDto> UpdateAsync(int id, UpdateUserDto dto, int updatedByUserId)
    {
        var entity = await _userRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"User {id} not found.");

        var oldValues = System.Text.Json.JsonSerializer.Serialize(MapToUserDto(entity));

        entity.FullName = dto.FullName;
        entity.Email = dto.Email;
        entity.PhoneNumber = dto.PhoneNumber;
        entity.Role = dto.Role;
        entity.IsActive = dto.IsActive;
        entity.UpdatedBy = updatedByUserId.ToString();

        await _userRepo.UpdateAsync(entity);

        await _audit.AddAsync(new AuditLog
        {
            UserId = updatedByUserId,
            Action = "UPDATE_USER",
            EntityName = "AppUser",
            EntityId = id,
            OldValues = oldValues,
            NewValues = System.Text.Json.JsonSerializer.Serialize(dto)
        });

        return MapToUserDto(entity);
    }

    public async Task DeleteAsync(int id, int deletedByUserId)
    {
        var entity = await _userRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"User {id} not found.");

        await _userRepo.SoftDeleteAsync(id);

        await _audit.AddAsync(new AuditLog
        {
            UserId = deletedByUserId,
            Action = "DELETE_USER",
            EntityName = "AppUser",
            EntityId = id
        });
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _userRepo.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException($"User {userId} not found.");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Incorrect current password.");

        if (dto.NewPassword != dto.ConfirmPassword)
            throw new InvalidOperationException("New password and confirm password do not match.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedBy = userId.ToString();

        await _userRepo.UpdateAsync(user);

        await _audit.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "CHANGE_PASSWORD",
            EntityName = "AppUser",
            EntityId = userId
        });
    }

    private static UserDto MapToUserDto(AppUser u) => new(
        u.Id,
        u.Username,
        u.FullName,
        u.Email,
        u.PhoneNumber,
        u.Role,
        u.Role.ToString(),
        u.IsActive,
        u.LastLoginAt);
}
