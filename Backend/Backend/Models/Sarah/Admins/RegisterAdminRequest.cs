using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Sarah.Admins
{
    public class RegisterAdminRequest
    {
        [Required, MinLength(3), MaxLength(50)]
        [RegularExpression(@"^[a-zA-Z0-9_.]+$", ErrorMessage = "Only letters, numbers, and the symbols '_' and '.' are allowed.")]
        public string Username { get; set; } = string.Empty;

        [Required, MinLength(8), MaxLength(50)]
        [RegularExpression(@"^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$",
            ErrorMessage = "Password must contain at least 1 letter, 1 number, and 1 special character.")]
        public string Password { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(50)]
        public string Email { get; set; } = string.Empty;

        // Admin-specific fields
        [Required]
        public string Role { get; set; } = "Admin"; // Default role for admin

        public bool Permissions { get; set; } = false; // False by default, can be updated later

        [DataType(DataType.Date)]
        public DateTime HireDate { get; set; } = DateTime.UtcNow; // Auto-assign hire date

        [MaxLength(50)]
        public string? FirstName { get; set; }

        [MaxLength(50)]
        public string? LastName { get; set; }

        [MaxLength(15)]
        [RegularExpression(@"^[89]\d{7}$", ErrorMessage = "Phone number must start with 8 or 9 and be 8 digits long.")]
        public string? PhoneNumber { get; set; }

        [MaxLength(100)]
        public string? Address { get; set; }
    }
}
