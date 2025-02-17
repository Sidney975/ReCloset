using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Sarah.Users
{
    public class UpdateUserRequest
    {
        [MaxLength(50)]
        public string? FirstName { get; set; }

        [MaxLength(50)]
        public string? LastName { get; set; }

        [MaxLength(15)]
        public string? PhoneNumber { get; set; }

        [MaxLength(100)]
        public string? Address { get; set; }

        public string? Preferences { get; set; }

        [MaxLength(50)]
        public string? Role { get; set; }  

        [MaxLength(50)]
        public string? Status { get; set; } 
    }
}
