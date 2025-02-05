using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Sophie
{
	public class Warehouse
	{
		[Key]
		public int WarehouseId { get; set; } // Primary Key

		[Required, MaxLength(100)]
		public string LocationName { get; set; }

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

		// Computed property
		[NotMapped]
		public string Address
		{
			get
			{
				// Concatenate the address components
				return string.Join(", ",
					new[] { Street, City, State, PostalCode, Country }
					.Where(component => !string.IsNullOrWhiteSpace(component))
				);
			}
		}
	}
}
