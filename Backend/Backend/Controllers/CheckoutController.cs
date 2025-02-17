using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Backend.Models.Jerald.Orders;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CheckoutController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;

        public CheckoutController(MyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;  // ✅ Always return int, default 0
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OrderDTO>), StatusCodes.Status200OK)]
        public IActionResult GetAllOrders()
        {
            int userId = GetUserId();
            if (userId == 0) return Unauthorized("Invalid User ID");

            var orders = _context.Orders
                .Include(o => o.Payment)
                .Include(o => o.OrderItems)
                .Include(o => o.User)
                .Where(o => o.UserId == userId)  // ✅ `UserId` should be stored as `int`
                .OrderBy(o => o.OrderId)
                .ToList();

            var orderDtos = orders.Select(_mapper.Map<OrderDTO>);
            return Ok(orderDtos);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(OrderDTO), StatusCodes.Status200OK)]
        public IActionResult GetOrderById(int id)
        {
            int userId = GetUserId();
            if (userId == 0) return Unauthorized("Invalid User ID");

            var order = _context.Orders
                .Include(o => o.Payment)
                .Include(o => o.OrderItems)
                .Include(o => o.User)
                .FirstOrDefault(o => o.OrderId == id && o.UserId == userId);  // ✅ Ensure comparison is correct

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            var orderDto = _mapper.Map<OrderDTO>(order);
            return Ok(orderDto);
        }

        [HttpPost, Authorize]
        [ProducesResponseType(typeof(OrderDTO), StatusCodes.Status201Created)]
        public IActionResult CreateOrder([FromBody] CreateOrderRequestDTO createOrderRequest)
        {
            if (createOrderRequest == null || createOrderRequest.OrderItems == null || !createOrderRequest.OrderItems.Any())
            {
                return BadRequest("Order and order items must be provided.");
            }

            int userId = GetUserId();
            if (userId == 0) return Unauthorized("Invalid User ID");

            var user = _context.Users.FirstOrDefault(u => u.Id == userId);  // ✅ Ensure `UserId` is an `int`
            if (user == null)
            {
                return BadRequest("Invalid user.");
            }

            var payment = _context.Payments.FirstOrDefault(p => p.PaymentId == createOrderRequest.PaymentId && !p.IsDeleted);
            if (payment == null)
            {
                return BadRequest("Invalid or deleted payment method.");
            }

            var order = new Order
            {
                OrderDate = DateTime.UtcNow,
                DeliveryOption = (DeliveryOption)createOrderRequest.DeliveryOption,
                Payment = payment,
                TotalPrice = createOrderRequest.TotalPrice,
                VoucherId = createOrderRequest.VoucherId,
                UserId = userId  // ✅ Ensure UserId is stored as an `int`
            };

            _context.Orders.Add(order);
            _context.SaveChanges();

            var orderItems = createOrderRequest.OrderItems.Select(item => new OrderItem
            {
                OrderId = order.OrderId,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                ItemPrice = item.ItemPrice
            }).ToList();

            _context.OrderItems.AddRange(orderItems);
            _context.SaveChanges();

            var orderDto = _mapper.Map<OrderDTO>(order);
            return CreatedAtAction(nameof(GetOrderById), new { id = order.OrderId }, orderDto);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteOrder(int id)
        {
            var order = _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefault(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            _context.OrderItems.RemoveRange(order.OrderItems);
            _context.Orders.Remove(order);
            _context.SaveChanges();

            return Ok();
        }
    }
}
