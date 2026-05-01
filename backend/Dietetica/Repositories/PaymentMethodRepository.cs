using backend_proyecto.Repositories;
using Dietetica.Config;
using Dietetica.Models;

namespace Dietetica.Repositories
{
    public interface IPaymentMethodRepository : IRepository<PaymentMethod> { }

    public class PaymentMethodRepository : Repository<PaymentMethod>, IPaymentMethodRepository
    {
        private readonly ApplicationDbContext _db;

        public PaymentMethodRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}