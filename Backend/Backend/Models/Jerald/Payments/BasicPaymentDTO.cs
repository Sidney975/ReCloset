namespace Backend.Models.Jerald.Payments
{
    public class BasicPaymentDTO
    {
        public int PaymentId { get; set; } // Unique identifier for the payment method
        public string PaymentMethod { get; set; } = string.Empty; // e.g., "Credit Card"
        public string MaskedCardNumber { get; set; } = string.Empty; // e.g., "**** **** **** 1234"
        public bool IsDefault { get; set; } // Whether this is the default payment method
    }
}
