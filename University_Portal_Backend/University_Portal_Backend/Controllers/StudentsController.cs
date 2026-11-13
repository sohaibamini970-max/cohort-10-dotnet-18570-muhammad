using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniversityPortal.API.Data;
using UniversityPortal.API.Models;
using UniversityPortal.API.Authorization;
using Supabase;
using Supabase.Gotrue;

namespace UniversityPortal.API.Controllers
{
    [ApiController]
    [Route("api/students")]
    public class StudentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public StudentsController(ApplicationDbContext context) { _context = context; }

        public class RegisterStudentRequest
        {
            public string SequenceNo { get; set; } = string.Empty;
            public string FullName { get; set; } = string.Empty;
            public string FatherName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public long DepartmentId { get; set; }
            public long ProgramId { get; set; }
            public long BatchId { get; set; }
            public string Section { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("register-admission")]
        [RoleRequirementFilter("department_admin,superadmin,systemadmin")]
        public async Task<IActionResult> RegisterStudent(
            [FromBody] RegisterStudentRequest request,
            [FromServices] Supabase.Client supabase,
            [FromServices] IConfiguration config)
        {
            try
            {
                // 👇 1. GENERATE ROLL NO 👇
                var program = await _context.Programs.FindAsync(request.ProgramId);
                var batch = await _context.Batches.FindAsync(request.BatchId);

                if (program == null || batch == null)
                    return BadRequest(new { message = "Invalid Program or Batch." });

                var paddedSeq = request.SequenceNo.PadLeft(3, '0');
                var generatedRollNo = $"{batch.StartYear}F-{program.Code}-{paddedSeq}";

                // 👇 2. CREATE AUTH USER IN SUPABASE 👇
                var serviceRoleKey = config["Supabase:ServiceRoleKey"];
                var supabaseUrl = config["Supabase:Url"];

                var adminClient = new Supabase.Gotrue.AdminClient(serviceRoleKey, new ClientOptions
                {
                    Url = $"{supabaseUrl}/auth/v1",
                    Headers = new Dictionary<string, string> { { "apikey", serviceRoleKey } }
                });

                var authUser = await adminClient.CreateUser(new Supabase.Gotrue.AdminUserAttributes
                {
                    Email = request.Email,
                    Password = request.Password,
                    EmailConfirm = true,
                    UserMetadata = new Dictionary<string, object>
                    {
                        { "full_name", request.FullName },
                        { "role", "student" }
                    }
                });

                if (authUser == null) return BadRequest(new { message = "Failed to create Auth user." });

                await Task.Delay(500); // Wait for DB trigger to create profile

                // 👇 3. CREATE PROFILE 👇
                var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Email == request.Email);
                if (profile == null)
                {
                    profile = new Profile
                    {
                        Id = Guid.Parse(authUser.Id),
                        Email = request.Email,
                        FullName = request.FullName,
                        Role = ProfileRole.student,
                        IsActive = false,
                        RollNo = generatedRollNo,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Profiles.Add(profile);
                }
                else
                {
                    profile.RollNo = generatedRollNo;
                    profile.IsActive = false;
                }

                // 👇 4. CREATE STUDENT 👇
                var student = new Student
                {
                    ProfileId = profile.Id,
                    DepartmentId = request.DepartmentId,
                    ProgramId = request.ProgramId,
                    BatchId = request.BatchId,
                    Section = request.Section,
                    FatherName = request.FatherName,
                    IsActive = false
                };
                _context.Students.Add(student);

                await _context.SaveChangesAsync();

                // 👇 5. AUTO-ASSIGN 1st SEMESTER COURSES 👇
                var firstSem = await _context.Semesters.FirstOrDefaultAsync(s => s.Name.Contains("1"));
                if (firstSem == null) return BadRequest(new { message = "1st Semester not found in system." });

                var sectionRecord = await _context.Sections
                    .FirstOrDefaultAsync(s => s.ProgramId == request.ProgramId &&
                                              s.BatchId == request.BatchId &&
                                              s.SemesterId == firstSem.Id &&
                                              s.Name == request.Section);

                if (sectionRecord == null)
                {
                    return BadRequest(new { message = $"Section '{request.Section}' is not configured for this Program and Batch. Please configure it in System Admin -> 1st Semester." });
                }

                var assignedCourses = await _context.ProgramCourses
                    .Where(pc => pc.ProgramId == request.ProgramId &&
                                 pc.BatchId == request.BatchId &&
                                 pc.SemesterId == firstSem.Id &&
                                 pc.Sections.Contains(request.Section))
                    .ToListAsync();

                if (assignedCourses.Count == 0)
                {
                    return BadRequest(new { message = $"No courses found for Section '{request.Section}'. Did you assign courses in Super Admin -> Assign Courses?" });
                }

                foreach (var course in assignedCourses)
                {
                    _context.StudentRegistrations.Add(new StudentRegistration
                    {
                        StudentProfileId = profile.Id,
                        ProgramCourseId = course.Id,
                        SectionId = sectionRecord.Id,
                        Status = "Enrolled",
                        RegisteredAt = DateTime.UtcNow
                    });
                }
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Student registered successfully. Roll No: {generatedRollNo}" });
            }
            catch (Exception ex)
            {
                var innerEx = ex.InnerException;
                while (innerEx != null)
                {
                    Console.WriteLine("========================================");
                    Console.WriteLine($"DATABASE ERROR: {innerEx.Message}");
                    Console.WriteLine("========================================");
                    innerEx = innerEx.InnerException;
                }

                return StatusCode(500, new { message = "Database error", details = ex.InnerException?.Message ?? ex.Message });
            }
        }

        // GET: api/students/registrations
        [HttpGet("registrations")]
        [RoleRequirementFilter("superadmin,systemadmin")]
        public async Task<IActionResult> GetStudentRegistrations()
        {
            var registrations = await _context.StudentRegistrations
                .Include(r => r.StudentProfile)
                .Include(r => r.ProgramCourse).ThenInclude(pc => pc.Course)
                .Include(r => r.Section)
                .GroupBy(r => r.StudentProfileId)
                .Select(g => new
                {
                    id = g.Key,
                    name = g.First().StudentProfile.FullName,
                    rollNo = g.First().StudentProfile.RollNo,
                    registeredCourses = g.Select(r => new
                    {
                        code = r.ProgramCourse.Course.Code,
                        name = r.ProgramCourse.Course.Name,
                        credits = r.ProgramCourse.Course.CreditHours,
                        section = r.Section.Name
                    }).ToList()
                })
                .ToListAsync();

            return Ok(registrations);
        }

        // GET: api/students/all
        [HttpGet("all")]
        [RoleRequirementFilter("superadmin,systemadmin,department_admin")]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _context.Students
                .Include(s => s.Profile)
                .Include(s => s.Program)
                .Include(s => s.Batch)
                .Select(s => new
                {
                    id = s.Id,
                    profileId = s.ProfileId,
                    section = s.Section,
                    isActive = s.IsActive,
                    profile = new
                    {
                        fullName = s.Profile.FullName,
                        rollNo = s.Profile.RollNo,
                        email = s.Profile.Email
                    },
                    program = new { code = s.Program.Code },
                    batch = new { name = s.Batch.Name }
                })
                .ToListAsync();

            return Ok(students);
        }

        public class ToggleStatusRequest { public bool IsActive { get; set; } }

        // PUT: api/students/{id}/toggle-status
        [HttpPut("{id}/toggle-status")]
        [RoleRequirementFilter("superadmin,systemadmin")]
        public async Task<IActionResult> ToggleStatus(Guid id, [FromBody] ToggleStatusRequest request)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null) return NotFound(new { message = "Student not found." });

            student.IsActive = request.IsActive;
            var profile = await _context.Profiles.FindAsync(student.ProfileId);
            if (profile != null) profile.IsActive = request.IsActive;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Status updated successfully." });
        }

        // PUT: api/students/{profileId}/reset-password
        [HttpPut("{profileId}/reset-password")]
        [RoleRequirementFilter("superadmin,systemadmin")]
        public async Task<IActionResult> ResetPassword(Guid profileId, [FromBody] ResetPasswordRequest request, [FromServices] IConfiguration config)
        {
            var profile = await _context.Profiles.FindAsync(profileId);
            if (profile == null) return NotFound(new { message = "Profile not found." });

            try
            {
                var serviceRoleKey = config["Supabase:ServiceRoleKey"];
                var supabaseUrl = config["Supabase:Url"];

                var adminClient = new Supabase.Gotrue.AdminClient(serviceRoleKey, new ClientOptions
                {
                    Url = $"{supabaseUrl}/auth/v1",
                    Headers = new Dictionary<string, string> { { "apikey", serviceRoleKey } }
                });

                var attributes = new Supabase.Gotrue.AdminUserAttributes { Password = request.Password };
                await adminClient.UpdateUserById(profileId.ToString(), attributes);

                return Ok(new { message = "Password updated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to update password.", details = ex.Message });
            }
        }

        public class ResetPasswordRequest { public string Password { get; set; } = string.Empty; }
    }
}