using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Backend.Models.Sidney.Delivery;
using System.Net.Http.Headers;
using System.Text.Json;
using Newtonsoft.Json.Linq;

namespace Backend
{
	public class ShippitService
	{
		private readonly HttpClient _httpClient;
		private readonly string _apiKey;

		public ShippitService(HttpClient httpClient, IConfiguration configuration)
		{
			_httpClient = httpClient;
			// Store your API key securely (e.g., in appsettings.json or user secrets)
			_apiKey = configuration["Shippit:ApiKey"];
		}


		public async Task<ShippitShipmentResponse> CreateShipmentAsync(ShippitShipmentRequest request)
		{
			var url = "https://app.shippit.com/api/3/orders";

			var jsonContent = new StringContent(JsonConvert.SerializeObject(request), Encoding.UTF8, "application/json");

			_httpClient.DefaultRequestHeaders.Clear();
			_httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

			var response = await _httpClient.PostAsync(url, jsonContent);

			if (!response.IsSuccessStatusCode)
			{
				var errorContent = await response.Content.ReadAsStringAsync();
				throw new Exception($"Shippit API error: {errorContent}");
			}

			var responseContent = await response.Content.ReadAsStringAsync();

			// Log raw response for debugging
			Console.WriteLine($"Shippit Order ResponseService: {responseContent}");

			// Deserialize properly by extracting "response" object
			var responseObject = JsonConvert.DeserializeObject<JObject>(responseContent);
			var shipmentResponse = responseObject["response"]?.ToObject<ShippitShipmentResponse>();

			if (shipmentResponse != null)
			{
				Console.WriteLine($"Shippit Order ID: {shipmentResponse.ShipmentId}");
			}
			else
			{
				Console.WriteLine("Error: Shipment Response is null");
			}

			return shipmentResponse;
		}




		public async Task<ShippitShipmentResponse> GetShipmentStatusAsync(string shipmentId)
		{
			_httpClient.DefaultRequestHeaders.Clear();
			_httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

			var response = await _httpClient.GetAsync($"https://app.shippit.com/api/3/orders/{shipmentId}/tracking");

			if (!response.IsSuccessStatusCode)
			{
				var errorContent = await response.Content.ReadAsStringAsync();
				throw new Exception($"Shippit API error: {errorContent}");
			}

			var responseContent = await response.Content.ReadAsStringAsync();

			// Parse the JSON response
			var jsonObject = JObject.Parse(responseContent);

			// Extract tracking information
			var trackArray = jsonObject["response"]?["track"] as JArray;

			if (trackArray == null || !trackArray.Any())
			{
				return new ShippitShipmentResponse
				{
					ShipmentId = shipmentId,
					TrackingNumber = jsonObject["response"]?["tracking_number"]?.ToString(),
					TrackingUrl = jsonObject["response"]?["tracking_url"]?.ToString(),
					Status = "No status available"
				};
			}

			// Get the latest tracking status (assuming the last entry is the most recent)
			var latestStatus = trackArray.First();
			var shipmentStatus = latestStatus["status"]?.ToString();
			var statusOwner = latestStatus["status_owner"]?.ToString();
			var date = latestStatus["date"]?.ToString();

			return new ShippitShipmentResponse
			{
				ShipmentId = shipmentId,
				TrackingNumber = jsonObject["response"]?["tracking_number"]?.ToString(),
				TrackingUrl = jsonObject["response"]?["tracking_url"]?.ToString(),
				Status = shipmentStatus
			};
		}

	}
}
