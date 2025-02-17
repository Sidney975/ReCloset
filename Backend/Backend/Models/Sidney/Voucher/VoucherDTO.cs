namespace Backend.Models.Sidney.Voucher
{
    public class VoucherDTO
    {
        public int VoucherId { get; set; }

        public string VoucherName { get; set; } = string.Empty;

        public string VoucherCode { get; set; }

        public VoucherTypeEnum VoucherTypeEnum { get; set; }

        public decimal DiscountValue { get; set; }

        public decimal MinimumValue { get; set; }

        public DateTime? ExpirationDate { get; set; }

        public int PointsCost { get; set; }
    }

}
