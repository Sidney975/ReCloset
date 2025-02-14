using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Sophie
{
	public class ProductDetailDto
	{
		[Required, MaxLength(100)]
		public string Name { get; set; }

		[MaxLength(255)]
		public string Image { get; set; }

		[MaxLength(255)]
		public string Description { get; set; }

		[MaxLength(255)]
		public string SustainabilityNotes { get; set; }

		[MaxLength(255)]
		public string SizingChart { get; set; }

		[Required]
		public decimal Price { get; set; }

		public bool Quality { get; set; }

		[MaxLength(50)]
		public string Brand { get; set; }

		public bool Available { get; set; }

		[Required]
		public int CategoryId { get; set; }

		[Required]
		public int WarehouseId { get; set; }

		public int? CertId { get; set; }

		// New properties for display purposes
		public string CategoryName { get; set; } // Human-readable category name
		public string WarehouseName { get; set; } // Human-readable warehouse name
		public string SustainabilityCertificationName { get; set; } // Human-readable sustainability certification name
		public string SustainabilityCertificationQRCode { get; set; } // QR code url
	}
}