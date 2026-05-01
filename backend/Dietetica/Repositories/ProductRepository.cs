using backend_proyecto.Repositories;
using Dietetica.Config;
using Dietetica.Models;
using Microsoft.EntityFrameworkCore;

namespace Dietetica.Repositories
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<List<Product>> GetByIdsAsync(List<int> ids);
    }
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        private readonly ApplicationDbContext _db;

        public ProductRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public async Task<List<Product>> GetByIdsAsync(List<int> ids)
        {
            return await _db.Products
                .Where(p => ids.Contains(p.Id))
                .ToListAsync();
        }
    }
}