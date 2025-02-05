using Backend.Models.Jerald.Payments;
using Backend.Models.Sarah.Users;

namespace Backend.Models.Jerald.Orders
{
    public class OrderDTO
    {
        public int OrderId { get; set; } // Unique order identifier
        public int UserId { get; set; } // User who placed the order
        public DateTime OrderDate { get; set; } // Date the order was placed
        public decimal TotalPrice { get; set; } // Total order price
        public string DeliveryMethod { get; set; } = string.Empty; // Delivery or Pickup
        public string Status { get; set; } = string.Empty; // Order status (e.g., Pending, Shipped)
        public User UserDetails { get; set; } = new User(); // User who placed the order
        public BasicPaymentDTO PaymentDetails { get; set; } = new BasicPaymentDTO(); // Payment summary
        public List<BasicOrderItemDTO> OrderItems { get; set; } = new List<BasicOrderItemDTO>(); // List of items
    }
}
