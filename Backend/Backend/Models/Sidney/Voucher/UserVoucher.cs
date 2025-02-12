using Backend.Models.Sarah.Users;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ReCloset.Models
{
    public class UserVoucher
    {
        // Foreign key to User
        [JsonIgnore]
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        [JsonIgnore]
        // Foreign key to Voucher
        public int VoucherId { get; set; }
        public Voucher Voucher { get; set; } = null!;

        // When the voucher was collected by the user
        [Column(TypeName = "datetime")]
        public DateTime CollectedAt { get; set; } = DateTime.UtcNow;

        // When the voucher was redeemed by the user (nullable if not redeemed yet)
        [Column(TypeName = "datetime")]
        public DateTime? RedeemedAt { get; set; }
    }
}
