using Dietetica.Enums;

namespace Dietetica.Models
{
    public class SaleItem
    {
        public int Id { get; set; }
        public int SaleId { get; set; }

        public int? ProductId { get; set; } // nullable por si el producto se borra

        public string ProductName { get; set; } = null!;
        public ProductType ProductType { get; set; }

        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }

        public Sale Sale { get; set; } = null!;
        public Product? Product { get; set; }
    }
}