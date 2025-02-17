using Newtonsoft.Json;

namespace Backend.Models.Sidney.Delivery
{
	public class ShippitShipmentRequest
	{
		[JsonProperty("order")]
		public OrderDetails Order { get; set; }
	}

	public class OrderDetails
	{
		[JsonProperty("courier_type")]
		public string CourierType { get; set; } = "standard"; // Default to "standard"

		[JsonProperty("delivery_address")]
		public string DeliveryAddress { get; set; }

		[JsonProperty("delivery_postcode")]
		public string DeliveryPostcode { get; set; }

		[JsonProperty("delivery_state")]
		public string DeliveryState { get; set; }

		[JsonProperty("delivery_suburb")]
		public string DeliverySuburb { get; set; }

		[JsonProperty("authority_to_leave")]
		public string AuthorityToLeave { get; set; } = "Yes"; // Default

		[JsonProperty("parcel_attributes")]
		public List<ParcelAttribute> ParcelAttributes { get; set; }

		[JsonProperty("user_attributes")]
		public UserAttributes User { get; set; }
	}

	public class ParcelAttribute
	{
		[JsonProperty("qty")]
		public int Quantity { get; set; }

		[JsonProperty("weight")]
		public double Weight { get; set; }
	}

	public class UserAttributes
	{
		[JsonProperty("email")]
		public string Email { get; set; }

		[JsonProperty("first_name")]
		public string FirstName { get; set; }

		[JsonProperty("last_name")]
		public string LastName { get; set; }
	}
}
