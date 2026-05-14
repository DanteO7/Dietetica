namespace Dietetica.Models.DTO
{
    public class CreatePaymentMethodDTO
    {
        public string Name { get; set; } = null!;
        public int Discount { get; set; }
    }
}
