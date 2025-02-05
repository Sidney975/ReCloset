using Backend.Models.Sophie;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ReCloset.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ProductController : ControllerBase
	{
		private readonly MyDbContext _context;

		public ProductController(MyDbContext context)
		{
			_context = context;
		}

		// GET: api/Product
		[HttpGet]
		public IActionResult GetAll(string? search)
		{
			IQueryable<Product> result = _context.Products;
			if (search != null)
			{
				result = result.Where(x => x.Name.Contains(search)
				|| x.Description.Contains(search));
			}
			var list = result.OrderByDescending(x => x.CreatedAt).ToList();
			return Ok(list);
		}


		// GET: api/Product/5
		[HttpGet("{id}")]
		public async Task<ActionResult<ProductDto>> GetProduct(int id)
		{
			var product = await _context.Products.FindAsync(id);

			if (product == null)
			{
				return NotFound();
			}

			// Map Product to ProductDto
			var productDto = new ProductDto
			{
				Name = product.Name,
				Image = product.Image,
				Description = product.Description,
				SustainabilityNotes = product.SustainabilityNotes,
				SizingChart = product.SizingChart,
				Price = product.Price,
				Quality = product.Quality,
				Brand = product.Brand,
				Available = product.Available,
				CategoryId = product.CategoryId,
				WarehouseId = product.WarehouseId,
				CertId = product.CertId
			};

			return Ok(productDto);
		}


		// POST: api/Product
		[HttpPost]
		public async Task<ActionResult<Product>> CreateProduct([FromBody] ProductDto productDto)
		{
			// Validate foreign keys
			if (!_context.Categories.Any(c => c.CategoryId == productDto.CategoryId))
				return BadRequest("Invalid Category ID");

			if (!_context.Warehouses.Any(w => w.WarehouseId == productDto.WarehouseId))
				return BadRequest("Invalid Warehouse ID");

			if (productDto.CertId.HasValue &&
				!_context.SustainabilityCertifications.Any(s => s.CertId == productDto.CertId))
				return BadRequest("Invalid Sustainability Certification ID");

			// Map DTO to Product
			var product = new Product
			{
				Name = productDto.Name,
				Image = productDto.Image,
				Description = productDto.Description,
				SustainabilityNotes = productDto.SustainabilityNotes,
				SizingChart = productDto.SizingChart,
				Price = productDto.Price,
				Quality = productDto.Quality,
				Brand = productDto.Brand,
				Available = productDto.Available,
				CategoryId = productDto.CategoryId,
				WarehouseId = productDto.WarehouseId,
				CertId = productDto.CertId
			};

			// Add product to the database
			_context.Products.Add(product);
			await _context.SaveChangesAsync();

			// Return the created product
			return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, product);
		}

		// PUT: api/Product/5
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductDto productDto)
		{
			if (!ProductExists(id))
			{
				return NotFound();
			}

			// Find the existing product
			var existingProduct = await _context.Products.FindAsync(id);

			if (existingProduct == null)
			{
				return NotFound();
			}

			// Validate foreign keys
			if (!_context.Categories.Any(c => c.CategoryId == productDto.CategoryId))
				return BadRequest("Invalid Category ID");

			if (!_context.Warehouses.Any(w => w.WarehouseId == productDto.WarehouseId))
				return BadRequest("Invalid Warehouse ID");

			if (productDto.CertId.HasValue &&
				!_context.SustainabilityCertifications.Any(s => s.CertId == productDto.CertId))
				return BadRequest("Invalid Sustainability Certification ID");

			// Map ProductDto to Product
			existingProduct.Name = productDto.Name;
			existingProduct.Image = productDto.Image;
			existingProduct.Description = productDto.Description;
			existingProduct.SustainabilityNotes = productDto.SustainabilityNotes;
			existingProduct.SizingChart = productDto.SizingChart;
			existingProduct.Price = productDto.Price;
			existingProduct.Quality = productDto.Quality;
			existingProduct.Brand = productDto.Brand;
			existingProduct.Available = productDto.Available;
			existingProduct.CategoryId = productDto.CategoryId;
			existingProduct.WarehouseId = productDto.WarehouseId;
			existingProduct.CertId = productDto.CertId;

			_context.Entry(existingProduct).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!ProductExists(id))
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

		// DELETE: api/Product/5
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteProduct(int id)
		{
			var product = await _context.Products.FindAsync(id);

			if (product == null)
			{
				return NotFound();
			}

			_context.Products.Remove(product);
			await _context.SaveChangesAsync();

			return NoContent();
		}


		// Helper method to check if a Product exists
		private bool ProductExists(int id)
		{
			return _context.Products.Any(e => e.ProductId == id);
		}
	}
}
