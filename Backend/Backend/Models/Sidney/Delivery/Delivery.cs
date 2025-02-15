using Backend.Models.Jerald.Orders;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Sidney.Delivery
{
    public class Delivery
    {
        [Key]
        public int DeliveryId { get; set; } // Changed Id → DeliveryId to match convention

        [Required]
        public string TrackingNumber { get; set; } // Shippo Tracking Number

        [Required]
        public string Carrier { get; set; } // Carrier used (e.g., USPS, FedEx, DHL)

        public string ShipmentStatus { get; set; } // Current shipment status (e.g., In Transit, Delivered)

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Timestamp

        // Ensure OrderId is correctly linked to Order
        [Required]
        public int OrderId { get; set; } // Foreign Key linking to Order

        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; } // Navigation property
    }
}
