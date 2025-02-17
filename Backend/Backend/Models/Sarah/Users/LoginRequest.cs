using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Sarah.Users
{
    public class LoginRequest
    {
        [Required, MaxLength(50)]
        public string UsernameOrEmail { get; set; } = string.Empty;

        [Required, MinLength(8), MaxLength(50)]
        public string Password { get; set; } = string.Empty;
    }
}
