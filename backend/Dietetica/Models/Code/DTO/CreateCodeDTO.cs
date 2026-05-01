using Dietetica.Enums;

namespace Dietetica.Models.DTO
{
    public class CreateCodeDTO
    {
        public string Value { get; set; } = null!;
        public CodeType Type { get; set; }
    }
}
