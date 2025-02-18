using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

public class ChatbotService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _modelUrl = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";
    private readonly List<ChatResponse> _chatResponses;

    public ChatbotService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["HuggingFaceApiKey"];
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        // Load predefined responses
        var json = File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "Data", "response.json")); ;
        _chatResponses = JsonConvert.DeserializeObject<List<ChatResponse>>(json);
    }

    public async Task<string> GetResponseAsync(string userInput)
    {
        var requestBody = new
        {
            source_sentence = userInput,
            sentences = _chatResponses.ConvertAll(q => q.Question) // List of all questions
        };
        Console.WriteLine($"Request: {System.Text.Json.JsonSerializer.Serialize(requestBody)}");
        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        for (int i = 0; i < 10; i++) // Retry up to 10 times
        {
            var response = await _httpClient.PostAsync(_modelUrl, content);
            var responseString = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var similarityScores = System.Text.Json.JsonSerializer.Deserialize<List<float>>(responseString);

                // Find the best match
                int bestMatchIndex = 0;
                float bestMatchScore = similarityScores[0];

                for (int x = 1; x < similarityScores.Count; x++)
                {
                    if (similarityScores[x] > bestMatchScore)
                    {
                        bestMatchScore = similarityScores[x];
                        bestMatchIndex = x;
                    }
                }

                // Set a similarity threshold
                float threshold = 0.75f;
                if (bestMatchScore >= threshold)
                {
                    return _chatResponses[bestMatchIndex].Response;
                }
                else
                {
                    return "I'm sorry, but I don't have an answer for that.";
                }

            }
            else if (response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable)
            {
                await HandleServiceUnavailable(responseString);
            }
            else
            {
                return $"Error fetching response: {response.StatusCode}, {responseString}";
            }
        }

        return "Error: Model did not load after multiple attempts.";
    }

    private async Task HandleServiceUnavailable(string responseString)
    {
        try
        {
            using JsonDocument doc = JsonDocument.Parse(responseString);
            if (doc.RootElement.TryGetProperty("estimated_time", out JsonElement estimatedTimeElement))
            {
                double estimatedTime = estimatedTimeElement.GetDouble();
                int waitTimeMs = (int)(estimatedTime * 1000);
                Console.WriteLine($"Model is loading... Waiting {estimatedTime} seconds before retrying.");
                await Task.Delay(waitTimeMs);
            }
            else
            {
                Console.WriteLine("No estimated time found. Retrying in 10 seconds.");
                await Task.Delay(10000);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error parsing estimated time: {ex.Message}. Retrying in 10 seconds.");
            await Task.Delay(10000);
        }
    }
}

public class ChatResponse
{
    public string Question { get; set; }
    public string Response { get; set; }
}
