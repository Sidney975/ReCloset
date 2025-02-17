using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models.Sidney.Voucher;
using Backend.Models.Sophie;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class VoucherController : ControllerBase
    {
        private readonly MyDbContext _context;

        public VoucherController(MyDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll(string? search)
        {
            IQueryable<Voucher> result = _context.Vouchers;

            if (!string.IsNullOrWhiteSpace(search))
            {
                result = result.Where(x => x.VoucherName.Contains(search));
            }

            return Ok(result.OrderByDescending(x => x.CreatedAt).ToList());
        }

        [HttpGet("{id}")]
        public IActionResult GetVouchers(int id)
        {
            var voucher = _context.Vouchers.SingleOrDefault(t => t.VoucherId == id);
            return voucher == null ? NotFound() : Ok(voucher);
        }

        [HttpPost, Authorize]
        public IActionResult AddVoucher([FromBody] Voucher voucher)
        {
            voucher.CreatedAt = DateTime.Now;
            voucher.UpdatedAt = DateTime.Now;

            _context.Vouchers.Add(voucher);
            _context.SaveChanges();
            return Ok(voucher);
        }

        [HttpPut("{id}"), Authorize]
        public IActionResult UpdateVoucher(int id, [FromBody] Voucher voucher)
        {
            var myVoucher = _context.Vouchers.Find(id);
            if (myVoucher == null)
            {
                return NotFound();
            }

            myVoucher.VoucherName = voucher.VoucherName.Trim();
            myVoucher.VoucherTypeEnum = voucher.VoucherTypeEnum;
            myVoucher.DiscountValue = voucher.DiscountValue;
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
    }
}
