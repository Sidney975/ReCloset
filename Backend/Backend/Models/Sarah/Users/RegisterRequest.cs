using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Sarah.Users
{
    public class RegisterRequest
    {
        [Required, MaxLength(50)]
        public string UserId { get; set; } = string.Empty;  // ✅ Fix: Add UserId

        [Required, MaxLength(50)]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(8), MaxLength(50)]
        public string Password { get; set; } = string.Empty;
    }
}
