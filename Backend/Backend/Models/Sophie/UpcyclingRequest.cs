using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Sophie
{
	public class UpcyclingRequest
	{
		[Key]
		public int RequestId { get; set; } // Primary Key

		public bool Approved { get; set; }

		[Column(TypeName = "datetime")]
		public DateTime CreatedAt { get; set; }

		[Column(TypeName = "datetime")]
		public DateTime UpdatedAt { get; set; }

		[Required, ForeignKey("ProductId")]
		public Product Product { get; set; }
	}
}
