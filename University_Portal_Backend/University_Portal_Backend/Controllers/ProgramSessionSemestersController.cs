using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniversityPortal.API.Data;
using UniversityPortal.API.Models;
using UniversityPortal.API.Authorization;

namespace UniversityPortal.API.Controllers
{
    [ApiController]
    [Route("api/program-session-semesters")]
    public class ProgramSessionSemestersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProgramSessionSemestersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/program-session-semesters?programId=1&batchId=2&sessionId=3
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] long? programId,
            [FromQuery] long? batchId,
            [FromQuery] long? sessionId)
        {
            var query = _context.ProgramSessionSemesters
                .Include(x => x.Program)
                .Include(x => x.Batch)
                .Include(x => x.Session)
                .Include(x => x.Semester)
                .AsQueryable();

            if (programId.HasValue) query = query.Where(x => x.ProgramId == programId.Value);
            if (batchId.HasValue) query = query.Where(x => x.BatchId == batchId.Value);
            if (sessionId.HasValue) query = query.Where(x => x.SessionId == sessionId.Value);

            var list = await query.OrderBy(x => x.SemesterId).ToListAsync();
            return Ok(list);
        }

        // POST: api/program-session-semesters
        [HttpPost]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> Create([FromBody] ProgramSessionSemester pss)
        {
            // Validate referenced entities exist
            var programOk = await _context.Programs.AnyAsync(p => p.Id == pss.ProgramId);
            var batchOk = await _context.Batches.AnyAsync(b => b.Id == pss.BatchId);
            var sessionOk = await _context.Sessions.AnyAsync(s => s.Id == pss.SessionId);
            var semesterOk = await _context.Semesters.AnyAsync(s => s.Id == pss.SemesterId);

            if (!programOk || !batchOk || !sessionOk || !semesterOk)
                return BadRequest(new { message = "Invalid program/batch/session/semester reference." });

            var exists = await _context.ProgramSessionSemesters.AnyAsync(x =>
                x.ProgramId == pss.ProgramId &&
                x.BatchId == pss.BatchId &&
                x.SessionId == pss.SessionId &&
                x.SemesterId == pss.SemesterId);

            if (exists) return Conflict(new { message = "This semester is already configured for this batch/session." });

            // If marked active, deactivate others in the same program+batch+session
            if (pss.IsActive)
            {
                var others = await _context.ProgramSessionSemesters
                    .Where(x => x.ProgramId == pss.ProgramId &&
                                x.BatchId == pss.BatchId &&
                                x.SessionId == pss.SessionId &&
                                x.IsActive)
                    .ToListAsync();
                others.ForEach(x => x.IsActive = false);
            }

            pss.CreatedAt = DateTime.UtcNow;
            _context.ProgramSessionSemesters.Add(pss);
            await _context.SaveChangesAsync();
            return Ok(pss);
        }

        // PUT: api/program-session-semesters/{id}/activate
        [HttpPut("{id}/activate")]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> Activate(long id)
        {
            var pss = await _context.ProgramSessionSemesters.FindAsync(id);
            if (pss == null) return NotFound();

            // Deactivate all other semesters for same program+batch+session
            var others = await _context.ProgramSessionSemesters
                .Where(x => x.Id != id &&
                            x.ProgramId == pss.ProgramId &&
                            x.BatchId == pss.BatchId &&
                            x.SessionId == pss.SessionId &&
                            x.IsActive)
                .ToListAsync();
            others.ForEach(x => x.IsActive = false);

            pss.IsActive = true;
            await _context.SaveChangesAsync();
            return Ok(pss);
        }

        // PUT: api/program-session-semesters/{id}/deactivate
        [HttpPut("{id}/deactivate")]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> Deactivate(long id)
        {
            var pss = await _context.ProgramSessionSemesters.FindAsync(id);
            if (pss == null) return NotFound();

            pss.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(pss);
        }

        // DELETE: api/program-session-semesters/{id}
        [HttpDelete("{id}")]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> Delete(long id)
        {
            var pss = await _context.ProgramSessionSemesters.FindAsync(id);
            if (pss == null) return NotFound();

            if (pss.IsActive)
                return BadRequest(new { message = "Cannot delete an active semester. Deactivate it first." });

            _context.ProgramSessionSemesters.Remove(pss);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}