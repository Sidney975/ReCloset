using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Jerald.Orders
{
    public class OrderItem
    {
        [Key]
        public int OrderItemId { get; set; }

        [Required]
        public int OrderId { get; set; } // Foreign Key to Order

        [Required]
        public string ProductName { get; set; } = string.Empty; // Store product name directly

        [Required]
        public string ProductCategory { get; set; } = string.Empty; // Store product category

        [Required]
        public int Quantity { get; set; } // Number of items ordered

        [Required, Column(TypeName = "decimal(18,2)")]
        public decimal ItemPrice { get; set; } // Price per item at the time of order

        [Required, Column(TypeName = "DATETIME")]
        public DateTime TimeBought { get; set; } = DateTime.UtcNow;
        // Navigation property for Order
        [ForeignKey("OrderId")]
        public Order? Order { get; set; }
    }
}
