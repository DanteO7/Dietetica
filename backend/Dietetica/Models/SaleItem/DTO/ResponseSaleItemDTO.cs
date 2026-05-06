using Dietetica.Enums;

namespace Dietetica.Models.DTO
{
    public class ResponseSaleItemDTO
    {
        public int Id { get; set; }
        public int SaleId { get; set; }
        public int? ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public ProductType ProductType { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
