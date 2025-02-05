using System.ComponentModel.DataAnnotations;
namespace Backend.Models.Sarah.Admins
{
    public class UpdateAdminRequest
    {
        [MaxLength(50)]
        public string? Username { get; set; }

        [MaxLength(100)]
        public string? Password { get; set; }

        [MaxLength(50)]
        public string? First_name { get; set; }

        [MaxLength(50)]
        public string? Last_name { get; set; }

        [MaxLength(15)] // Adjust max length based on your phone number format
        public string? Phone_number { get; set; }

        [MaxLength(100)]
        public string? Address { get; set; }
    }
}
