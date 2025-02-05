namespace Backend.Models.Jerald.Orders
{
    public class UpdateOrderRequestDto
    {
        public int? DeliveryOption { get; set; } // Optional: Update DeliveryOption
        public int? ShipmentStatus { get; set; } // Optional: Update ShipmentStatus
        public List<BasicOrderItemDTO>? OrderItems { get; set; } // Optional: Add or update OrderItems
    }
}
