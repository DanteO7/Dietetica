using backend_proyecto.Repositories;
using Dietetica.Config;
using Dietetica.Models;
using Microsoft.EntityFrameworkCore;

namespace Dietetica.Repositories
{
    public interface ICodeRepository : IRepository<Code>
    {
        Task<Code?> GetByValueAsync(string username);
    }

    public class CodeRepository : Repository<Code>, ICodeRepository
    {
        private readonly ApplicationDbContext _db;

        public CodeRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public async Task<Code?> GetByValueAsync(string value)
        {
            return await _db.Codes
                .Include(c => c.Product)
                            .ThenInclude(p => p.Codes)
                .FirstOrDefaultAsync(c => c.Value == value);
        }
    }
}