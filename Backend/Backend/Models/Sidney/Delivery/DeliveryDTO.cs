namespace Backend.Models.Sidney.Delivery
{
    public class DeliveryDTO
    {
		public int OrderId { get; set; }
		public string? ShipmentId { get; set; }
		public string TrackingNumber { get; set; }
		public string? Carrier { get; set; }
		public string? ShipmentStatus { get; set; }
	}
}
