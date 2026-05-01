using backend_proyecto.Repositories;
using Dietetica.Config;
using Dietetica.Models;

namespace Dietetica.Repositories
{
    public interface ISaleRepository : IRepository<Sale> { }

    public class SaleRepository : Repository<Sale>, ISaleRepository
    {
        private readonly ApplicationDbContext _db;

        public SaleRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}