using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("chat")]
[ApiController]
public class ChatController : ControllerBase
{
    private readonly ChatbotService _chatbotService;

    public ChatController(ChatbotService chatbotService)
    {
        _chatbotService = chatbotService;
    }

    [HttpPost("ask")]
    public async Task<IActionResult> GetResponse([FromBody] Dictionary<string, string> input)
    {
        if (!input.ContainsKey("question"))
            return BadRequest("Question missing");

        var response = await _chatbotService.GetResponseAsync(input["question"]);
        return Ok(new { response });
    }
}
