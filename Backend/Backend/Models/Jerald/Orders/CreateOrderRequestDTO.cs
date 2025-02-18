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

		// New Address Fields for Shippit
		[Required]
		public string RecipientName { get; set; } = string.Empty;

		[Required]
		public string StreetAddress { get; set; } = string.Empty;

		[Required]
		public string Suburb { get; set; } = string.Empty;

		[Required]
		public string State { get; set; } = string.Empty;

		[Required]
		public string Postcode { get; set; } = string.Empty;

		[Required]
		public string Country { get; set; } = string.Empty;

		public string? DeliveryInstructions { get; set; } // Optional

	}
}
