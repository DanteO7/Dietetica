namespace Dietetica.Models.DTO
{
    public class CreateSaleDTO
    {
        public int PaymentMethodId { get; set; }
        public List<CreateSaleItemDTO> Items { get; set; } = new();
    }
}
