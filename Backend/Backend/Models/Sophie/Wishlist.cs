using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Backend.Models.Sarah.Users; // Import User model

namespace Backend.Models.Sophie
{
    public class Wishlist
    {
        [Key]
        public int WishlistId { get; set; }  // Primary Key

        [Required]
        public int UserId { get; set; } // Foreign Key to User

        [Required]
        public int ProductId { get; set; } // Foreign Key to Product

        [ForeignKey("UserId")]
        [JsonIgnore]
        public User User { get; set; }

        [ForeignKey("ProductId")]
        public Product Product { get; set; }
    }
}
