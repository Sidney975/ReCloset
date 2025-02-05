using Backend.Models.Sophie;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ReCloset.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class SustainabilityCertificationController : ControllerBase
	{
		private readonly MyDbContext _context;

		public SustainabilityCertificationController(MyDbContext context)
		{
			_context = context;
		}

		[HttpGet]
		public IActionResult GetAll(string? search)
		{
			IQueryable<SustainabilityCertification> result = _context.SustainabilityCertifications;
			if (search != null)
			{
				result = result.Where(x => x.Name.Contains(search)
				|| x.Description.Contains(search));
			}
			var list = result.ToList();
			return Ok(list);
		}

		[HttpGet("{id}")]
		public async Task<ActionResult<SustainabilityCertification>> GetCertification(int id)
		{
			var certification = await _context.SustainabilityCertifications.FindAsync(id);
			if (certification == null) return NotFound();
			return certification;
		}

		[HttpPost]
		public async Task<ActionResult<SustainabilityCertification>> CreateCertification(SustainabilityCertification certification)
		{
			_context.SustainabilityCertifications.Add(certification);
			await _context.SaveChangesAsync();
			return CreatedAtAction(nameof(GetCertification), new { id = certification.CertId }, certification);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateCertification(int id, [FromBody] SustainabilityCertification certification)
		{
			// Ensure the certification exists
			var existingCertification = await _context.SustainabilityCertifications.FindAsync(id);
			if (existingCertification == null)
			{
				return NotFound();
			}

			// Update certification fields
			existingCertification.Name = certification.Name;
			existingCertification.Description = certification.Description;

			_context.Entry(existingCertification).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!_context.SustainabilityCertifications.Any(e => e.CertId == id))
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
		public async Task<IActionResult> DeleteCertification(int id)
		{
			var certification = await _context.SustainabilityCertifications.FindAsync(id);
			if (certification == null) return NotFound();
			_context.SustainabilityCertifications.Remove(certification);
			await _context.SaveChangesAsync();
			return NoContent();
		}
	}
}
