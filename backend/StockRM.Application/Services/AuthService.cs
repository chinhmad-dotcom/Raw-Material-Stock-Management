using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;
using StockRM.Domain.Entities;
using StockRM.Domain.Interfaces;
using StockRM.Infrastructure.Services;

namespace StockRM.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly IJwtService _jwt;
    private readonly IConfiguration _config;

    public AuthService(IUserRepository userRepo, IJwtService jwt, IConfiguration config)
    {
        _userRepo = userRepo;
        _jwt = jwt;
        _config = config;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepo.GetByUsernameAsync(request.Username)
            ?? throw new UnauthorizedAccessException("Invalid username or password.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is disabled. Contact administrator.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid username or password.");

        var (accessToken, refreshToken, expiresAt) = GenerateTokens(user);

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(
            int.Parse(_config["Jwt:RefreshTokenDays"] ?? "7"));
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepo.UpdateAsync(user);

        return new LoginResponseDto(accessToken, refreshToken, expiresAt, MapToUserDto(user));
    }

    public async Task<LoginResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var user = await _userRepo.GetByRefreshTokenAsync(refreshToken)
            ?? throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        var (accessToken, newRefreshToken, expiresAt) = GenerateTokens(user);

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(
            int.Parse(_config["Jwt:RefreshTokenDays"] ?? "7"));
        await _userRepo.UpdateAsync(user);

        return new LoginResponseDto(accessToken, newRefreshToken, expiresAt, MapToUserDto(user));
    }

    public async Task LogoutAsync(int userId)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiresAt = null;
            await _userRepo.UpdateAsync(user);
        }
    }

    private (string AccessToken, string RefreshToken, DateTime ExpiresAt) GenerateTokens(AppUser user)
    {
        var accessToken = _jwt.GenerateAccessToken(user.Id, user.Username, user.Role.ToString());
        var refreshToken = _jwt.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(
            int.Parse(_config["Jwt:AccessTokenMinutes"] ?? "60"));
        return (accessToken, refreshToken, expiresAt);
    }

    private static UserDto MapToUserDto(AppUser u) => new(
        u.Id, u.Username, u.FullName, u.Email, u.PhoneNumber,
        u.Role, u.Role.ToString(), u.IsActive, u.LastLoginAt);
}
