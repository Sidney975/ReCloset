using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Sarah.Admins
{
    public class Admin
    {
        public int Id { get; set; }

        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Password { get; set; } = string.Empty;

        [MaxLength(50)]
        public string First_name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Last_name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Phone_number { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Address { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Role { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Status { get; set; } = string.Empty;

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; }

        [DataType(DataType.Date)]
        public DateTime HireDate { get; set; } = DateTime.Now;

        public bool Permissions { get; set; } = false;

        public int ManagedUsers { get; set; }

        public bool SystemAccess { get; set; }
    }
}
