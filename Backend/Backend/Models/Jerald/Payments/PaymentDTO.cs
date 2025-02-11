using Backend.Models.Sarah.Users;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Jerald.Payments
{
    public class PaymentDTO
    {
        public int PaymentId { get; set; } // Unique identifier for the payment
        public string PaymentMethod { get; set; } = string.Empty; // e.g., Credit Card
        public string MaskedCardNumber { get; set; } = string.Empty; // e.g., **** **** **** 1234
        public string BillingAddress { get; set; } = string.Empty; // Full billing address
        public int BillingZip { get; set; } // Billing ZIP code
        public string ExpiryDate { get; set; } = string.Empty; // Expiry Date in MM/YY format
        public bool IsDefault { get; set; } // Indicates if it's the default payment method
        public string Status { get; set; } = string.Empty; // Active/Inactive
        public string Country { get; set; } = string.Empty; // Active/Inactive
        public string City { get; set; } = string.Empty; // Active/Inactive
        public int UserId { get; set; }
        public bool IsDeleted { get; set; } // Include IsDeleted if you want to expose this information 
    }
}
