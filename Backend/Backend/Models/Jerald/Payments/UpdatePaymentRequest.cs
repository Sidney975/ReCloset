using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Jerald.Payments
{
    public class UpdatePaymentRequestDTO
    {
        [MaxLength(50)]
        public string? PaymentMethod { get; set; }

        [MaxLength(16), MinLength(16)]
        [RegularExpression(@"^\d{16}$", ErrorMessage = "CardNumber must be exactly 16 digits.")]
        public string? CardNumber { get; set; }

        [MaxLength(4), MinLength(3)]
        [RegularExpression(@"^\d{3,4}$", ErrorMessage = "CVV must be 3 or 4 digits.")]
        public string? CVV { get; set; }

        public DateTime? ExpiryDate { get; set; }

        [MaxLength(200)]
        public string? BillingAddress { get; set; }

        [Range(100000, 999999, ErrorMessage = "Billing ZIP must be a valid 6-digit code.")]
        public int? BillingZip { get; set; }

        public PaymentStatus? Status { get; set; }

        [MaxLength(100)]
        public string Country { get; set; }

        [MaxLength(100)]
        public string City { get; set; }

        public bool? DefaultPreference { get; set; }
    }
}
