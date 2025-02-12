using System;
using System.IO;
using System.Linq;
using System.Drawing;
using System.Drawing.Imaging;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using QRCoder.Core;
using ReCloset.Models.Sophie;
using Microsoft.Extensions.Hosting;

namespace ReCloset.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class SustainabilityCertificationController : ControllerBase
	{
		private readonly MyDbContext _context;
		private readonly IWebHostEnvironment _environment;

		public SustainabilityCertificationController(MyDbContext context, IWebHostEnvironment environment)
		{
			_context = context;
			_environment = environment;
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
			if (string.IsNullOrEmpty(certification.QRCodeUrl))
			{
				return BadRequest("QR Code URL cannot be empty.");
			}

			string uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");

			// Ensure the uploads folder exists
			if (!Directory.Exists(uploadsFolder))
			{
				Directory.CreateDirectory(uploadsFolder);
			}

			string fileName = $"{Guid.NewGuid()}.png";
			string filePath = Path.Combine(uploadsFolder, fileName);

			// Generate QR Code
			using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
			using (QRCodeData qrCodeData = qrGenerator.CreateQrCode(certification.QRCodeUrl, QRCodeGenerator.ECCLevel.Q))
			using (QRCode qrCode = new QRCode(qrCodeData))
			using (Bitmap qrCodeImage = qrCode.GetGraphic(20))
			{
				qrCodeImage.Save(filePath, ImageFormat.Png);
			}

			// Store only the filename (not the full path) in the database
			certification.QRCodeUrl = fileName;

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
