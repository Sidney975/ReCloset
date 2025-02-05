using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using Backend.Models.Jerald.Orders;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrderItemController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext _context = context;

        // GET: Get all order items
        [HttpGet]
        public IActionResult GetAllOrderItems(int? search)
        {
            IQueryable<OrderItem> result = _context.OrderItems;
            if (search != null)
            {
                result = result.Where(p => p.ProductId.Equals(search));
            }
            var list = result.OrderBy(x => x.OrderItemId).ToList();
            return Ok(list);
        }

        // GET: Get an order item by ID
        [HttpGet("{id}")]
        public IActionResult GetOrderItemById(int id)
        {
            var orderItem = _context.OrderItems.Find(id);
            if (orderItem == null)
            {
                return NotFound("Order item not found.");
            }
            return Ok(orderItem);
        }

        // POST: Add a new order item
        [HttpPost]
        public IActionResult CreateOrderItem([FromBody] OrderItem orderItem)
        {
            if (orderItem == null)
            {
                return BadRequest("Invalid order item data.");
            }
            var myOrderItem = new OrderItem()
            {
                ProductId = orderItem.ProductId,
                Quantity = orderItem.Quantity,
                ItemPrice = orderItem.ItemPrice
            };

            _context.OrderItems.Add(orderItem);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetOrderItemById), new { id = orderItem.OrderItemId }, orderItem);
        }

        // PUT: Update an existing order item
        [HttpPut("{id}")]
        public IActionResult UpdateOrderItem(int id, [FromBody] OrderItem updatedOrderItem)
        {
            var orderItem = _context.OrderItems.Find(id);
            if (orderItem == null)
            {
                return NotFound("Order item not found.");
            }

            orderItem.Quantity = updatedOrderItem.Quantity;
            orderItem.ItemPrice = updatedOrderItem.ItemPrice;

            _context.SaveChanges();
            return Ok(orderItem);
        }

        // DELETE: Delete an order item
        [HttpDelete("{id}")]
        public IActionResult DeleteOrderItem(int id)
        {
            var orderItem = _context.OrderItems.Find(id);
            if (orderItem == null)
            {
                return NotFound("Order item not found.");
            }

            _context.OrderItems.Remove(orderItem);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
