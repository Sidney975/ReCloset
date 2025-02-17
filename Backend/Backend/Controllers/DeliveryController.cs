using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Backend.Models.Sidney.Delivery;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeliveryController : ControllerBase
    {
        private readonly MyDbContext _context;

        public DeliveryController(MyDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAllDelivery()
        {
            var list = _context.Deliveries
                .OrderByDescending(x => x.CreatedAt)
                .ToList();

            if (!list.Any())
            {
                return NotFound("No delivery found.");
            }

            return Ok(list);
        }

        [HttpGet("{orderId}")]
        public IActionResult GetDeliveryByOrderId(int orderId)
        {
            var delivery = _context.Deliveries.FirstOrDefault(d => d.OrderId == orderId);
            if (delivery == null)
            {
                return NotFound("No delivery found for this order.");
            }
            return Ok(delivery);
        }

        [HttpPut("{orderId}")]
        public IActionResult UpdateStatus(int orderId, [FromBody] DeliveryUpdateDto deliveryUpdate)
        {
            var allowedStatuses = new List<string> { "Pending", "Dispatched", "Delivered", "Cancelled" };

            if (!allowedStatuses.Contains(deliveryUpdate.ShipmentStatus))
            {
                return BadRequest("Invalid status.");
            }

            var delivery = _context.Deliveries.FirstOrDefault(d => d.OrderId == orderId);
            if (delivery == null)
            {
                return NotFound("No delivery found.");
            }

            delivery.ShipmentStatus = deliveryUpdate.ShipmentStatus;
            _context.SaveChanges();

            return Ok(new { message = "Shipment status updated successfully." });
        }
    }
}
