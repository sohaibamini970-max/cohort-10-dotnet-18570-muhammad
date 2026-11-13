using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniversityPortal.API.Data;
using UniversityPortal.API.Models;
using UniversityPortal.API.Authorization;

namespace UniversityPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SessionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sessions = await _context.Sessions
                .OrderByDescending(s => s.StartDate)
                .ToListAsync();
            return Ok(sessions);
        }

        [HttpPost]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> Create([FromBody] Session session)
        {
            if (string.IsNullOrWhiteSpace(session.Name))
                return BadRequest(new { message = "Session name is required." });

            if (session.EndDate <= session.StartDate)
                return BadRequest(new { message = "End date must be after start date." });

            var exists = await _context.Sessions.AnyAsync(s => s.Name == session.Name);
            if (exists) return Conflict(new { message = "Session already exists." });

            session.CreatedAt = DateTime.UtcNow;
            _context.Sessions.Add(session);
            await _context.SaveChangesAsync();
            return Ok(session);
        }

        [HttpPut("{id}")]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> Update(long id, [FromBody] Session updated)
        {
            var session = await _context.Sessions.FindAsync(id);
            if (session == null) return NotFound();

            if (string.IsNullOrWhiteSpace(updated.Name))
                return BadRequest(new { message = "Session name is required." });

            if (updated.EndDate <= updated.StartDate)
                return BadRequest(new { message = "End date must be after start date." });

            session.Name = updated.Name;
            session.StartDate = updated.StartDate;
            session.EndDate = updated.EndDate;
            session.IsActive = updated.IsActive;

            await _context.SaveChangesAsync();
            return Ok(session);
        }

        [HttpDelete("{id}")]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> Delete(long id)
        {
            var session = await _context.Sessions.FindAsync(id);
            if (session == null) return NotFound();

            var isUsedInCourses = await _context.ProgramCourses.AnyAsync(pc => pc.SessionId == id);
            if (isUsedInCourses)
                return BadRequest(new { message = "Cannot delete. Session is assigned to courses." });

            var isUsedInPSS = await _context.ProgramSessionSemesters.AnyAsync(x => x.SessionId == id);
            if (isUsedInPSS)
                return BadRequest(new { message = "Cannot delete. Session is configured for a program/batch." });

            _context.Sessions.Remove(session);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}