using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Backend.Models.Jerald.Orders;

namespace Backend.Models.Sidney.Delivery
{
	public class OrderAddress
	{
		[Key]
		public int AddressId { get; set; } // Primary Key

		[Required]
		public int OrderId { get; set; } // Foreign Key

		[Required, MaxLength(100)]
		public string RecipientName { get; set; } = string.Empty;

		[Required, MaxLength(255)]
		public string StreetAddress { get; set; } = string.Empty;

		[Required, MaxLength(100)]
		public string Suburb { get; set; } = string.Empty;

		[Required, MaxLength(50)]
		public string State { get; set; } = string.Empty;

		[Required, MaxLength(20)]
		public string Postcode { get; set; } = string.Empty;

		[Required, MaxLength(50)]
		public string Country { get; set; } = string.Empty;

		[MaxLength(500)]
		public string? DeliveryInstructions { get; set; }
	}
}
