using System.Diagnostics.Eventing.Reader;

namespace Backend.Models.Jerald.Orders
{
    public class UpdateOrderRequestDto
    {
        public int? DeliveryOption { get; set; } // Optional: Update DeliveryOption
        public int? ShipmentStatus { get; set; } // Optional: Update ShipmentStatus
        public List<UpdatedOrderItemDTO>? OrderItems { get; set; } // Optional: Add or update OrderItems
    }

    public class UpdatedOrderItemDTO
    {
        public int OrderItemId { get; set; } // ID of existing order item (if updating)
        public string ProductName { get; set; } = string.Empty; // Store product name
        public bool Gender { get; set; }
        public string ProductCategory { get; set; } = string.Empty; // Store product category
        public int Quantity { get; set; } // Quantity ordered
        public decimal ItemPrice { get; set; } // Price for this item
        public DateTime TimeBought { get; set; } // Purchase date
    }
}
