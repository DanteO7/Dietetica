using Dietetica.Models.DTO;

namespace Dietetica.Models.DTO
{
    public class ResponseSaleDTO
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal Total { get; set; }
        public int TicketNumber { get; set; }
        public ResponsePaymentMethodDTO PaymentMethod { get; set; } = null!;
    }
}
