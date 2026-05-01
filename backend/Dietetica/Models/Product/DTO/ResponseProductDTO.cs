using Dietetica.Enums;

namespace Dietetica.Models.DTO
{
    public class ResponseProductDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public decimal Stock { get; set; }
        public ProductType Type { get; set; }
        public string? ImageUrl { get; set; }
        public List<ResponseCodeDTO> Codes { get; set; } = new();

    }
}
