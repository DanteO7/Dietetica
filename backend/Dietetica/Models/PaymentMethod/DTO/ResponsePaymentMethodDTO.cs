namespace Dietetica.Models.DTO
{
    public class ResponsePaymentMethodDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int Discount { get; set; }
    }
}
