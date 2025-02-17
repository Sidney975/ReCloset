using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Backend.Models.Jerald
{
    [Route("FashionAdvice")]
    [ApiController]
    public class FashionAdviceController : ControllerBase
    {
        private readonly FashionAdviceService _fashionAdviceService;

        public FashionAdviceController(FashionAdviceService fashionAdviceService)
        {
            _fashionAdviceService = fashionAdviceService;
        }

        [HttpPost("advice")]
        public async Task<IActionResult> GetAdvice([FromBody] FashionAdviceRequest request)
        {
            var advice = await _fashionAdviceService.GetAdviceAsync(request.Input);
            return Ok(new { advice });
        }
    }

    public class FashionAdviceRequest
    {
        public string Input { get; set; }
    }
}
