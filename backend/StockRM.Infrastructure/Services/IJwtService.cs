namespace StockRM.Infrastructure.Services;

public interface IJwtService
{
    string GenerateAccessToken(int userId, string username, string role);
    string GenerateRefreshToken();
    (int userId, string username, string role)? ValidateToken(string token);
}
