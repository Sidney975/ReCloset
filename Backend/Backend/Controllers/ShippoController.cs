using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

namespace Backend.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class ShippoController : ControllerBase
	{
		private readonly HttpClient _httpClient;
		private readonly string _shippoApiKey;

		public ShippoController(IConfiguration configuration)
		{
			_httpClient = new HttpClient();
			_shippoApiKey = configuration["Shippo:ApiKey"]; // Load API key from config
			_httpClient.DefaultRequestHeaders.Clear();
			_httpClient.DefaultRequestHeaders.Add("Authorization", $"ShippoToken {_shippoApiKey}");
		}

		// Create a shipment
		[HttpPost("create-shipment")]
		public async Task<IActionResult> CreateShipment([FromBody] ShipmentRequest shipmentRequest)
		{
			var payload = new
			{
				address_from = shipmentRequest.AddressFrom,
				address_to = shipmentRequest.AddressTo,
				parcels = shipmentRequest.Parcels,
				carrier_accounts = new string[] { }, // Shippo chooses the best option
				async = false
			};

			var response = await _httpClient.PostAsync("https://api.goshippo.com/shipments/",
				new StringContent(Newtonsoft.Json.JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json"));

			if (!response.IsSuccessStatusCode)
			{
				return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
			}

			var shipmentResponse = await response.Content.ReadAsStringAsync();
			return Ok(JObject.Parse(shipmentResponse));
		}

		// Track a shipment
		[HttpGet("track/{carrier}/{trackingNumber}")]
		public async Task<IActionResult> TrackShipment(string carrier, string trackingNumber)
		{
			// Ensure API key is set
			_httpClient.DefaultRequestHeaders.Clear();
			_httpClient.DefaultRequestHeaders.Add("Authorization", $"ShippoToken {_shippoApiKey}");

			// Create Shippo Tracking API request URL
			string trackingUrl = $"https://api.goshippo.com/tracks/{carrier}/{trackingNumber}/";

			// Send GET request to Shippo API
			var trackingResponse = await _httpClient.GetAsync(trackingUrl);
			var trackingData = await trackingResponse.Content.ReadAsStringAsync();

			Console.WriteLine("Shippo Tracking API Response: " + trackingData);

			// Check if request was successful
			if (!trackingResponse.IsSuccessStatusCode)
			{
				return StatusCode((int)trackingResponse.StatusCode, trackingData);
			}

			// Parse response JSON
			var trackingJson = JObject.Parse(trackingData);

			// Extract relevant tracking details
			var trackingStatus = trackingJson["tracking_status"]?.ToString() ?? "UNKNOWN";
			var trackingUrlProvider = trackingJson["tracking_url_provider"]?.ToString() ?? "No URL available";
			var estimatedDelivery = trackingJson["eta"]?.ToString() ?? "No ETA available";

			// Return tracking details
			return Ok(new
			{
				TrackingNumber = trackingNumber,
				Carrier = carrier,
				Status = trackingStatus,
				EstimatedDelivery = estimatedDelivery,
				TrackingURL = trackingUrlProvider
			});
		}

	}

	// Shipment Request Model
	public class ShipmentRequest
	{
		public object AddressFrom { get; set; }
		public object AddressTo { get; set; }
		public object[] Parcels { get; set; }
	}
}
