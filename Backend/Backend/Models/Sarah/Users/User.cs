using Backend.Models.Jerald.Orders;
using Backend.Models.Jerald.Payments;
using ReCloset.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Backend.Models.Sarah.Users
{
    public class User
    {
        public int Id { get; set; }

        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;
        [MaxLength(100)]
        public string Password { get; set; } = string.Empty;
        [MaxLength(50)]

        public string First_name { get; set; } = string.Empty;
        [MaxLength(50)]

        public string Last_name { get; set; } = string.Empty;
        [MaxLength(50)]

        public string Email { get; set; } = string.Empty;
        [MaxLength(50)]

        public string Phone_number { get; set; } = string.Empty;
        [MaxLength(100)]

        public string Address {  get; set; } = string.Empty;
        //add upload image for pfp
        [MaxLength(50)]

        public string Role {  get; set; } = string.Empty;
        [MaxLength(50)]

        public string Status {  get; set; } = string.Empty;
        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; }
        public string Preferences { get; set; } = JsonSerializer.Serialize(new List<string>());
        public int LoyaltyPoints { get; set; }
        public string Vouchers { get; set; } = JsonSerializer.Serialize(new List<string>());

        // Navigation property for the one-to-many relationship
        [JsonIgnore]
        public List<Order>? Orders { get; set; }
        [JsonIgnore]
        public List<Payment>? Payments { get; set; }
        [JsonIgnore]
        public ICollection<UserVoucher>? UserVouchers { get; set; }
    }
}
