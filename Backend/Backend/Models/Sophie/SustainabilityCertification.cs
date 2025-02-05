using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Sophie
{
	public class SustainabilityCertification
	{
		[Key]
		public int CertId { get; set; } // Primary Key

		[Required, MaxLength(100)]
		public string Name { get; set; }

		[MaxLength(255)]
		public string Description { get; set; }
	}
}
