using Dietetica.Enums;

namespace Dietetica.Models.DTO
{
    public class UpdateCodeDTO
    {
        public int? Id { get; set; } 
        public string Value { get; set; } = null!;
        public CodeType Type { get; set; }
    }
}
