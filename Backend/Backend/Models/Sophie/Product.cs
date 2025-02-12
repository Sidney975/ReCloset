using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ReCloset.Models.Sophie
{
	public class Product
	{
		[Key]
		public int ProductId { get; set; } // Primary Key

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

		[Column(TypeName = "datetime")]
		public DateTime CreatedAt { get; set; }

		[Column(TypeName = "datetime")]
		public DateTime UpdatedAt { get; set; }

		// Foreign key IDs instead of navigation objects for POST
		[Required]
		public int CategoryId { get; set; }

		[Required]
		public int WarehouseId { get; set; }

		public int? CertId { get; set; }

		// Navigation properties
		[JsonIgnore]
		public Category Category { get; set; }

		[JsonIgnore]
		public Warehouse Warehouse { get; set; }

		[ForeignKey("CertId")]
		[JsonIgnore]
		public SustainabilityCertification? SustainabilityCertification { get; set; }

	}
}
