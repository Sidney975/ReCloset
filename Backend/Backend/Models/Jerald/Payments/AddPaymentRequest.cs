using Backend.Models.Sarah.Users;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Jerald.Payments
{
    public class AddPaymentRequestDTO
    {
        [Required]
        public int UserId { get; set; }
        [Required, MaxLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;

        [Required, MaxLength(16), MinLength(16)]
        [RegularExpression(@"^\d{16}$", ErrorMessage = "CardNumber must be exactly 16 digits.")]
        public string CardNumber { get; set; } = string.Empty;

        [Required, MaxLength(4), MinLength(3)]
        [RegularExpression(@"^\d{3,4}$", ErrorMessage = "CVV must be 3 or 4 digits.")]
        public string CVV { get; set; } = string.Empty;

        [Required]
        public DateTime ExpiryDate { get; set; }

        [Required, MaxLength(200)]
        public string BillingAddress { get; set; } = string.Empty;

        [Required, Range(100000, 999999, ErrorMessage = "Billing ZIP must be a valid 6-digit code.")]
        public int BillingZip { get; set; }

        [Required]
        public bool DefaultPreference { get; set; }

        [Required]
        public PaymentStatus Status { get; set; }

        [Required]
        public User User { get; set; } = new User(); // User who made the order
    }
}
