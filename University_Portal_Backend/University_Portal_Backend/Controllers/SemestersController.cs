using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniversityPortal.API.Data;
using UniversityPortal.API.Models;
using UniversityPortal.API.Authorization;

namespace UniversityPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SemestersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SemestersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var semesters = await _context.Semesters.OrderBy(s => s.Id).ToListAsync();
            return Ok(semesters);
        }

        [HttpPost]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> Create([FromBody] Semester semester)
        {
            var exists = await _context.Semesters.AnyAsync(s => s.Name == semester.Name);
            if (exists) return Conflict(new { message = "Semester already exists." });

            semester.CreatedAt = DateTime.UtcNow;
            _context.Semesters.Add(semester);
            await _context.SaveChangesAsync();
            return Ok(semester);
        }

        [HttpPut("{id}")]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> Update(long id, [FromBody] Semester updated)
        {
            var semester = await _context.Semesters.FindAsync(id);
            if (semester == null) return NotFound();

            semester.Name = updated.Name;
            semester.IsActive = updated.IsActive;

            await _context.SaveChangesAsync();
            return Ok(semester);
        }

        [HttpDelete("{id}")]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> Delete(long id)
        {
            var semester = await _context.Semesters.FindAsync(id);
            if (semester == null) return NotFound();

            var isUsed = await _context.ProgramCourses.AnyAsync(pc => pc.SemesterId == id);
            if (isUsed) return BadRequest(new { message = "Cannot delete. Semester is assigned to courses." });

            _context.Semesters.Remove(semester);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}