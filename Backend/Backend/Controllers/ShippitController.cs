// Controllers/ShippitController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Backend.Models.Sidney.Delivery;
using Backend;
using Backend.Models.Jerald.Orders;
using Newtonsoft.Json; // For Order and OrderItem

namespace Backend.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class ShippitController(MyDbContext _context, ShippitService _shippitService) : ControllerBase
	{
		// Helper method to get the logged-in user id
		private int GetUserId()
		{
            var Username = User.Claims
			.Where(c => c.Type == ClaimTypes.NameIdentifier)
			.Select(c => c.Value).SingleOrDefault();
            int userId = _context.Users.FirstOrDefault(u => u.UserId == Username).Id;
            return userId;
        }

		[HttpPost("send/{orderId}")]
		public async Task<IActionResult> SendOrderToShippit(int orderId)
		{
			var order = await _context.Orders
				.Include(o => o.OrderItems)
				//.ThenInclude(oi => oi.Product)
				.Include(o => o.User)
				.Include(o => o.Deliveries) // Ensure deliveries are included
				.FirstOrDefaultAsync(o => o.OrderId == orderId);

			if (order == null) return NotFound("Order not found.");
			if (order.UserId != GetUserId()) return Forbid();

			var orderAddress = await _context.OrderAddresses.FirstOrDefaultAsync(a => a.OrderId == order.OrderId);
			if (orderAddress == null) return BadRequest("Order address not found.");

			// Ensure order is tracked before modifying
			_context.Orders.Attach(order);

			var shipmentRequest = new ShippitShipmentRequest
			{
				Order = new OrderDetails
				{
					CourierType = "standard",
					DeliveryAddress = orderAddress.StreetAddress,
					DeliveryPostcode = orderAddress.Postcode,
					DeliveryState = "SG",
					DeliverySuburb = "SG",
					AuthorityToLeave = "Yes",
					ParcelAttributes = order.OrderItems.Select(item => new ParcelAttribute
					{
						Quantity = item.Quantity,
						Weight = 3.0 // Update if actual weight is known
					}).ToList(),
					User = new UserAttributes
					{
						Email = order.User?.Email ?? "default@email.com",
						FirstName = orderAddress.RecipientName ?? "non",
						//order.User?.First_name ??
						//LastName = order.User?.Last_name ?? "Doe"
					},
					Products = order.OrderItems.Select(item => new ProductDetails
					{
						Title = "Unknown Product",
						SKU = "SKU123",
						Quantity = item.Quantity,
						Price = (double)item.ItemPrice
					}).ToList()
				}
			};

			var jsonPayload = JsonConvert.SerializeObject(shipmentRequest, Formatting.Indented);
			Console.WriteLine("Shippit Payload: " + jsonPayload);

			try
			{
				var shipmentResponse = await _shippitService.CreateShipmentAsync(shipmentRequest);

				// **Extract tracking information from response**
				string shipmentId = shipmentResponse.ShipmentId;
				Console.WriteLine($"Shippit Response: {shipmentResponse.ShipmentId}");
				string trackingNumber = shipmentResponse.TrackingNumber;
				string state = shipmentResponse.Status ?? "processing";

				order.ShipmentStatus = ShipmentStatus.despatch_in_progress;
				await _context.SaveChangesAsync(); 

				// **Check if delivery entry already exists**
				

				// Log for debugging
				Console.WriteLine($"Shippit Order Response: {System.Text.Json.JsonSerializer.Serialize(shipmentResponse)}");

				return Ok(shipmentResponse);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Error sending order to Shippit: {ex.Message}");
			}
		}




		/// <summary>
		/// Retrieves the tracking status of a shipment from Shippit.
		/// </summary>
		/// <param name="shipmentId">The shipment ID provided by Shippit</param>
		/// <returns>Tracking details</returns>
		[HttpGet("track/{shipmentId}"), Authorize]
		public async Task<IActionResult> TrackShipment(string shipmentId)
		{
			try
			{
				var trackingInfo = await _shippitService.GetShipmentStatusAsync(shipmentId);
				Console.WriteLine(shipmentId);
				if (trackingInfo == null)
				{
					return NotFound("Shipment tracking details not found.");
				}

				// Log the entire response for debugging
				Console.WriteLine($"Tracking Response: {System.Text.Json.JsonSerializer.Serialize(trackingInfo)}");
				Console.WriteLine($"Tracking Response: {shipmentId}");
				// Ensure Status is present before updating
				if (!string.IsNullOrEmpty(trackingInfo.Status))
				{
					// Update the delivery status in the database
					var delivery = await _context.Deliveries.FirstOrDefaultAsync(d => d.ShipmentId == shipmentId);
					if (delivery != null)
					{
						delivery.ShipmentStatus = trackingInfo.Status;
						await _context.SaveChangesAsync();
					}
				}

				return Ok(trackingInfo);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Error tracking shipment: {ex.Message}");
			}
		}




	}
}
