using Backend.Models.Jerald.Orders;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Sidney.Delivery
{
	public class Delivery
	{
		[Key]
		public int DeliveryId { get; set; }

		[Required]
		public string ShipmentId { get; set; } // From Shippit

		public string TrackingNumber { get; set; } // From Shippit

		public string Carrier { get; set; } // e.g., "DHL", "FedEx"

		public string ShipmentStatus { get; set; } // "Pending", "Shipped", etc.

		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		[ForeignKey("OrderId")]
		public int OrderId { get; set; } // Links to an order

		public virtual Order Order { get; set; }
	}

}
