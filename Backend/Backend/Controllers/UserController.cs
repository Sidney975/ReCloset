using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Backend.Models.Sarah.Users;
using Backend.Services;

namespace ReCloset.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly AuthService _authService;

        public UserController(MyDbContext context, IConfiguration configuration, AuthService authService)
        {
            _context = context;
            _configuration = configuration;
            _authService = authService;
        }

        [HttpPost("register")]
        public IActionResult Register(RegisterRequest request)
        {
            if (_context.Users.Any(u => u.UserId == request.UserId))
                return BadRequest("User ID is already in use.");

            if (_context.Users.Any(u => u.Email == request.Email))
                return BadRequest("Email is already in use.");

            var user = new User
            {
                UserId = request.UserId, 
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = "Customer",
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = $"User {request.UserId} registered successfully." });
        }

        [HttpPost("login")]
        public IActionResult Login(LoginRequest request)
        {
            request.UsernameOrEmail = request.UsernameOrEmail.Trim().ToLower();
            request.Password = request.Password.Trim();

            var foundUser = _context.Users
                .FirstOrDefault(x => x.Email.ToLower() == request.UsernameOrEmail || x.UserId.ToLower() == request.UsernameOrEmail);

            if (foundUser == null || !BCrypt.Net.BCrypt.Verify(request.Password, foundUser.Password))
                return Unauthorized(new { message = "Invalid credentials." });

            string accessToken = _authService.GenerateToken(foundUser);

            return Ok(new { user = new { foundUser.UserId, foundUser.Email }, accessToken });
        }

        [HttpGet("auth"), Authorize]
        public async Task<IActionResult> Auth()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { message = "Invalid token. Access denied." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userIdClaim); // ✅ Ensure `FirstOrDefaultAsync()` is used

            if (user == null)
                return NotFound(new { message = "User not found." });

            return Ok(new { user });
        }

        [HttpPut("update-profile"), Authorize]
        public IActionResult UpdateProfile([FromBody] UpdateUserRequest request)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User not found.");

            var user = _context.Users.FirstOrDefault(u => u.UserId == userIdClaim);
            if (user == null)
                return NotFound("User does not exist.");

            user.FirstName = request.FirstName ?? user.FirstName;
            user.LastName = request.LastName ?? user.LastName;
            user.PhoneNumber = request.PhoneNumber ?? user.PhoneNumber;
            user.Address = request.Address ?? user.Address;
            user.UpdatedAt = DateTime.UtcNow;

            _context.SaveChanges();

            return Ok(new { message = "Profile updated successfully." });
        }

        [HttpDelete("delete/{userId}"), Authorize]
        public IActionResult Delete(string userId)
        {
            var tokenUserId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(tokenUserId) || tokenUserId != userId)
                return Unauthorized(new { message = "You cannot delete another user's account." });

            var foundUser = _context.Users.FirstOrDefault(x => x.UserId == userId);
            if (foundUser == null)
                return NotFound(new { message = "User not found." });

            _context.Users.Remove(foundUser);
            _context.SaveChanges();

            return Ok(new { message = "User deleted successfully." });
        }

        [HttpPut("admin/update-user/{id}"), Authorize(Roles = "Admin")]
        public IActionResult UpdateUser(string id, [FromBody] UpdateUserRequest request)
        {
            var foundUser = _context.Users.FirstOrDefault(u => u.UserId == id);
            if (foundUser == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // ✅ Allow admins to edit user details
            foundUser.Address = request.Address ?? foundUser.Address;
            foundUser.PhoneNumber = request.PhoneNumber ?? foundUser.PhoneNumber;
            foundUser.Role = request.Role ?? foundUser.Role;
            foundUser.Status = request.Status ?? foundUser.Status;
            foundUser.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(foundUser);
            _context.SaveChanges();

            return Ok(new { message = "User updated successfully.", user = foundUser });
        }


        [HttpDelete("soft-delete/{id}"), Authorize(Roles = "Admin")]
        public IActionResult SoftDeleteUser(string id)
        {
            var foundUser = _context.Users.FirstOrDefault(u => u.UserId == id);
            if (foundUser == null)
            {
                return NotFound(new { message = "User not found." });
            }

            //  Instead of deleting, mark as Inactive
            foundUser.Status = "Inactive";
            foundUser.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(foundUser);
            _context.SaveChanges();

            return Ok(new { message = "User has been soft deleted (deactivated)." });
        }

        [HttpPut("change-password"), Authorize]
        public IActionResult ChangeOwnPassword([FromBody] ChangePasswordRequest request)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User authentication failed.");

            var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
            if (user == null)
                return NotFound("User not found.");

            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.Password))
                return BadRequest("Incorrect current password.");

            // Hash and update new password
            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            _context.SaveChanges();
            return Ok(new { message = "Password updated successfully." });
        }

        [HttpPut("admin/change-password/{id}"), Authorize(Roles = "Admin")]
        public IActionResult ChangeUserPassword(string id, [FromBody] ChangePasswordRequest request)
        {
            var adminRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

            if (adminRole != "Admin")
                return Forbid("Only admins can change other users' passwords.");

            var user = _context.Users.FirstOrDefault(u => u.UserId == id);
            if (user == null)
                return NotFound("User not found.");

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            _context.SaveChanges();
            return Ok(new { message = $"Password for {id} updated successfully." });

        }

        [HttpGet("customers")]
        public IActionResult GetCustomers()
        {
            var customers = _context.Users.Where(u => u.Role == "Customer").ToList();
            return Ok(customers);
        }


    }
}
