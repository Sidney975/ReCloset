﻿using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Mysqlx.Crud;
using Backend.Models.Jerald.Orders;
using Backend.Models.Sidney.Delivery;
using Shippo.Models.Components;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CheckoutController(MyDbContext context, IMapper mapper, EmailService emailService, ShippitService _shippitService) : ControllerBase
    {
        private readonly MyDbContext _context = context;
        private readonly IMapper _mapper = mapper;
        private readonly EmailService _emailService = emailService; // Add this line to initialize the email service

        private int GetUserId()
        {
            var Username = User.Claims
            .Where(c => c.Type == ClaimTypes.NameIdentifier)
            .Select(c => c.Value).SingleOrDefault();
            int userId = _context.Users.FirstOrDefault(u => u.UserId == Username).Id;
            return userId;
        }

        // GET: Get all orders
        [HttpGet, Authorize]
        [ProducesResponseType(typeof(IEnumerable<OrderDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Payment) // Include Payment details
                .Include(o => o.OrderItems) // Include associated OrderItems
                .Include(t => t.User)
				.Include(o => o.Deliveries)
				.Where(o => o.UserId == GetUserId())
                .OrderBy(x => x.OrderId)
                .ToListAsync();

			bool isUpdated = false;

			foreach (var order in orders)
            {
				string shipmentStatus = "Pending";

				order.User = _context.Users.FirstOrDefault(u => u.Id == order.UserId);
				var delivery = order.Deliveries.FirstOrDefault();

                Console.WriteLine($"testing:{delivery?.TrackingNumber}");


				if (!string.IsNullOrEmpty(delivery?.TrackingNumber))
				{
					try
					{
						var trackingInfo = await _shippitService.GetShipmentStatusAsync(delivery.TrackingNumber);
                        Console.WriteLine($"tracking info:{trackingInfo.Status}");
						if (Enum.TryParse(trackingInfo.Status, true, out Backend.Models.Jerald.Orders.ShipmentStatus shipmentStatusEnum))
						{
							if (order.ShipmentStatus != shipmentStatusEnum)
							{
								order.ShipmentStatus = shipmentStatusEnum;
								isUpdated = true; // Mark as updated
							}
						}
						else
						{
							order.ShipmentStatus = Backend.Models.Jerald.Orders.ShipmentStatus.Pending; // Default fallback
						}
					}
					catch (Exception ex)
					{
						Console.WriteLine($"Error fetching tracking info for Order {order.OrderId}: {ex.Message}");
					}
                    
				}
			}

			if (isUpdated) // Save changes only if necessary
			{
				await _context.SaveChangesAsync();
				Console.WriteLine("Updated shipment statuses saved to database.");
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
        public async Task<IActionResult> CreateOrderAsync([FromBody] CreateOrderRequestDTO createOrderRequest)
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
            };

            _context.Orders.Add(order);
            _context.SaveChanges(); // Generate OrderId

			var orderAddress = new OrderAddress
			{
				OrderId = order.OrderId,
				RecipientName = createOrderRequest.RecipientName,
				StreetAddress = createOrderRequest.StreetAddress,
				Suburb = createOrderRequest.Suburb,
				State = createOrderRequest.State,
				Postcode = createOrderRequest.Postcode,
				Country = createOrderRequest.Country
			};
			_context.OrderAddresses.Add(orderAddress);
			_context.SaveChanges();

			// Add OrderItems
			var orderItems = createOrderRequest.OrderItems.Select(item => new OrderItem
            {
                OrderId = order.OrderId,
                ProductName = item.ProductName,
                ProductCategory = item.ProductCategory,
                Gender = item.Gender,
                Quantity = item.Quantity,
                ItemPrice = item.ItemPrice,
                TimeBought = DateTime.UtcNow // Stores date and time
            }).ToList();

            _context.OrderItems.AddRange(orderItems);
            _context.SaveChanges();

            // Send invoice email
            await _emailService.SendInvoiceEmailAsync(order.OrderId);

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
                order.ShipmentStatus = (Models.Jerald.Orders.ShipmentStatus)updateOrderRequest.ShipmentStatus.Value;
            }

            if (updateOrderRequest.OrderItems != null && updateOrderRequest.OrderItems.Any())
            {
                // Process existing and new order items
                var updatedOrderItems = updateOrderRequest.OrderItems.ToDictionary(i => i.OrderItemId);
                var existingOrderItems = order.OrderItems.ToDictionary(i => i.OrderItemId);

                // Update existing items
                foreach (var item in existingOrderItems)
                {
                    if (updatedOrderItems.TryGetValue(item.Key, out var updatedItem))
                    {
                        item.Value.Quantity = updatedItem.Quantity;
                        item.Value.ItemPrice = updatedItem.ItemPrice;
                        item.Value.ProductName = updatedItem.ProductName;
                        item.Value.Gender = updatedItem.Gender;
                        item.Value.ProductCategory = updatedItem.ProductCategory;
                        item.Value.TimeBought = updatedItem.TimeBought;
                        updatedOrderItems.Remove(item.Key);
                    }
                    else
                    {
                        _context.OrderItems.Remove(item.Value);
                    }
                }

                // Add new items
                foreach (var newItem in updatedOrderItems.Values)
                {
                    var newOrderItem = new OrderItem
                    {
                        OrderId = order.OrderId,
                        ProductName = newItem.ProductName,
                        ProductCategory = newItem.ProductCategory,
                        Gender = newItem.Gender,
                        Quantity = newItem.Quantity,
                        ItemPrice = newItem.ItemPrice,
                        TimeBought = newItem.TimeBought
                    };
                    _context.OrderItems.Add(newOrderItem);
                }
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
                    ProductName = item.ProductName,
                    ProductCategory = item.ProductCategory,
                    Quantity = item.Quantity,
                    Gender = item.Gender,
                    ItemPrice = item.ItemPrice,
                    TimeBought = item.TimeBought
                }).ToList()
            };

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

        [HttpGet("orderAddress")]
        public IActionResult GetOrderAddress(int orderId)
        {
            var orderAddress = _context.OrderAddresses.FirstOrDefault(o => o.OrderId == orderId);
            if (orderAddress == null)
            {
                return NotFound("Order address not found.");
            }
            return Ok(orderAddress);
        }
    }
}
