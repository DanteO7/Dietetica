using Dietetica.Enums;

namespace Dietetica.Models.DTO
{
    public class ResponseCodeDTO
    {
        public int Id { get; set; }
        public string Value { get; set; } = null!;
        public CodeType Type { get; set; }
        public int ProductId { get; set; }
    }
}
