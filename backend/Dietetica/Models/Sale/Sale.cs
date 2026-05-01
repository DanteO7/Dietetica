namespace Dietetica.Models
{
    public class Sale
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal Total { get; set; }
        public int PaymentMethodId { get; set; }
        public int TicketNumber { get; set; }

        public PaymentMethod PaymentMethod { get; set; } = null!;
        public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
    }
}