using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniversityPortal.API.Data;
using UniversityPortal.API.Models;
using UniversityPortal.API.Authorization;

namespace UniversityPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProgramsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProgramsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/programs
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] long? departmentId)
        {
            // 👇 Use DegreeProgram here
            var query = _context.Programs.Include(p => p.Department).AsQueryable();

            if (departmentId.HasValue)
                query = query.Where(p => p.DepartmentId == departmentId.Value);

            var programs = await query.OrderBy(p => p.Name).ToListAsync();
            return Ok(programs);
        }

        // GET: api/programs/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var program = await _context.Programs
                .Include(p => p.Department)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (program == null) return NotFound();
            return Ok(program);
        }

        // POST: api/programs
        [HttpPost]
        [RoleRequirementFilter("superadmin")]
        // 👇 Use DegreeProgram here
        public async Task<IActionResult> Create([FromBody] DegreeProgram program)
        {
            if (string.IsNullOrWhiteSpace(program.Name) || string.IsNullOrWhiteSpace(program.Code))
                return BadRequest(new { message = "Name and Code are required." });

            var exists = await _context.Programs.AnyAsync(p => p.Code == program.Code);
            if (exists)
                return Conflict(new { message = $"Program with code '{program.Code}' already exists." });

            program.CreatedAt = DateTime.UtcNow;
            program.UpdatedAt = DateTime.UtcNow;
            program.IsActive = true;

            _context.Programs.Add(program);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = program.Id }, program);
        }

        // PUT: api/programs/5
        [HttpPut("{id}")]
        [RoleRequirementFilter("superadmin")]
        // 👇 Use DegreeProgram here
        public async Task<IActionResult> Update(long id, [FromBody] DegreeProgram updated)
        {
            var program = await _context.Programs.FindAsync(id);
            if (program == null) return NotFound();

            program.Name = updated.Name;
            program.DepartmentId = updated.DepartmentId;
            program.DegreeLevel = updated.DegreeLevel;
            program.DurationYears = updated.DurationYears;
            program.TotalCreditHours = updated.TotalCreditHours;
            program.Description = updated.Description;
            program.IsActive = updated.IsActive;
            program.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(program);
        }

        // DELETE: api/programs/5
        [HttpDelete("{id}")]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> Delete(long id)
        {
            var program = await _context.Programs.FindAsync(id);
            if (program == null) return NotFound();

            _context.Programs.Remove(program);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}