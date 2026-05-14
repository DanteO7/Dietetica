using AutoMapper;
using backend_proyecto.Utils.Errors;
using Dietetica.Enums;
using Dietetica.Models;
using Dietetica.Models.DTO;
using Dietetica.Repositories;
using Dietetica.Utils.Helpers;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Net;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Dietetica.Services
{
    public class SaleServices
    {
        private readonly ISaleRepository _saleRepository;
        private readonly IMapper _mapper;
        private readonly IPaymentMethodRepository _paymentMethodRepository;
        private readonly IProductRepository _productRepository;
        public SaleServices(ISaleRepository saleRepository, IMapper mapper, IPaymentMethodRepository paymentMethodRepository, IProductRepository productRepository)
        {
            _saleRepository = saleRepository;
            _mapper = mapper;
            _paymentMethodRepository = paymentMethodRepository;
            _productRepository = productRepository;
        }

        public async Task<PagedResponse<ResponseSaleDetailDTO>> GetAll(
            DateTime? date,
            DateTime? dateTo,
            int? paymentMethodId,
            int page = 1,
            int pageSize = 10)
        {
            IQueryable<Sale> query = _saleRepository.Query();

            if (date.HasValue)
            {
                var (start, end) = ConvertTimeHelper.GetUtcRangeFromArgentinaDate(date.Value, dateTo);
                query = query.Where(s => s.CreatedAt >= start && s.CreatedAt < end);
            }

            if (paymentMethodId.HasValue)
            {
                query = query.Where(s => s.PaymentMethodId == paymentMethodId.Value);
            }

            var totalCount = await query.CountAsync();

            query = query.OrderByDescending(s => s.CreatedAt);

            var sales = await query
                .Include(s => s.Items)
                .Include(s => s.PaymentMethod)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var mapped = _mapper.Map<List<ResponseSaleDetailDTO>>(sales);

            return new PagedResponse<ResponseSaleDetailDTO>
            {
                Items = mapped,
                Page = page,
                PageSize = pageSize,
                HasNextPage = page * pageSize < totalCount
            };
        }

        public async Task<ResponseSaleDetailDTO> GetOneById(int id)
        {
            var sale = await _saleRepository
                .Query()
                .Include(s => s.PaymentMethod)
                .Include(s => s.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sale == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una venta con el Id = '{id}'");
            }

            return _mapper.Map<ResponseSaleDetailDTO>(sale);
        }

        public async Task<ResponseSaleDetailDTO> CreateOne(CreateSaleDTO createSaleDTO)
        {
            var method = await _paymentMethodRepository.GetOneAsync(m => m.Id == createSaleDTO.PaymentMethodId);
            if(method == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un método de pago con el Id = '{createSaleDTO.PaymentMethodId}'");
            }

            if(createSaleDTO.Items == null || createSaleDTO.Items.Count == 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"La venta tiene que tener por lo menos un item");
            }

            var productIds = createSaleDTO.Items.Select(i => i.ProductId).ToList();

            var products = await _productRepository.GetByIdsAsync(productIds);

            var saleItems = new List<SaleItem>();

            foreach(var item in createSaleDTO.Items)
            {
                var product = products.FirstOrDefault(p => p.Id == item.ProductId);
                if(product == null)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest, $"No se encontró un producto con el id = '{item.ProductId}'");
                }

                if (product.Stock < item.Quantity)
                {
                    throw new HttpResponseError(HttpStatusCode.BadRequest,$"Stock insuficiente para {product.Name}");
                }

                saleItems.Add(new SaleItem
                {
                    ProductId = product.Id,
                    ProductName = product.ShortName ?? product.Name,
                    ProductType = product.Type,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });

                product.Stock -= item.Quantity;
            }

            var lastTicket = await _saleRepository.Query()
                .OrderByDescending(s => s.TicketNumber)
                .Select(s => s.TicketNumber)
                .FirstOrDefaultAsync();

            var nextTicket = lastTicket + 1;

            var sale = new Sale
            {
                CreatedAt = DateTime.UtcNow,
                Total = saleItems.Sum(i =>
                {
                    var product = products.First(p => p.Id == i.ProductId);
                    var quantity = product.Type == ProductType.Weight
                        ? i.Quantity / 1000m
                        : i.Quantity;
                    var total = quantity * i.UnitPrice;
                    return total * (1 - method.Discount / 100m);
                }),
                TicketNumber = nextTicket,
                PaymentMethodId = createSaleDTO.PaymentMethodId,
                Items = saleItems
            };

            await _saleRepository.CreateOneAsync(sale);
            return _mapper.Map<ResponseSaleDetailDTO>(sale);
        }

        public async Task<ResponseSaleDTO> ChangeMethod(int id, int methodId)
        {
            var sale = await _saleRepository.GetOneAsync(s => s.Id == id);
            if (sale == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró una venta con el Id = '{id}'");
            }

            var method = await _paymentMethodRepository.GetOneAsync(m => m.Id == methodId);
            if (method == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un método de pago con el Id = '{methodId}'");
            }

            sale.PaymentMethodId = methodId;
            await _saleRepository.UpdateOneAsync(sale);
            return _mapper.Map<ResponseSaleDTO>(sale);
        }
        public async Task<int> GetCount(DateTime? date, DateTime? dateTo, int? paymentMethodId)
        {
            IQueryable<Sale> query = _saleRepository.Query();

            if (date.HasValue)
            {
                var (start, end) = ConvertTimeHelper.GetUtcRangeFromArgentinaDate(date.Value, dateTo);
                query = query.Where(s => s.CreatedAt >= start && s.CreatedAt < end);
            }

            if (paymentMethodId.HasValue)
                query = query.Where(s => s.PaymentMethodId == paymentMethodId);

            return await query.CountAsync();
        }
    }
}
