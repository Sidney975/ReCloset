using Backend.Models.Sophie;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ReCloset.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class CategoryController : ControllerBase
	{
		private readonly MyDbContext _context;

		public CategoryController(MyDbContext context)
		{
			_context = context;
		}

		[HttpGet]
		public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
		{
			return await _context.Categories.ToListAsync();
		}

		[HttpGet("{id}")]
		public async Task<ActionResult<Category>> GetCategory(int id)
		{
			var category = await _context.Categories.FindAsync(id);
			if (category == null) return NotFound();
			return category;
		}

		[HttpPost]
		public async Task<ActionResult<Category>> CreateCategory(Category category)
		{
			_context.Categories.Add(category);
			await _context.SaveChangesAsync();
			return CreatedAtAction(nameof(GetCategory), new { id = category.CategoryId }, category);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category category)
		{
			// Ensure the category exists
			var existingCategory = await _context.Categories.FindAsync(id);
			if (existingCategory == null)
			{
				return NotFound();
			}

			// Update the category fields
			existingCategory.Name = category.Name;
			existingCategory.Description = category.Description;

			_context.Entry(existingCategory).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!_context.Categories.Any(e => e.CategoryId == id))
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
		public async Task<IActionResult> DeleteCategory(int id)
		{
			var category = await _context.Categories.FindAsync(id);
			if (category == null) return NotFound();
			_context.Categories.Remove(category);
			await _context.SaveChangesAsync();
			return NoContent();
		}
	}
}
