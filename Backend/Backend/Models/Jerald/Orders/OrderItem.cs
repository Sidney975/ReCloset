using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Backend.Models.Sophie;

namespace Backend.Models.Jerald.Orders
{
    public class OrderItem
    {
        [Key]
        public int OrderItemId { get; set; }

        [Required]
        public int OrderId { get; set; } // Foreign Key to Order

        [Required]
        public int ProductId { get; set; } // Foreign Key to Product

        [Required]
        public int Quantity { get; set; } // Number of items ordered

        [Required, Column(TypeName = "decimal(18,2)")]
        public decimal ItemPrice { get; set; } // Price per item at the time of order

        // Navigation property for Order
        [ForeignKey("OrderId")]
        public Order? Order { get; set; }
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }

    }
}
