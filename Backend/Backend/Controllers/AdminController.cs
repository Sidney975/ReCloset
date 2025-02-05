using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Linq;
using System.Text.Json;
using System.ComponentModel.DataAnnotations;
using Backend.Models.Sarah.Users;
using Backend.Models.Sarah.Admins;

namespace ReCloset.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IConfiguration _configuration;

        public AdminController(MyDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public IActionResult Register(RegisterRequest request)
        {
            // Trim string values
            request.Username = request.Username.Trim();
            request.Email = request.Email.Trim().ToLower();
            request.Password = request.Password.Trim();

            // Check email
            var foundAdmin = _context.Admins.Where(x => x.Email == request.Email).FirstOrDefault();
            if (foundAdmin != null)
            {
                string message = "Email already exists.";
                return BadRequest(new { message });
            }

            // Create admin object
            var now = DateTime.Now;
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            var admin = new Admin()
            {
                Username = request.Username,
                Email = request.Email,
                Password = passwordHash,
                CreatedAt = now,
                UpdatedAt = now
            };
            // Add admin
            _context.Admins.Add(admin);
            _context.SaveChanges();
            return Ok();
        }

        [HttpPost("login")]
        public IActionResult Login(LoginRequest request)
        {
            // Trim string values
            request.Email = request.Email.Trim().ToLower();
            request.Password = request.Password.Trim();

            // Check email and password
            string message = "Email or password is not correct.";
            var foundAdmin = _context.Admins.Where(x => x.Email == request.Email).FirstOrDefault();
            if (foundAdmin == null)
            {
                return BadRequest(new { message });
            }
            bool verified = BCrypt.Net.BCrypt.Verify(request.Password, foundAdmin.Password);
            if (!verified)
            {
                return BadRequest(new { message });
            }

            // Return admin info
            var admin = new
            {
                foundAdmin.Id,
                foundAdmin.Email,
                foundAdmin.Username
            };
            string accessToken = CreateToken(foundAdmin);
            return Ok(new { admin, accessToken });
        }

        [HttpGet("auth"), Authorize]
        public async Task<IActionResult> Auth()
        {
            // Extract admin information from claims
            var tokenAdminId = Convert.ToInt32(User.Claims
                .Where(c => c.Type == ClaimTypes.NameIdentifier)
                .Select(c => c.Value)
                .SingleOrDefault());

            // Ensure the authenticated admin can only access their own information
            //if (tokenAdminId != id)
            //{
            //    return Unauthorized(new { message = "You can only view your own information." });
            //}

            // Fetch admin data from the database
            var admin = await _context.Admins.FindAsync(tokenAdminId);

            if (admin == null)
            {
                return NotFound(new { message = $"Admin with ID {tokenAdminId} not found." });
            }

            // Build a response with all admin information
            var adminResponse = new
            {
                admin.Id,
                admin.Username,
                admin.Password, // Include password only if necessary; otherwise, exclude it for security
                admin.First_name,
                admin.Last_name,
                admin.Email,
                admin.Phone_number,
                admin.Address,
                admin.Role,
                admin.Status,
                admin.CreatedAt,
                admin.UpdatedAt,
                admin.HireDate,
                admin.Permissions,
                admin.ManagedUsers,
                admin.SystemAccess
            };

            return Ok(new { admin = adminResponse });
        }


        [HttpPut("update/{id}"), Authorize]
        public IActionResult Update(int id, UpdateAdminRequest request)
        {
            // Find the admin by ID
            var foundAdmin = _context.Admins.FirstOrDefault(x => x.Id == id);
            if (foundAdmin == null)
            {
                return NotFound(new { message = "Admin not found." });
            }

            // Only allow admins to update their own information
            if (foundAdmin.Id != id)
            {
                return Unauthorized(new { message = "You cannot update another admin's information." });
            }

            // Update admin fields
            foundAdmin.Username = request.Username ?? foundAdmin.Username;
            foundAdmin.Password = request.Password != null ? BCrypt.Net.BCrypt.HashPassword(request.Password) : foundAdmin.Password;
            foundAdmin.First_name = request.First_name ?? foundAdmin.First_name;
            foundAdmin.Last_name = request.Last_name ?? foundAdmin.Last_name;
            foundAdmin.Phone_number = request.Phone_number ?? foundAdmin.Phone_number;
            foundAdmin.Address = request.Address ?? foundAdmin.Address;
            foundAdmin.UpdatedAt = DateTime.UtcNow;

            // Update the admin in the database
            _context.Admins.Update(foundAdmin);
            _context.SaveChanges();

            return Ok(new { message = "Admin information updated successfully." });
        }

        [HttpDelete("delete/{id}"), Authorize]
        public IActionResult Delete(int id)
        {
            // Extract the admin's ID from the token claims
            var tokenAdminId = Convert.ToInt32(User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);

            // Validate the extracted admin ID
            if (tokenAdminId == 0)
            {
                return Unauthorized(new { message = "Invalid token. Access denied." });
            }

            // Ensure the authenticated admin can only delete their own account
            if (tokenAdminId != id)
            {
                return Unauthorized(new { message = "You cannot delete another admin's account." });
            }

            // Find the admin by ID in the database
            var foundAdmin = _context.Admins.FirstOrDefault(x => x.Id == id);
            if (foundAdmin == null)
            {
                return NotFound(new { message = "Admin not found." });
            }

            // Delete the admin
            _context.Admins.Remove(foundAdmin);
            _context.SaveChanges();

            return Ok(new { message = "Admin deleted successfully." });
        }

        private string CreateToken(Admin admin)
        {
            string secret = _configuration.GetValue<string>("Authentication:Secret");
            if (string.IsNullOrEmpty(secret))
            {
                throw new Exception("Secret is required for JWT authentication.");
            }
            int tokenExpiresDays = _configuration.GetValue<int>("Authentication:TokenExpiresDays");
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(
                    new[] {
                        new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
                        new Claim(ClaimTypes.Name, admin.Username),
                        new Claim(ClaimTypes.Email, admin.Email)
                    }),
                Expires = DateTime.UtcNow.AddDays(tokenExpiresDays),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            string token = tokenHandler.WriteToken(securityToken);
            return token;
        }
    }

    // DTO class for admin update request
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
