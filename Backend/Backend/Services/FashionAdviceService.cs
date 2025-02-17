using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

public class FashionAdviceService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model = "chatgpt-4o-latest"; // Ensure you're using the correct model
    private readonly string _apiUrl = "https://api.openai.com/v1/chat/completions";

    public FashionAdviceService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["OpenAI:ApiKey"];
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public async Task<string> GetAdviceAsync(string userInput)
    {
        var requestBody = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "system", content = "You are a fashion consultant providing clear outfit recommendations without using Markdown or bullet points." },
                new { role = "user", content = userInput }
            },
            max_tokens = 200
        };

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(_apiUrl, content);
        var responseString = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"Error: {response.StatusCode}, Response: {responseString}");
            return $"Error fetching fashion advice: {response.StatusCode}, {responseString}";
        }

        using JsonDocument doc = JsonDocument.Parse(responseString);
        JsonElement root = doc.RootElement;

        if (root.TryGetProperty("choices", out JsonElement choices) && choices.GetArrayLength() > 0)
        {
            string rawResponse = choices[0].GetProperty("message").GetProperty("content").GetString();

            // ✅ Remove Markdown formatting
            string cleanResponse = RemoveMarkdown(rawResponse);
            return cleanResponse;
        }

        return "Sorry, I couldn't generate a response.";
    }

    // ✅ Function to clean Markdown formatting
    private static string RemoveMarkdown(string text)
    {
        text = Regex.Replace(text, @"#+\s*", ""); // Remove # headings
        text = Regex.Replace(text, @"\*\*(.*?)\*\*", "$1"); // Remove bold (**text**)
        text = Regex.Replace(text, @"\*(.*?)\*", "$1"); // Remove italics (*text*)
        text = Regex.Replace(text, @"- ", ""); // Remove bullet points (- item)
        text = Regex.Replace(text, @"\n{2,}", "\n"); // Remove excessive new lines

        return text.Trim();
    }
}
