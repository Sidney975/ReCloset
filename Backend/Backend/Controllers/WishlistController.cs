using Backend.Models.Sophie;
using Backend.Models.Sarah.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ReCloset.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WishlistController : ControllerBase
    {
        private readonly MyDbContext _context;

        public WishlistController(MyDbContext context)
        {
            _context = context;
        }

        // GET: Check availability of wishlist items for the logged-in user
        [HttpGet("check")]
        [Authorize]
        public async Task<IActionResult> CheckWishlistStatus()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("User not found.");

            // Get all wishlist items for the user
            var wishlistItems = await _context.Wishlists
                .Include(w => w.Product)
                .Where(w => w.UserId == int.Parse(userId))
                .ToListAsync();

            // Find products that are unavailable
            var unavailableProducts = wishlistItems
                .Where(w => !w.Product.Available)
                .Select(w => new
                {
                    ProductId = w.ProductId,
                    Name = w.Product.Name,
                    Image = w.Product.Image,
                    Price = w.Product.Price
                })
                .ToList();

            return Ok(new { unavailableProducts });
        }
    

    // Get wishlist items for the logged-in user
    [HttpGet]
            [Authorize]
            public async Task<IActionResult> GetWishlist()
            {
                var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
                if (string.IsNullOrEmpty(userId)) return Unauthorized("User not found.");

                var wishlistItems = await _context.Wishlists
                    .Include(w => w.Product)
                    .Where(w => w.UserId == int.Parse(userId))
                    .ToListAsync();

                return Ok(wishlistItems);
            }

        // Add item to wishlist
        [HttpPost("{productId}")]
        [Authorize]
        public async Task<IActionResult> AddToWishlist(int productId)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("User not found.");

            if (_context.Wishlists.Any(w => w.UserId == int.Parse(userId) && w.ProductId == productId))
                return BadRequest("Product already in wishlist.");

            var wishlistItem = new Wishlist
            {
                UserId = int.Parse(userId),
                ProductId = productId
            };

            _context.Wishlists.Add(wishlistItem);
            await _context.SaveChangesAsync();
            return Ok("Product added to wishlist.");
        }

        // Remove item from wishlist
        [HttpDelete("{productId}")]
        [Authorize]
        public async Task<IActionResult> RemoveFromWishlist(int productId)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("User not found.");

            var wishlistItem = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.UserId == int.Parse(userId) && w.ProductId == productId);

            if (wishlistItem == null) return NotFound("Item not in wishlist.");

            _context.Wishlists.Remove(wishlistItem);
            await _context.SaveChangesAsync();
            return Ok("Product removed from wishlist.");
        }
    }
}
