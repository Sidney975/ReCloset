using Backend.Models.Jerald.Orders;
using Backend.Models.Jerald.Payments;
using Backend.Models.Sidney.Voucher;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Backend.Models.Sarah.Users
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Auto-generate ID
        public int Id { get; set; }  //  Change this to 'int' (recommended)

        [MaxLength(50)]
        public string UserId { get; set; } = Guid.NewGuid().ToString();
        [Required]
        [MaxLength(50)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Password { get; set; } = string.Empty;

        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(15)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Address { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Role { get; set; } = "Customer"; // ✅ Role differentiates Admin & Customer

        [MaxLength(50)]
        public string Status { get; set; } = "Active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public string Preferences { get; set; } = JsonSerializer.Serialize(new List<string>());
        public int LoyaltyPoints { get; set; }

        [JsonIgnore]
        public ICollection<UserVoucher>? UserVouchers { get; set; }

        [JsonIgnore]
        public ICollection<Order>? Orders { get; set; }

        //  ADMIN-SPECIFIC ATTRIBUTES (Only applies if Role == "Admin")
        public int? ManagedByAdminId { get; set; } // Which admin manages this user
        [JsonIgnore]
        public User? ManagedByAdmin { get; set; }

        [JsonIgnore]
        public ICollection<User>? ManagedUsers { get; set; } // Admins can manage multiple users
    }
}
