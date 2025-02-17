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
			IQueryable<Delivery> result = _context.Deliveries;
			var list = result.OrderByDescending(x => x.CreatedAt).ToList();
			var data = list.Select(t => new
			{
				t.DeliveryId,
				t.TrackingNumber,
				t.ShipmentStatus,
				t.Carrier,
				t.OrderId,
				t.CreatedAt,
			});
			if (data == null)
			{
				return NotFound("No delivery found for this order.");
			}
			return Ok(data);
		}

		// Get Delivery Info by Order ID
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

			// Validate the status input
			if (!allowedStatuses.Contains(deliveryUpdate.ShipmentStatus))
			{
				return BadRequest("Invalid status. Allowed values: Pending, Dispatched, Delivered, Cancelled.");
			}

			var delivery = _context.Deliveries.FirstOrDefault(d => d.OrderId == orderId);
			if (delivery == null)
			{
				return NotFound("No delivery found for this order.");
			}

			// Store status as a string
			delivery.ShipmentStatus = deliveryUpdate.ShipmentStatus;
			_context.SaveChanges();

			return Ok(new { message = "Shipment status updated successfully.", delivery });
		}

	}
}
