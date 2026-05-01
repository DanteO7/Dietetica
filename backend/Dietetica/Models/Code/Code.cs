using Dietetica.Enums;

namespace Dietetica.Models
{
    public class Code
    {
        public int Id { get; set; }
        public string Value { get; set; } = null!;
        public CodeType Type { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
    }
}
