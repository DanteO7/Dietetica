using backend_proyecto.Repositories;
using Dietetica.Config;
using Dietetica.Models;

namespace Dietetica.Repositories
{
    public interface ISaleItemRepository : IRepository<SaleItem> { }

    public class SaleItemRepository : Repository<SaleItem>, ISaleItemRepository
    {
        private readonly ApplicationDbContext _db;

        public SaleItemRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}