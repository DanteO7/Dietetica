namespace Dietetica.Models
{
    public class PaymentMethod
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int Discount {  get; set; }
    }
}