using Microsoft.EntityFrameworkCore;
using StockRM.Domain.Entities;
using StockRM.Domain.Interfaces;
using StockRM.Infrastructure.Persistence;

namespace StockRM.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly StockRMDbContext _db;
    public UserRepository(StockRMDbContext db) => _db = db;

    public async Task<AppUser?> GetByIdAsync(int id) =>
        await _db.Users.FirstOrDefaultAsync(u => u.Id == id);

    public async Task<AppUser?> GetByUsernameAsync(string username) =>
        await _db.Users.FirstOrDefaultAsync(u => u.Username == username);

    public async Task<AppUser?> GetByRefreshTokenAsync(string refreshToken) =>
        await _db.Users.FirstOrDefaultAsync(u =>
            u.RefreshToken == refreshToken &&
            u.RefreshTokenExpiresAt > DateTime.UtcNow);

    public async Task<IEnumerable<AppUser>> GetAllAsync() =>
        await _db.Users.OrderBy(u => u.FullName).ToListAsync();

    public async Task<AppUser> AddAsync(AppUser user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(AppUser user)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public async Task SoftDeleteAsync(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user != null) { user.IsDeleted = true; await _db.SaveChangesAsync(); }
    }
}
