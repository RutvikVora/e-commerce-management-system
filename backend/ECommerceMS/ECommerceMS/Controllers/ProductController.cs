using ECommerceMS.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : Controller
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDetail>>> GetAllProducts()
        {
            var products = await _context.ProductDetails.AsNoTracking().ToListAsync();

            return Ok(products);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProductDetail>> GetProductById(int id)
        {
            var product = await _context.ProductDetails.AsNoTracking().FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
            {
                return NotFound($"Product with ID {id} not found.");
            }

            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto input)
        {
            if (string.IsNullOrWhiteSpace(input.Name))
                return BadRequest(new { success = false, message = "Name is required." });

            if (input.Price <= 0)
                return BadRequest(new { success = false, message = "Price must be greater than 0." });

            if (input.Stock <= 0)
                return BadRequest(new { success = false, message = "Stock must be greater than 0." });

            var product = new ProductDetail
            {
                Name = input.Name,
                Price = input.Price,
                Stock = input.Stock,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };

            _context.ProductDetails.Add(product);
            var result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                return Ok(new { success = true, message = "Product created successfully." });
            }

            return StatusCode(500, new { success = false, message = "Failed to create product." });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] CreateProductDto input)
        {
            if (string.IsNullOrWhiteSpace(input.Name))
                return BadRequest(new { success = false, message = "Name is required." });

            if (input.Price <= 0)
                return BadRequest(new { success = false, message = "Price must be greater than 0." });

            if (input.Stock <= 0)
                return BadRequest(new { success = false, message = "Stock must be greater than 0." });

            var existingProduct = await _context.ProductDetails.FindAsync(id);

            if (existingProduct == null)
                return NotFound(new { success = false, message = "Product not found." });

            existingProduct.Name = input.Name;
            existingProduct.Price = input.Price;
            existingProduct.Stock = input.Stock;
            existingProduct.UpdatedDate = DateTime.UtcNow;

            var result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                return Ok(new { success = true, message = "Product updated successfully." });
            }

            return StatusCode(500, new { success = false, message = "Failed to update product." });
        }
    }

    public class CreateProductDto
    {
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int Stock { get; set; }
    }
}
