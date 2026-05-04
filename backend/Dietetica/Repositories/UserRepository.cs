using backend_proyecto.Repositories;
using Dietetica.Config;
using Dietetica.Models;
using Microsoft.EntityFrameworkCore;

namespace Dietetica.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByUsernameAsync(string username);
    }

    public class UserRepository : Repository<User>, IUserRepository
    {
        private readonly ApplicationDbContext _db;

        public UserRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _db.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
        }
    }
}