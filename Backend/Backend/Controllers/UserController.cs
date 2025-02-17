using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Backend.Models.Sarah.Users;

namespace ReCloset.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IConfiguration _configuration;

        public UserController(MyDbContext context, IConfiguration configuration)
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
            var foundUser = _context.Users.Where(x => x.Email == request.Email).FirstOrDefault();
            if (foundUser != null)
            {
                string message = "Email already exists.";
                return BadRequest(new { message });
            }

            // Create user object
            var now = DateTime.Now;
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            var user = new User()
            {
                Username = request.Username,
                Email = request.Email,
                Password = passwordHash,
                CreatedAt = now,
                UpdatedAt = now
            };
            // Add user
            _context.Users.Add(user);
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
            var foundUser = _context.Users.Where(x => x.Email == request.Email).FirstOrDefault();
            if (foundUser == null)
            {
                return BadRequest(new { message });
            }
            bool verified = BCrypt.Net.BCrypt.Verify(request.Password, foundUser.Password);
            if (!verified)
            {
                return BadRequest(new { message });
            }

            // Return user info
            var user = new
            {
                foundUser.Id,
                foundUser.Email,
                foundUser.Username,
                foundUser.LoyaltyPoints,
            };
            string accessToken = CreateToken(foundUser);
            return Ok(new { user, accessToken });
        }

        [HttpGet("auth"), Authorize]
        public async Task<IActionResult> Auth()
        {
            // Extract user information from claims
            var tokenUserId = Convert.ToInt32(User.Claims
                .Where(c => c.Type == ClaimTypes.NameIdentifier)
                .Select(c => c.Value)
                .SingleOrDefault());

            var username = User.Claims
                .Where(c => c.Type == ClaimTypes.Name)
                .Select(c => c.Value)
                .SingleOrDefault();

            var email = User.Claims
                .Where(c => c.Type == ClaimTypes.Email)
                .Select(c => c.Value)
                .SingleOrDefault();

            // Validate that the claims exist
            if (tokenUserId == 0 || username == null || email == null)
            {
                return Unauthorized(new { message = "Invalid user claims. Access denied." });
            }

            // Ensure the authenticated user can only access their own information
            //if (tokenUserId != id)
            //{
            //    return Unauthorized(new { message = "You can only view your own information." });
            //}

            // Fetch user data from the database
            var user = await _context.Users.FindAsync(tokenUserId);

            if (user == null)
            {
                return NotFound(new { message = $"User with ID {tokenUserId} not found." });
            }

            // Build a response with detailed user information
            var userResponse = new
            {
                user.Id,
                user.Username,
                user.First_name,
                user.Last_name,
                user.Email,
                user.Phone_number,
                user.Address,
                user.Role,
                user.Status,
                user.CreatedAt,
                user.UpdatedAt,
                Preferences = user.Preferences != null ? JsonSerializer.Deserialize<List<string>>(user.Preferences) : new List<string>(),
                user.LoyaltyPoints,
                Vouchers = user.Vouchers != null ? JsonSerializer.Deserialize<List<string>>(user.Vouchers) : new List<string>(),
            };

            return Ok(new { user = userResponse });
        }



        [HttpPut("update/{id}"), Authorize]
        public IActionResult Update(int id, UpdateUserRequest request)
        {
            // Find the user by ID
            var foundUser = _context.Users.FirstOrDefault(x => x.Id == id);
            if (foundUser == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Only allow users to update their own information
            if (foundUser.Id != id)
            {
                return Unauthorized(new { message = "You cannot update another user's information." });
            }

            // Update user fields
            foundUser.Username = request.Username ?? foundUser.Username;
            foundUser.Password = request.Password != null ? BCrypt.Net.BCrypt.HashPassword(request.Password) : foundUser.Password;
            foundUser.First_name = request.First_name ?? foundUser.First_name;
            foundUser.Last_name = request.Last_name ?? foundUser.Last_name;
            foundUser.Phone_number = request.Phone_number ?? foundUser.Phone_number;
            foundUser.Address = request.Address ?? foundUser.Address;
            foundUser.Preferences = request.Preferences ?? foundUser.Preferences;
            foundUser.UpdatedAt = DateTime.UtcNow;

            // Update the user in the database
            _context.Users.Update(foundUser);
            _context.SaveChanges();

            return Ok(new { message = "User information updated successfully." });
        }

        [HttpDelete("delete/{id}"), Authorize]
        public IActionResult Delete(int id)
        {
            // Extract the user's ID from the token claims
            var tokenUserId = Convert.ToInt32(User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);

            // Validate the extracted user ID
            if (tokenUserId == 0)
            {
                return Unauthorized(new { message = "Invalid token. Access denied." });
            }

            // Ensure the authenticated user can only delete their own account
            if (tokenUserId != id)
            {
                return Unauthorized(new { message = "You cannot delete another user's account." });
            }

            // Find the user by ID in the database
            var foundUser = _context.Users.FirstOrDefault(x => x.Id == id);
            if (foundUser == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Delete the user
            _context.Users.Remove(foundUser);
            _context.SaveChanges();

            return Ok(new { message = "User deleted successfully." });
        }


        private string CreateToken(User user)
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
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        new Claim(ClaimTypes.Name, user.Username),
                        new Claim(ClaimTypes.Email, user.Email)
                    }),
                Expires = DateTime.UtcNow.AddDays(tokenExpiresDays),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            string token = tokenHandler.WriteToken(securityToken);
            return token;
        }

        // Update the points
		[HttpPut("update/{id}/{points}"), Authorize]
		public IActionResult UpdateLoyalyPoints(int id, UpdateUserRequest request, int points)
		{
			// Find the user by ID
			var foundUser = _context.Users.FirstOrDefault(x => x.Id == id);
			if (foundUser == null)
			{
				return NotFound(new { message = "User not found." });
			}

			// Only allow users to update their own information
			if (foundUser.Id != id)
			{
				return Unauthorized(new { message = "You cannot update another user's information." });
			}


			// Update user fields
			foundUser.LoyaltyPoints = foundUser.LoyaltyPoints + points;
			foundUser.UpdatedAt = DateTime.UtcNow;

			// Update the user in the database
			_context.Users.Update(foundUser);
			_context.SaveChanges();

			return Ok(new { message = "Points updated successfully." });
		}


	}

    // DTO class for update request
    public class UpdateUserRequest
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

        // Assuming Preferences are serialized as a string or JSON
        public string? Preferences { get; set; }
    }
}

