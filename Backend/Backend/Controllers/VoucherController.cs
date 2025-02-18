using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Backend.Models.Sidney.Voucher;
using Backend.Models.Sophie;

namespace Backend.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class VoucherController(MyDbContext context) : ControllerBase
	{
		private readonly MyDbContext _context = context;

		[HttpGet]
		public IActionResult GetAll(string? search)
		{
			IQueryable<Voucher> result = _context.Vouchers;
			if (search != null)
			{
				result = result.Where(x => x.VoucherName.Contains(search));
			}
			var list = result.OrderByDescending(x => x.CreatedAt).ToList();
			var data = list.Select(t => new
			{
				t.VoucherId,
				t.VoucherName,
				t.VoucherTypeEnum,
				t.DiscountValue,
				t.PointsCost,
				t.ExpirationDate,
				t.CreatedAt,
				t.UpdatedAt,
				t.Hidden,
			});
			return Ok(data);
		}

		[HttpGet("{id}")]
		public IActionResult GetVouchers(int id)
		{
			Voucher? voucher = _context.Vouchers
				.SingleOrDefault(t => t.VoucherId == id);
			if (voucher == null)
			{
				return NotFound();
			}
			var data = new
			{
				voucher.VoucherId,
				voucher.VoucherName,
				voucher.VoucherTypeEnum,
				voucher.DiscountValue,
				voucher.PointsCost,
				voucher.ExpirationDate,
				voucher.Hidden,
				voucher.CreatedAt,
				voucher.UpdatedAt,
			};

			return Ok(data);
		}

		[HttpPost, Authorize]
		public IActionResult AddVoucher(Voucher voucher)
		{
			var now = DateTime.Now;
			var myVoucher = new Voucher()
			{
				VoucherName = voucher.VoucherName.Trim(),
				VoucherTypeEnum = voucher.VoucherTypeEnum,
				VoucherCode = voucher.VoucherCode,
				DiscountValue = voucher.DiscountValue,
				MinimumValue = voucher.MinimumValue,
				PointsCost = voucher.PointsCost,
				Hidden = voucher.Hidden,
				ExpirationDate = voucher.ExpirationDate,
				CreatedAt = now,
				UpdatedAt = now,
				CategoryId = voucher.CategoryId
			};

			_context.Vouchers.Add(myVoucher);
			_context.SaveChanges();
			return Ok(myVoucher);
		}

		[HttpPut("{id}"), Authorize]
		public IActionResult UpdateVoucher(int id, Voucher voucher)
		{
			var myVoucher = _context.Vouchers.Find(id);
			if (myVoucher == null)
			{
				return NotFound();
			}

			myVoucher.VoucherName = voucher.VoucherName.Trim();
			myVoucher.VoucherTypeEnum = voucher.VoucherTypeEnum;
			myVoucher.VoucherCode = voucher.VoucherCode;
			myVoucher.DiscountValue = voucher.DiscountValue;
			myVoucher.PointsCost = voucher.PointsCost;
			myVoucher.MinimumValue = voucher.MinimumValue;
			myVoucher.ExpirationDate = voucher.ExpirationDate;
			myVoucher.Hidden = voucher.Hidden;
			myVoucher.CreatedAt = DateTime.Now;
			myVoucher.UpdatedAt = DateTime.Now;

			_context.SaveChanges();
			return Ok();
		}

		[HttpDelete("{id}"), Authorize]
		public IActionResult DeleteVoucher(int id)
		{
			var myVoucher = _context.Vouchers.Find(id);
			if (myVoucher == null)
			{
				return NotFound();
			}

			_context.Vouchers.Remove(myVoucher);
			_context.SaveChanges();
			return Ok();
		}

		[HttpPost("{voucherId}/claim"), Authorize]
		public IActionResult ClaimVoucher(int voucherId)
		{
			// Get the current user's ID
			int userId = GetUserId();

			var user = _context.Users.Find(userId);
			if (user == null)
			{
				return NotFound(new { message = "User not found" });
			}

				// Check if the voucher exists
			var voucher = _context.Vouchers.Find(voucherId);
			if (voucher == null)
			{
				return NotFound(new { message = "Voucher not found" });
			}

			if (user.LoyaltyPoints < voucher.PointsCost )
			{
				return BadRequest(new { message = "you do not have enough points" });
			}

			// Check if the user has already claimed this voucher
			var existingClaim = _context.UserVouchers
				.FirstOrDefault(uv => uv.UserId == userId && uv.VoucherId == voucherId);
			if (existingClaim != null)
			{
				return BadRequest(new { message = "You have already claimed this voucher" });
			}

			// Create a new UserVoucher record
			var userVoucher = new UserVoucher
			{
				UserId = userId,
				VoucherId = voucherId,
				CollectedAt = DateTime.UtcNow
			};


			// Add the record to the database
			_context.UserVouchers.Add(userVoucher);
			_context.SaveChanges();

			return Ok(new { message = "Voucher claimed successfully" });
		}


		[HttpGet("claimed"), Authorize]
		public IActionResult GetClaimedVouchers()
		{
			// Get the current user's ID
			int userId = GetUserId();

			// Fetch all claimed vouchers for the user
			var claimedVouchers = _context.UserVouchers
				.Where(uv => uv.UserId == userId)
				.Include(uv => uv.Voucher) // Include voucher details
				.Select(uv => new
				{
					uv.VoucherId,
					uv.Voucher.VoucherName,
					uv.Voucher.VoucherCode,
					uv.Voucher.VoucherTypeEnum,
					uv.Voucher.MinimumValue,
					uv.Voucher.DiscountValue,
					uv.Voucher.PointsCost,
					uv.Voucher.ExpirationDate,
					uv.Voucher.CategoryId,
					uv.Voucher.Hidden,
					uv.CollectedAt,
					uv.RedeemedAt
				})
				.ToList();

			return Ok(claimedVouchers);
		}

		[HttpPost("apply"), Authorize]
		public IActionResult ApplyVoucher([FromBody] ApplyVoucherRequest request)
		{
			// Find the voucher by its ID
			var voucher = _context.Vouchers.Find(request.VoucherId);
			if (voucher == null)
			{
				return NotFound(new { message = "Voucher not found" });
			}

			decimal newPrice = request.OriginalPrice;

			// Apply discount logic based on the voucher type
			if (voucher.VoucherTypeEnum == VoucherTypeEnum.PriceDeduction)
			{
				if (voucher.DiscountValue < 1m) // percentage discount
				{
					newPrice = request.OriginalPrice * (1 - voucher.DiscountValue);
				}
				else // flat discount
				{
					newPrice = request.OriginalPrice - voucher.DiscountValue;
					if (newPrice < 0)
					{
						newPrice = 0;
					}
				}
			}
			else if (voucher.VoucherTypeEnum == VoucherTypeEnum.FreeShipping)
			{
				// For free shipping, assume product price remains unchanged.
				newPrice = request.OriginalPrice;
			}

			return Ok(new
			{
				voucherId = voucher.VoucherId,
				originalPrice = request.OriginalPrice,
				alteredPrice = newPrice
			});
		}


		[HttpPost("{voucherId}/redeem"), Authorize]
		public IActionResult RedeemVoucher(int voucherId)
		{
			int userId = GetUserId();

			// Find the UserVoucher record that hasn't been redeemed yet.
			var userVoucher = _context.UserVouchers
				.FirstOrDefault(uv => uv.UserId == userId
								   && uv.VoucherId == voucherId
								   && uv.RedeemedAt == null);
			if (userVoucher == null)
			{
				return BadRequest(new { message = "Voucher either not claimed or already redeemed." });
			}

			userVoucher.RedeemedAt = DateTime.UtcNow;
			_context.SaveChanges();

			return Ok(new { message = "Voucher redeemed successfully", redeemedAt = userVoucher.RedeemedAt });
		}

		private int GetUserId()
		{
			return Convert.ToInt32(User.Claims
				.Where(c => c.Type == ClaimTypes.NameIdentifier)
				.Select(c => c.Value).SingleOrDefault());
		}
	}
}