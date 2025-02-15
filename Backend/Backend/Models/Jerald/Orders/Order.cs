using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Backend.Models.Jerald.Payments;
using Backend.Models.Sarah.Users;
using Backend.Models.Sidney.Delivery;
using Backend.Models.Sidney.Voucher;

namespace Backend.Models.Jerald.Orders
{
    // Enum for Delivery Option
    public enum DeliveryOption
    {
        PickUp = 0, // Default value
        Delivery = 1
    }

    public enum ShipmentStatus
    {
        Pending = 0,
        Shipped = 1,
        Delivered = 2,
        Cancelled = 3
    }


    public class Order
    {
        [Key]
        public int OrderId { get; set; }

        [Required, Column(TypeName = "datetime")]
        public DateTime OrderDate { get; set; }

        [Required, Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; } // Updated to decimal for better monetary representation

        [Required]
        public DeliveryOption DeliveryOption { get; set; }

        [Required]
        public ShipmentStatus ShipmentStatus { get; set; } = ShipmentStatus.Pending;

        [ForeignKey("PaymentId")]
        public Payment? Payment { get; set; }

        [ForeignKey("UserId")]
        public int UserId { get; set; }
        public User User { get; set; }

        // Corrected navigation property
        [JsonIgnore]
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

        public virtual Delivery Delivery { get; set; } // Navigation Property
        public int? VoucherId { get; set; }

        [ForeignKey("VoucherId")]
        public virtual Voucher? Voucher { get; set; }
    }

}