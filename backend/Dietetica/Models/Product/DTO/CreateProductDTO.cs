using Dietetica.Enums;

namespace Dietetica.Models.DTO
{
    public class CreateProductDTO
    {
        public string Name { get; set; } = null!; 
        public string? ShortName { get; set; }
        public decimal Price { get; set; }
        public decimal Stock { get; set; }
        public ProductType Type { get; set; }
        public string? ImageUrl { get; set; }
        public List<CreateCodeDTO> Codes { get; set; } = new();

    }
}
