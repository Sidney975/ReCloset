using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using System.IO;

namespace Backend.Controllers
{
    [Route("api/removebackground")]
    [ApiController]
    public class RemoveBackgroundController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public RemoveBackgroundController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        [HttpPost]
        public async Task<IActionResult> RemoveBackground([FromBody] ImageRequest request)
        {
            if (string.IsNullOrEmpty(request.ImageUrl))
            {
                Console.WriteLine("❌ No Image URL received!");
                return BadRequest(new { message = "Image URL is required." });
            }

            try
            {
                // **DEBUG: Print out received Image URL**
                Console.WriteLine("🔵 Received Image Data:", request.ImageUrl.Substring(0, 100)); // Print only first 100 chars

                // **Extract only the Base64 data (remove "data:image/png;base64,")**
                var base64Data = request.ImageUrl.Split(',')[1];

                // Convert Base64 to byte array
                byte[] imageBytes = Convert.FromBase64String(base64Data);

                using var formData = new MultipartFormDataContent();
                formData.Add(new ByteArrayContent(imageBytes), "image_file", "image.png");
                formData.Add(new StringContent("auto"), "size");

                _httpClient.DefaultRequestHeaders.Add("X-Api-Key", "EVDhwfcWygnRUKFvci5i7sDa");

                // Send request to Remove.bg
                var removeBgResponse = await _httpClient.PostAsync("https://api.remove.bg/v1.0/removebg", formData);

                if (!removeBgResponse.IsSuccessStatusCode)
                {
                    Console.WriteLine($"❌ Remove.bg failed: {removeBgResponse.StatusCode}");
                    return BadRequest(new { message = "Failed to remove background." });
                }

                // Convert response to Base64
                byte[] processedImageBytes = await removeBgResponse.Content.ReadAsByteArrayAsync();
                string base64Image = $"data:image/png;base64,{Convert.ToBase64String(processedImageBytes)}";

                return Ok(new { image = base64Image });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error processing image: {ex.Message}");
                return BadRequest(new { message = $"Error processing image: {ex.Message}" });
            }
        }

    }

    public class ImageRequest
    {
        public string ImageUrl { get; set; }
    }
}
