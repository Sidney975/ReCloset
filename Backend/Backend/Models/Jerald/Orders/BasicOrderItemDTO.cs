using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Jerald.Orders
{
    public class BasicOrderItemDTO
    {
        public string ProductName { get; set; } = string.Empty; // Store product name
        public string ProductCategory { get; set; } = string.Empty; // Store product category
        public bool Gender { get; set; } // Price per item at the time of order
        public int Quantity { get; set; } // Quantity ordered
        public decimal ItemPrice { get; set; } // Price for this item
        public DateTime TimeBought { get; set; } = DateTime.UtcNow;

    }
}
