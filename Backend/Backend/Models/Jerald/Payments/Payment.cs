using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Backend.Models.Sarah.Users;
using Backend.Models.Jerald.Orders;

namespace Backend.Models.Jerald.Payments
{
    // Enum for Status
    public enum PaymentStatus
    {
        Inactive = 0,
        Active = 1
    }

    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        [Required, MaxLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string CardNumber { get; set; } = string.Empty;

        [Required, MaxLength(4), MinLength(4)]
        public string LastFourDigits { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string CVV { get; set; } = string.Empty;

        [Required, Column(TypeName = "date")]
        public DateTime ExpiryDate { get; set; }

        [Required, MaxLength(200)]
        public string BillingAddress { get; set; } = string.Empty;

        [Required, Range(100000, 999999, ErrorMessage = "Billing ZIP must be a valid 6-digit code.")]
        public int BillingZip { get; set; }

        [Required, MaxLength(100)]
        public string Country { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required, MaxLength(8), MinLength(8), RegularExpression(@"^\d+$", ErrorMessage = "Mobile number must be numeric.")]
        public string MobileNumber { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public PaymentStatus Status { get; set; } = PaymentStatus.Inactive;

        [Required]
        public bool DefaultPreference { get; set; }

        [Required]
        public bool IsDeleted { get; set; } = false; // New field for soft deletion

        public int UserId { get; set; }
        public User? User { get; set; }

        // Navigation property for the one-to-many relationship
        public List<Order>? Order { get; set; }
    }
}

