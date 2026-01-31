using ECommerceMS.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : Controller
    {
        private readonly AppDbContext _context;

        public OrderController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetAllOrders()
        {
            var orders = await _context.OrderDetails.AsNoTracking().Include(o => o.Product).ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDetail>> GetOrderById(int id)
        {
            var order = await _context.OrderDetails.AsNoTracking().Include(o => o.Product).FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound($"Order with ID {id} not found.");
            }

            return Ok(order);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto input)
        {
            if (input.ProductId <= 0)
                return BadRequest(new { success = false, message = "ProductId is required." });

            if (input.Quantity <= 0)
                return BadRequest(new { success = false, message = "Quantity must be greater than 0." });

            var product = await _context.ProductDetails
                                        .FirstOrDefaultAsync(p => p.ProductId == input.ProductId);

            if (product == null)
                return BadRequest(new { success = false, message = "Invalid ProductId." });

            var totalPrice = product.Price * input.Quantity;

            var order = new OrderDetail
            {
                ProductId = input.ProductId,
                Quantity = input.Quantity,
                TotalPrice = totalPrice,
                OrderDate = DateTime.UtcNow,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };

            _context.OrderDetails.Add(order);
            var result = await _context.SaveChangesAsync();

            if (result > 0)
                return Ok(new { success = true, message = "Order created successfully." });

            return StatusCode(500, new { success = false, message = "Failed to create order." });
        }


        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] CreateOrderDto input)
        {
            if (input.ProductId <= 0)
                return BadRequest(new { success = false, message = "ProductId is required." });

            if (input.Quantity <= 0)
                return BadRequest(new { success = false, message = "Quantity must be greater than 0." });

            var existingOrder = await _context.OrderDetails.FindAsync(id);

            if (existingOrder == null)
                return NotFound(new { success = false, message = "Order not found." });

            var product = await _context.ProductDetails
                                        .FirstOrDefaultAsync(p => p.ProductId == input.ProductId);

            if (product == null)
                return BadRequest(new { success = false, message = "Invalid ProductId." });

            existingOrder.ProductId = input.ProductId;
            existingOrder.Quantity = input.Quantity;
            existingOrder.TotalPrice = product.Price * input.Quantity;
            existingOrder.UpdatedDate = DateTime.UtcNow;

            var result = await _context.SaveChangesAsync();

            if (result > 0)
                return Ok(new { success = true, message = "Order updated successfully." });

            return StatusCode(500, new { success = false, message = "Failed to update order." });
        }
    }
    public class CreateOrderDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
