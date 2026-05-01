using Dietetica.Enums;

namespace Dietetica.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public decimal Stock { get; set; }
        public ProductType Type { get; set; }
        public string? ImageUrl { get; set; }
        public ICollection<Code> Codes { get; set; } = new List<Code>();
    }
}
