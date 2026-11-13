using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniversityPortal.API.Data;
using UniversityPortal.API.Models;
using UniversityPortal.API.Authorization;

namespace UniversityPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        // Roles that CANNOT be a department admin.
        // Everything else (teacher, hod, chairman, dean, department_admin, staff, ...) is eligible.
        private static readonly HashSet<string> ExcludedRoles = new(StringComparer.OrdinalIgnoreCase)
        {
            "student", "superadmin", "systemadmin"
        };

        private readonly ApplicationDbContext _context;

        public DepartmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================================
        // GET: api/departments?type=education|business
        // ==========================================================
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? type)
        {
            var query = _context.Departments.AsQueryable();
            if (!string.IsNullOrEmpty(type))
                query = query.Where(d => d.Type == type);

            var departments = await query.OrderBy(d => d.Name).ToListAsync();
            return Ok(departments);
        }

        // ==========================================================
        // GET: api/departments/{id}
        // ==========================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var dept = await _context.Departments
                .Include(d => d.Head)
                .Include(d => d.Admin)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (dept == null) return NotFound();
            return Ok(dept);
        }

        // ==========================================================
        // GET: api/departments/{id}/admin-candidates
        // Returns every non-student, non-super/system-admin active profile.
        // ==========================================================
        [HttpGet("{id}/admin-candidates")]
        public async Task<IActionResult> GetAdminCandidates(long id)
        {
            var dept = await _context.Departments.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id);
            if (dept == null) return NotFound();

            // Pull all eligible profiles, then filter on the C# side after ToString.
            // This avoids the Postgres enum-vs-string mismatch entirely.
            var allProfiles = await _context.Profiles
                .Where(p => p.IsActive)
                .OrderBy(p => p.FullName)
                .ToListAsync();

            var candidates = allProfiles
                .Where(p => !ExcludedRoles.Contains(p.Role.ToString()))
                .Select(p => new
                {
                    id = p.Id,
                    fullName = p.FullName,
                    email = p.Email,
                    role = p.Role.ToString(),
                    departmentId = p.DepartmentId
                })
                .ToList();

            return Ok(candidates);
        }

        // ==========================================================
        // POST: api/departments
        // ==========================================================
        [HttpPost]
        [RoleRequirementFilter("superadmin,systemadmin")]
        public async Task<IActionResult> Create([FromBody] Department dept)
        {
            if (string.IsNullOrWhiteSpace(dept.Name) || string.IsNullOrWhiteSpace(dept.Code))
                return BadRequest(new { message = "Name and Code are required." });

            var exists = await _context.Departments.AnyAsync(d => d.Code == dept.Code);
            if (exists)
                return Conflict(new { message = $"Department with code '{dept.Code}' already exists." });

            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;

            if (Guid.TryParse(userIdClaim, out Guid userId))
                dept.CreatedBy = userId;

            dept.CreatedAt = DateTime.UtcNow;
            dept.UpdatedAt = DateTime.UtcNow;
            dept.IsActive = true;

            // Validate admin if supplied at creation
            if (dept.AdminId.HasValue)
            {
                var admin = await _context.Profiles.FirstOrDefaultAsync(p => p.Id == dept.AdminId.Value);
                if (admin == null)
                    return BadRequest(new { message = "Selected admin does not exist." });

                if (ExcludedRoles.Contains(admin.Role.ToString()))
                    return BadRequest(new { message = $"Role '{admin.Role}' cannot be assigned as a department admin." });
            }

            _context.Departments.Add(dept);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = dept.Id }, dept);
        }

        [HttpPut("{id}")]
        [RoleRequirementFilter("superadmin,systemadmin")]
        public async Task<IActionResult> Update(long id, [FromBody] Department updated)
        {
            var dept = await _context.Departments.FindAsync(id);
            if (dept == null) return NotFound();

            if (string.IsNullOrWhiteSpace(updated.Name) || string.IsNullOrWhiteSpace(updated.Code))
                return BadRequest(new { message = "Name and Code are required." });

            // Prevent duplicate code collisions
            var codeTaken = await _context.Departments.AnyAsync(d => d.Id != id && d.Code == updated.Code);
            if (codeTaken)
                return Conflict(new { message = $"Another department already uses code '{updated.Code}'." });

            // Validate new admin candidate
            Guid? newAdminId = updated.AdminId;

            if (newAdminId.HasValue)
            {
                var admin = await _context.Profiles.FirstOrDefaultAsync(p => p.Id == newAdminId.Value);
                if (admin == null)
                    return BadRequest(new { message = "Selected admin does not exist." });

                // Check if the role is valid (using ToString() to handle the enum)
                var roleStr = admin.Role.ToString();
                if (roleStr == "student" || roleStr == "superadmin" || roleStr == "systemadmin")
                    return BadRequest(new { message = $"Role '{admin.Role}' cannot be assigned as a department admin." });

                // Clear the old admin's department link if it changed
                if (dept.AdminId.HasValue && dept.AdminId != newAdminId)
                {
                    var oldAdmin = await _context.Profiles.FindAsync(dept.AdminId.Value);
                    if (oldAdmin != null && oldAdmin.Role.ToString() == "department_admin")
                        oldAdmin.DepartmentId = null;
                }

                // Update new admin's department link (only if they are a department_admin)
                if (roleStr == "department_admin")
                    admin.DepartmentId = dept.Id;
            }

            // Apply changes
            dept.Name = updated.Name;
            dept.Code = updated.Code;
            dept.Description = updated.Description;
            dept.Location = updated.Location;
            dept.Building = updated.Building;
            dept.Email = updated.Email;
            dept.Phone = updated.Phone;
            dept.EstablishedYear = updated.EstablishedYear;
            dept.HeadId = updated.HeadId;
            dept.AdminId = newAdminId;
            dept.IsActive = updated.IsActive;
            dept.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(dept);
            }
            catch (Exception ex)
            {
                // Return the actual error to the frontend for debugging
                return StatusCode(500, new { message = "Database error", details = ex.InnerException?.Message ?? ex.Message });
            }
        }

        // ==========================================================
        // DELETE: api/departments/{id}
        // ==========================================================
        [HttpDelete("{id}")]
        [RoleRequirementFilter("superadmin,systemadmin")]
        public async Task<IActionResult> Delete(long id)
        {
            var dept = await _context.Departments.FindAsync(id);
            if (dept == null) return NotFound();

            // Unlink department_admin profile first so it doesn't point at a dead dept
            if (dept.AdminId.HasValue)
            {
                var admin = await _context.Profiles.FindAsync(dept.AdminId.Value);
                if (admin != null && admin.Role.ToString() == "department_admin")
                    admin.DepartmentId = null;
            }

            _context.Departments.Remove(dept);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}