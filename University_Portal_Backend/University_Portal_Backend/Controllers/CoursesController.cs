using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniversityPortal.API.Data;
using UniversityPortal.API.Models;
using UniversityPortal.API.Authorization;

namespace UniversityPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CoursesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/courses
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Now .Include() will work perfectly
            var courses = await _context.Courses
                .Include(c => c.Prerequisite)
                .OrderBy(c => c.Code)
                .ToListAsync();

            return Ok(courses);
        }

        // POST: api/courses
        [HttpPost]
        [RoleRequirementFilter("superadmin,systemadmin")]
        public async Task<IActionResult> Create([FromBody] Course course)
        {
            course.CreatedAt = DateTime.UtcNow;
            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return Ok(course);
        }

        [HttpPut("{id}")]
        [RoleRequirementFilter("superadmin,systemadmin")]
        public async Task<IActionResult> Update(long id, [FromBody] Course updated)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound();

            course.Code = updated.Code;
            course.Name = updated.Name;
            course.CreditHours = updated.CreditHours;
            course.Type = updated.Type;
            course.PrerequisiteId = updated.PrerequisiteId;
            course.IsActive = updated.IsActive;

            await _context.SaveChangesAsync();
            return Ok(course);
        }

        // DELETE: api/courses/{id}
        [HttpDelete("{id}")]
        [RoleRequirementFilter("superadmin,systemadmin")]
        public async Task<IActionResult> Delete(long id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound();

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}