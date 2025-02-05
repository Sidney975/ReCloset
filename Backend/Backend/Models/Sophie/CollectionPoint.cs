using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Sophie
{
	public class CollectionPoint
	{
		[Key]
		public int CollectionId { get; set; } // Primary Key

		[Required, MaxLength(150)]
		public string Address { get; set; }

		[MaxLength(150)]
		public string Street { get; set; }

		[MaxLength(100)]
		public string City { get; set; }

		[MaxLength(50)]
		public string State { get; set; }

		[MaxLength(20)]
		public string PostalCode { get; set; }

		[MaxLength(50)]
		public string Country { get; set; }

		[MaxLength(10)]
		public string ContactNo { get; set; }
	}
}
