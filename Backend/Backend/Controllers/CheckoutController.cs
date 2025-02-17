using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Mysqlx.Crud;
using Backend.Models.Jerald.Orders;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CheckoutController(MyDbContext context, IMapper mapper) : ControllerBase
    {

        private int GetUserId()
        {
            return Convert.ToInt32(User.Claims
            .Where(c => c.Type == ClaimTypes.NameIdentifier)
            .Select(c => c.Value).SingleOrDefault());
        }

        private readonly MyDbContext _context = context;
        private readonly IMapper _mapper = mapper;

        // GET: Get all orders
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OrderDTO>), StatusCodes.Status200OK)]
        public IActionResult GetAllOrders()
        {
            var orders = _context.Orders
                .Include(o => o.Payment) // Include Payment details
                .Include(o => o.OrderItems) // Include associated OrderItems
                .Include(t => t.User)
                .Where(o => o.UserId == GetUserId())
                .OrderBy(x => x.OrderId)
                .ToList();

            foreach (var order in orders)
            {
                order.User = _context.Users.FirstOrDefault(u => u.Id == order.UserId);
            }

            // Map orders to OrderDTO
            var orderDtos = orders.Select(_mapper.Map<OrderDTO>);
            return Ok(orderDtos);
        }


        [HttpGet("{id}")]
        [ProducesResponseType(typeof(OrderDTO), StatusCodes.Status200OK)]
        public IActionResult GetOrderById(int id)
        {
            var order = _context.Orders
                .Include(o => o.Payment) // Include Payment details
                .Include(o => o.OrderItems) // Include associated OrderItems
                .Include(t => t.User)
                .Where(o => o.UserId == GetUserId())
                .FirstOrDefault(o => o.OrderId == id);

            order.User = _context.Users.FirstOrDefault(u => u.Id == order.UserId);


            if (order == null)
            {
                return NotFound("Order not found.");
            }

            // Map order to OrderDTO
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

            // Validate payment method and ensure it's not soft-deleted
            var payment = _context.Payments.FirstOrDefault(p => p.PaymentId == createOrderRequest.PaymentId && !p.IsDeleted);
            if (payment == null)
            {
                return BadRequest("Invalid or deleted payment method.");
            }
            var userId = GetUserId();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null)
            {
                return BadRequest("Invalid user.");
            }
            // Create the Order
            var order = new Models.Jerald.Orders.Order
            {
                OrderDate = DateTime.Now,
                DeliveryOption = (DeliveryOption)createOrderRequest.DeliveryOption,
                Payment = payment,
                TotalPrice = createOrderRequest.TotalPrice,
                VoucherId = createOrderRequest.VoucherId,
				UserId = userId,
                User = user
            };

            Console.WriteLine($"Order {order.OrderId}: UserId={order.UserId}, UserDetails={order.User?.First_name}");

            // Save the Order to generate OrderId
            _context.Orders.Add(order);
            _context.SaveChanges();

            // Add OrderItems
            var orderItems = createOrderRequest.OrderItems.Select(item => new OrderItem
            {
                OrderId = order.OrderId,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                ItemPrice = item.ItemPrice
            }).ToList();
            _context.OrderItems.AddRange(orderItems);
            _context.SaveChanges();

            // Map to OrderDTO
            var orderDto = _mapper.Map<OrderDTO>(order);

            return CreatedAtAction(nameof(GetOrderById), new { id = order.OrderId }, orderDto);
        }


        // PUT: Update an existing order
        [HttpPut("{id}"), Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult UpdateOrder(int id, [FromBody] UpdateOrderRequestDto updateOrderRequest)
        {
            int userId = GetUserId();

            // Retrieve the existing order
            var order = _context.Orders
                .Include(o => o.OrderItems) // Include associated OrderItems
                .FirstOrDefault(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            if (order.UserId != userId)
            {
                return Forbid();
            }

            // Update the DeliveryOption if provided
            if (updateOrderRequest.DeliveryOption.HasValue)
            {
                order.DeliveryOption = (DeliveryOption)updateOrderRequest.DeliveryOption.Value;
            }

            // Update the ShipmentStatus if provided
            if (updateOrderRequest.ShipmentStatus.HasValue)
            {
                order.ShipmentStatus = (ShipmentStatus)updateOrderRequest.ShipmentStatus.Value;
            }

            // Update the OrderItems if provided
            if (updateOrderRequest.OrderItems != null && updateOrderRequest.OrderItems.Any())
            {
                // Remove existing OrderItems
                _context.OrderItems.RemoveRange(order.OrderItems);

                // Add updated OrderItems
                var updatedOrderItems = updateOrderRequest.OrderItems.Select(itemDto => new OrderItem
                {
                    OrderId = order.OrderId, // Associate with the existing Order
                    ProductId = itemDto.ProductId,
                    Quantity = itemDto.Quantity,
                    ItemPrice = itemDto.ItemPrice
                }).ToList();

                _context.OrderItems.AddRange(updatedOrderItems);
            }

            // Save changes to the database
            _context.SaveChanges();

            // Prepare response DTO
            var updatedOrderDto = new OrderDTO
            {
                OrderId = order.OrderId,
                DeliveryMethod = order.DeliveryOption.ToString(),
                Status = order.ShipmentStatus.ToString(),
                TotalPrice = order.OrderItems.Sum(item => item.Quantity * item.ItemPrice),
                OrderItems = order.OrderItems.Select(item => new BasicOrderItemDTO
                {
                    Quantity = item.Quantity,
                    ItemPrice = item.ItemPrice
                }).ToList()
            };

            // Return the updated order
            return Ok(updatedOrderDto);
        }



        [HttpDelete("{id}")]
        public IActionResult DeleteOrder(int id)
        {
            // Find the order by ID
            var order = _context.Orders
                .Include(o => o.OrderItems) // Include related order items
                .FirstOrDefault(o => o.OrderId == id);

            // If the order is not found, return 404
            if (order == null)
            {
                return NotFound("Order not found.");
            }

            // Remove associated order items
            _context.OrderItems.RemoveRange(order.OrderItems);

            // Remove the order itself
            _context.Orders.Remove(order);

            // Save changes to the database
            _context.SaveChanges();

            // Return 204 No Content as the order has been successfully deleted
            return Ok();
        }

    }
}
