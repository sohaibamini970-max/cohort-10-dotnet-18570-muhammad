using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniversityPortal.API.Data;
using UniversityPortal.API.Models;
using UniversityPortal.API.Authorization;

namespace UniversityPortal.API.Controllers
{
    [ApiController]
    [Route("api/first-semester")]
    public class FirstSemesterController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public FirstSemesterController(ApplicationDbContext context) { _context = context; }

        public class AssignSectionDto
        {
            public string Name { get; set; } = string.Empty;
            public int MaxSeats { get; set; } = 50;
            public bool IsActive { get; set; } = true;
        }

        public class AssignRequest
        {
            public long ProgramId { get; set; }
            public long BatchId { get; set; }
            public long SemesterId { get; set; }
            public long SessionId { get; set; }
            public List<AssignSectionDto> Sections { get; set; } = new();
        }

        // GET: api/first-semester/config?programId=1&batchId=1&semesterId=1
        [HttpGet("config")]
        public async Task<IActionResult> GetConfiguration([FromQuery] long programId, [FromQuery] long batchId, [FromQuery] long semesterId)
        {
            var sections = await _context.Sections
                .Where(s => s.ProgramId == programId && s.BatchId == batchId && s.SemesterId == semesterId)
                .Select(s => new { name = s.Name, maxSeats = s.MaxSeats, isActive = s.IsActive })
                .ToListAsync();

            return Ok(sections);
        }

        // POST: api/first-semester/assign
        [HttpPost("assign")]
        [RoleRequirementFilter("superadmin,systemadmin")]
        public async Task<IActionResult> AssignSections([FromBody] AssignRequest request)
        {
            // 1. Verify Super Admin has assigned courses for this batch
            var assignedCourses = await _context.ProgramCourses
                .Where(pc => pc.ProgramId == request.ProgramId &&
                             pc.BatchId == request.BatchId &&
                             pc.SemesterId == request.SemesterId)
                .ToListAsync();

            if (assignedCourses.Count == 0)
                return BadRequest(new { message = "No courses assigned by Super Admin for this selection." });

            // 2. Fetch existing sections to update or delete
            var existingSections = await _context.Sections
                .Where(s => s.ProgramId == request.ProgramId &&
                            s.BatchId == request.BatchId &&
                            s.SemesterId == request.SemesterId)
                .ToListAsync();

            // 3. Remove sections that were unchecked by the admin
            var incomingSectionNames = request.Sections.Select(s => s.Name).ToList();
            var sectionsToRemove = existingSections.Where(s => !incomingSectionNames.Contains(s.Name)).ToList();
            _context.Sections.RemoveRange(sectionsToRemove);

            // 4. Add or Update incoming sections
            foreach (var secDto in request.Sections)
            {
                var existing = existingSections.FirstOrDefault(s => s.Name == secDto.Name);
                if (existing != null)
                {
                    // Update
                    existing.MaxSeats = secDto.MaxSeats;
                    existing.IsActive = secDto.IsActive;
                }
                else
                {
                    // Create new
                    _context.Sections.Add(new Section
                    {
                        ProgramId = request.ProgramId,
                        BatchId = request.BatchId,
                        SemesterId = request.SemesterId,
                        Name = secDto.Name,
                        MaxSeats = secDto.MaxSeats,
                        IsActive = secDto.IsActive,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            // 5. Update the courses to reflect the active sections
            var activeSectionNames = request.Sections.Where(s => s.IsActive).Select(s => s.Name).ToArray();
            foreach (var course in assignedCourses)
            {
                course.Sections = activeSectionNames;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Sections updated successfully." });
        }
    }
}