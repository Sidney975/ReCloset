using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Sarah.Users
{
    public class RegisterRequest
    {
        [Required, MinLength(3), MaxLength(50)]
        [RegularExpression(@"^[a-zA-Z0-9_.]+$", ErrorMessage = "Only letters, numbers, and the symbols '_' and '.' are allowed.")]        
        public string Username { get; set; } = string.Empty;
        [Required, MinLength(8), MaxLength(50)]
        // Regular expression to enforce password complexity
        [RegularExpression(@"^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$",
ErrorMessage = "At least 1 letter and 1 number")]
        public string Password { get; set; } = string.Empty;
        [Required, EmailAddress, MaxLength(50)]
        public string Email { get; set; } = string.Empty;
    }
}
