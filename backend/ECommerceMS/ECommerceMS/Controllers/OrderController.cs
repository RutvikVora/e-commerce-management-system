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
            var orders = await (from o in _context.OrderDetails.AsNoTracking() join p in _context.ProductDetails.AsNoTracking() on o.ProductId equals p.ProductId into productGroup from p in productGroup.DefaultIfEmpty()
                select new OrderDetailDto
                {
                    OrderId = o.OrderId,
                    ProductId = o.ProductId,
                    ProductName = p != null ? p.Name : null,
                    Quantity = o.Quantity,
                    TotalPrice = o.TotalPrice,
                    OrderDate = o.OrderDate
                }
            ).ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDetailDto>> GetOrderById(int id)
        {
            var order = await (
                from o in _context.OrderDetails.AsNoTracking()
                join p in _context.ProductDetails.AsNoTracking()
                    on o.ProductId equals p.ProductId into productGroup
                from p in productGroup.DefaultIfEmpty()
                where o.OrderId == id
                select new OrderDetailDto
                {
                    OrderId = o.OrderId,
                    ProductId = o.ProductId,
                    ProductName = p != null ? p.Name : null,
                    Quantity = o.Quantity,
                    TotalPrice = o.TotalPrice,
                    OrderDate = o.OrderDate
                }
            ).FirstOrDefaultAsync();

            if (order == null)
                return NotFound(new { success = false, message = $"Order with ID {id} not found." });

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

            if (product.Stock < input.Quantity)
                return BadRequest(new { success = false, message = "Insufficient stock." });

            // 🔻 Reduce stock
            product.Stock -= input.Quantity;

            var order = new OrderDetail
            {
                ProductId = input.ProductId,
                Quantity = input.Quantity,
                TotalPrice = product.Price * input.Quantity,
                OrderDate = DateTime.UtcNow,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };

            _context.OrderDetails.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Order created successfully.",
                data = new
                {
                    order.OrderId,
                    order.ProductId,
                    ProductName = product.Name,
                    order.Quantity,
                    order.TotalPrice,
                    order.OrderDate,
                    RemainingStock = product.Stock
                }
            });
        }

    }
    public class CreateOrderDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class OrderDetailDto
    {
        public int OrderId { get; set; }
        public int? ProductId { get; set; }
        public string? ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal? TotalPrice { get; set; }
        public DateTime OrderDate { get; set; }
    }
}
