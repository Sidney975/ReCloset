using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReCloset.Models.Sophie;

namespace ReCloset.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class WarehouseController : ControllerBase
	{
		private readonly MyDbContext _context;

		public WarehouseController(MyDbContext context)
		{
			_context = context;
		}

		[HttpGet]
		public async Task<ActionResult<IEnumerable<Warehouse>>> GetWarehouses()
		{
			return await _context.Warehouses.ToListAsync();
		}

		[HttpGet("{id}")]
		public async Task<ActionResult<Warehouse>> GetWarehouse(int id)
		{
			var warehouse = await _context.Warehouses.FindAsync(id);
			if (warehouse == null) return NotFound();
			return warehouse;
		}

		[HttpPost]
		public async Task<ActionResult<Warehouse>> CreateWarehouse(Warehouse warehouse)
		{
			_context.Warehouses.Add(warehouse);
			await _context.SaveChangesAsync();
			return CreatedAtAction(nameof(GetWarehouse), new { id = warehouse.WarehouseId }, warehouse);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateWarehouse(int id, [FromBody] Warehouse warehouse)
		{
			// Ensure the warehouse exists
			var existingWarehouse = await _context.Warehouses.FindAsync(id);
			if (existingWarehouse == null)
			{
				return NotFound();
			}

			// Update warehouse fields
			existingWarehouse.LocationName = warehouse.LocationName;
			existingWarehouse.Street = warehouse.Street;
			existingWarehouse.City = warehouse.City;
			existingWarehouse.State = warehouse.State;
			existingWarehouse.PostalCode = warehouse.PostalCode;
			existingWarehouse.Country = warehouse.Country;
			existingWarehouse.ContactNo = warehouse.ContactNo;

			_context.Entry(existingWarehouse).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!_context.Warehouses.Any(e => e.WarehouseId == id))
				{
					return NotFound();
				}
				else
				{
					throw;
				}
			}

			return NoContent();
		}


		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteWarehouse(int id)
		{
			var warehouse = await _context.Warehouses.FindAsync(id);
			if (warehouse == null) return NotFound();
			_context.Warehouses.Remove(warehouse);
			await _context.SaveChangesAsync();
			return NoContent();
		}

		[HttpGet("nearest-warehouse")]
		public async Task<IActionResult> GetNearestWarehouse([FromQuery] string origin)
		{
			if (string.IsNullOrEmpty(origin))
			{
				return BadRequest("Origin is required");
			}

			var apiKey = "AIzaSyCcHZDjfgvgsDgPFY57kkx095gvESfX5CM";
			var warehouses = _context.Warehouses.Select(w => new { w.Latitude, w.Longitude }).ToList();

			if (warehouses.Count == 0)
			{
				return NotFound("No warehouses available.");
			}

			string destinations = string.Join("|", warehouses.Select(w => $"{w.Latitude},{w.Longitude}"));
			string requestUrl = $"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin}&destinations={destinations}&key={apiKey}";

			using (var httpClient = new HttpClient())
			{
				var response = await httpClient.GetStringAsync(requestUrl);
				return Content(response, "application/json");
			}
		}


	}
}
