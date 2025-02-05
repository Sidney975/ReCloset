using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Sophie
{
	public class Category
	{
		[Key]
		public int CategoryId { get; set; } // Primary Key

		[Required, MaxLength(50)]
		public string Name { get; set; }

		[MaxLength(100)]
		public string Description { get; set; }
	}
}
