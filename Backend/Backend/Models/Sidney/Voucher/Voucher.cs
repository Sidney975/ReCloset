using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Backend.Models.Sophie;
using Microsoft.EntityFrameworkCore.Metadata.Internal;


namespace Backend.Models.Sidney.Voucher
{
    public enum VoucherTypeEnum
    {
        PriceDeduction,
        FreeShipping
    }

    public class Voucher
    {
        public int VoucherId { get; set; }

        [Required, MinLength(3), MaxLength(100)]
        public string VoucherName { get; set; } = string.Empty;

		[Required, MinLength(8)]
		public string VoucherCode { get; set; } = string.Empty;

		[Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public VoucherTypeEnum VoucherTypeEnum { get; set; }

        [Required, Range(0, 10000)]
        public decimal DiscountValue { get; set; }

        [Required, Range(0, 10000)]
        public decimal MinimumValue { get; set; }

        public DateTime? ExpirationDate { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; }

        [Required, Range(1, 9999)]
        public int PointsCost { get; set; }

        [Required]
        public bool Hidden { get; set; } = false;

		[JsonIgnore]
        public ICollection<UserVoucher>? UserVouchers { get; set; }

		public int CategoryId { get; set; } // Foreign Key

		// **Navigation Property**
		[ForeignKey("CategoryId")]
		public virtual Category? Category { get; set; }

	}
}
