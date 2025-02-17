using Newtonsoft.Json;

namespace Backend.Models.Sidney.Delivery
{
	public class ShippitShipmentResponse
	{
		[JsonProperty("id")]
		public string ShipmentId { get; set; }

		[JsonProperty("tracking_number")]
		public string TrackingNumber { get; set; }

		[JsonProperty("slug")]
		public string TrackingUrl { get; set; }

		[JsonProperty("state")]
		public string Status { get; set; }

		[JsonProperty("processing_state")]
		public string ProcessingState { get; set; }
	}
}
