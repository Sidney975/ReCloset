using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using Backend.Models.Jerald.Orders;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;

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
                result = result.Where(p => p.ProductName.Contains(search.ToString()));
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

            // Ensure TimeBought is set to the current date if not provided
            if (orderItem.TimeBought == default)
            {
                orderItem.TimeBought = DateTime.UtcNow.Date;
            }

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

            orderItem.ProductName = updatedOrderItem.ProductName;
            orderItem.ProductCategory = updatedOrderItem.ProductCategory;
            orderItem.Gender = updatedOrderItem.Gender;
            orderItem.Quantity = updatedOrderItem.Quantity;
            orderItem.ItemPrice = updatedOrderItem.ItemPrice;
            orderItem.TimeBought = updatedOrderItem.TimeBought;

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

        [HttpGet("search")]
        public IActionResult SearchOrderItems(string search)
        {
            if (string.IsNullOrEmpty(search))
            {
                return BadRequest("Search query cannot be empty.");
            }

            var result = _context.OrderItems // Include related entities if needed
                .Where(o => o.ProductName.Contains(search) ||
                            o.ProductCategory.Contains(search))
                .OrderBy(o => o.OrderItemId)
                .Select(o => new
                {
                    o.OrderItemId,
                    o.ProductName,
                    o.ProductCategory,
                    o.Gender,
                    QuantityBought = o.Quantity,
                    TotalSales = o.ItemPrice * o.Quantity,
                    o.TimeBought
                })
                .ToList();

            return Ok(result);
        }

        // GET: Get aggregated sales data for a graph
        [HttpGet("graph")]
        public IActionResult GetOrderItemsGraph([FromQuery] string filterBy = "product")
        {
            if (filterBy == "gender")
            {
                var genderData = _context.OrderItems
                    .GroupBy(o => o.Gender)
                    .Select(g => new
                    {
                        Gender = g.Key ? "Male" : "Female",  // Ensure labels are set correctly
                        TotalQuantity = g.Sum(x => x.Quantity),
                        TotalSales = g.Sum(x => x.Quantity * x.ItemPrice)
                    })
                    .OrderByDescending(g => g.TotalSales)
                    .ToList();

                return Ok(genderData);
            }

            else if (filterBy == "category")
            {
                var categoryData = _context.OrderItems
                    .GroupBy(o => o.ProductCategory)
                    .Select(g => new
                    {
                        CategoryName = g.Key,
                        TotalQuantity = g.Sum(x => x.Quantity),
                        TotalSales = g.Sum(x => x.Quantity * x.ItemPrice)
                    })
                    .OrderByDescending(g => g.TotalSales)
                    .ToList();

                return Ok(categoryData);
            }
            else
            {
                var productData = _context.OrderItems
                    .GroupBy(o => o.ProductName)
                    .Select(g => new
                    {
                        ProductName = g.Key,
                        TotalQuantity = g.Sum(x => x.Quantity),
                        TotalSales = g.Sum(x => x.Quantity * x.ItemPrice)
                    })
                    .OrderByDescending(g => g.TotalSales)
                    .ToList();

                return Ok(productData);
            }
        }

        // GET: Get a list of order items with product and category details
        [HttpGet("list")]
        public IActionResult GetOrderItemsList()
        {
            var orderItems = _context.OrderItems
                .Select(o => new
                {
                    id = o.OrderItemId,
                    o.ProductName,
                    o.ProductCategory,
                    Gender = o.Gender,
                    QuantityBought = o.Quantity,
                    TotalSales = o.Quantity * o.ItemPrice,
                    TimeBought = o.TimeBought
                })
                .OrderByDescending(x => x.TotalSales)
                .ToList();

            Console.WriteLine($"Total Order Items Retrieved: {orderItems.Count}");
            return Ok(orderItems);
        }

        [HttpPost("import-excel")]
        public async Task<IActionResult> ImportFromExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var newOrderItems = new List<OrderItem>();

            try
            {
                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    using (var package = new ExcelPackage(stream))
                    {
                        var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                        if (worksheet == null)
                        {
                            return BadRequest("Invalid Excel file.");
                        }

                        var existingOrderIds = _context.Orders.Select(o => o.OrderId).ToHashSet();
                        int rowCount = worksheet.Dimension.Rows;

                        for (int row = 2; row <= rowCount; row++) // Start from row 2 (skip headers)
                        {
                            int orderId = int.Parse(worksheet.Cells[row, 2].Text);
                            if (!existingOrderIds.Contains(orderId))
                            {
                                return BadRequest($"OrderId {orderId} does not exist at row {row}.");
                            }

                            if (string.IsNullOrEmpty(worksheet.Cells[row, 3].Text)) continue; // Skip empty rows

                            DateTime parsedDate;
                            if (!DateTime.TryParse(worksheet.Cells[row, 8].Text, out parsedDate))
                            {
                                return BadRequest($"Invalid date format at row {row}, This is the datetime {worksheet.Cells[row, 7].Text}.");
                            }

                            // Convert gender text to bool
                            string genderText = worksheet.Cells[row, 5].Text.ToLower().Trim();
                            Console.WriteLine($"Row {row}: Gender Text = '{genderText}'");

                            bool genderValue;
                            if (genderText == "male" || genderText == "m")
                            {
                                genderValue = true; // Male as true
                            }
                            else if (genderText == "female" || genderText == "f")
                            {
                                genderValue = false; // Female as false
                            }
                            else if (genderText == "true" || genderText =="t")
                            {
                                genderValue = true;
                            }
                            else if (genderText == "false" || genderText == "f")
                            {
                                genderValue = false;
                            }
                            else
                            {
                                return BadRequest($"Invalid gender value at row {row}. Expected 'male' or 'female'.");
                            }

                            var orderItem = new OrderItem
                            {
                                OrderId = int.Parse(worksheet.Cells[row, 2].Text),
                                ProductName = worksheet.Cells[row, 3].Text,
                                ProductCategory = worksheet.Cells[row, 4].Text,
                                Gender = genderValue,
                                Quantity = int.Parse(worksheet.Cells[row, 6].Text), // Corrected the column index for quantity
                                ItemPrice = decimal.Parse(worksheet.Cells[row, 7].Text), // Corrected column index for price
                                TimeBought = parsedDate.Date // Stores only the date
                            };

                            newOrderItems.Add(orderItem);
                        }

                        _context.OrderItems.AddRange(newOrderItems);
                        await _context.SaveChangesAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }

            return Ok(new { Message = $"{newOrderItems.Count} order items imported successfully!" });
        }



        [HttpGet("export-excel")]
        public IActionResult ExportToExcel()
        {
            var orderItems = _context.OrderItems.ToList();

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Order Items");

                // Add headers
                worksheet.Cells[1, 1].Value = "OrderItemId";
                worksheet.Cells[1, 2].Value = "OrderId";
                worksheet.Cells[1, 3].Value = "ProductName";
                worksheet.Cells[1, 4].Value = "ProductCategory";
                worksheet.Cells[1, 5].Value = "Gender";
                worksheet.Cells[1, 6].Value = "Quantity";
                worksheet.Cells[1, 7].Value = "ItemPrice";
                worksheet.Cells[1, 8].Value = "TimeBought";

                // Populate rows
                for (int i = 0; i < orderItems.Count; i++)
                {
                    worksheet.Cells[i + 2, 1].Value = orderItems[i].OrderItemId;
                    worksheet.Cells[i + 2, 2].Value = orderItems[i].OrderId;
                    worksheet.Cells[i + 2, 3].Value = orderItems[i].ProductName;
                    worksheet.Cells[i + 2, 4].Value = orderItems[i].ProductCategory;

                    // Convert bool to "Male" or "Female"
                    worksheet.Cells[i + 2, 5].Value = orderItems[i].Gender ? "Male" : "Female";

                    worksheet.Cells[i + 2, 6].Value = orderItems[i].Quantity;
                    worksheet.Cells[i + 2, 7].Value = orderItems[i].ItemPrice;
                    worksheet.Cells[i + 2, 8].Value = orderItems[i].TimeBought.ToString("yyyy-MM-dd");
                }

                var stream = new MemoryStream(package.GetAsByteArray());

                return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "OrderItems.xlsx");
            }
        }


    }
}
