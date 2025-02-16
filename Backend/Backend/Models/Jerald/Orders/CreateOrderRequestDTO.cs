using Backend.Models.Sarah.Users;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Jerald.Orders
{
    public class CreateOrderRequestDTO
    {
        [Required]
        public int DeliveryOption { get; set; } // Delivery or Pickup

        [Required]
        public int PaymentId { get; set; } // Payment method

        [Required]
        public int UserId { get; set; }

        [Required]
        public User User { get; set; } = new User(); // User who made the order

        [Required]
        public List<BasicOrderItemDTO> OrderItems { get; set; } = new List<BasicOrderItemDTO>(); // List of order items

		public decimal TotalPrice { get; set; }

		public int? VoucherId { get; set; } // Make nullable if no voucher is applied

	}
}
