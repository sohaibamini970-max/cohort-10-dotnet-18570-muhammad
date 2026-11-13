using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniversityPortal.API.Data;
using UniversityPortal.API.Models;
using UniversityPortal.API.Authorization;

namespace UniversityPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BatchesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BatchesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/batches
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var batches = await _context.Batches
                .OrderByDescending(b => b.StartYear)
                .ToListAsync();
            return Ok(batches);
        }

        // POST: api/batches
        [HttpPost]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> Create([FromBody] Batch batch)
        {
            if (string.IsNullOrWhiteSpace(batch.Name))
                return BadRequest(new { message = "Batch name is required." });

            var exists = await _context.Batches.AnyAsync(b => b.Name == batch.Name);
            if (exists)
                return Conflict(new { message = $"Batch '{batch.Name}' already exists." });

            batch.CreatedAt = DateTime.UtcNow;
            batch.IsActive = true;

            _context.Batches.Add(batch);
            await _context.SaveChangesAsync();

            return Ok(batch);
        }
    }
}