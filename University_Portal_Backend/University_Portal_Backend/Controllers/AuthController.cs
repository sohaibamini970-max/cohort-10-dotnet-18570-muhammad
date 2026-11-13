using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Supabase;
using Supabase.Gotrue;
using Supabase.Gotrue.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UniversityPortal.API.Authorization;
using UniversityPortal.API.Data;
using UniversityPortal.API.Models;

namespace UniversityPortal.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly Supabase.Client _supabase;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;

        private string GenerateJwtToken(Profile profile, long departmentId)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]); // 👈 Fixed to _configuration

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
            new Claim(ClaimTypes.NameIdentifier, profile.Id.ToString()),
            new Claim(ClaimTypes.Role, "department_admin"),
            new Claim("departmentId", departmentId.ToString())
        }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public AuthController(Supabase.Client supabase, ApplicationDbContext context, ILogger<AuthController> logger, IConfiguration configuration)
        {
            _supabase = supabase;
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class TeacherLoginRequest
        {
            public string EmployeeId { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("teacher-login")]
        public async Task<IActionResult> TeacherLogin([FromBody] TeacherLoginRequest request)
        {
            try
            {
                // 1. Find the teacher by Employee ID
                var teacher = await _context.Teachers
                    .Include(t => t.Profile)
                    .FirstOrDefaultAsync(t => t.EmployeeId.ToLower() == request.EmployeeId.ToLower());

                if (teacher == null || teacher.Profile == null)
                    return Unauthorized(new { message = "Invalid Employee ID." });

                // 2. Authenticate using their actual email and the provided password
                var session = await _supabase.Auth.SignIn(teacher.Profile.Email, request.Password);

                if (session?.User == null)
                    return Unauthorized(new { message = "Invalid password." });

                // 3. Return the standard Supabase token and user data
                return Ok(new
                {
                    token = session.AccessToken,
                    refreshToken = session.RefreshToken,
                    user = new
                    {
                        id = teacher.Profile.Id,
                        email = teacher.Profile.Email,
                        fullName = teacher.Profile.FullName,
                        role = "teacher", // Force role to teacher
                        department = teacher.DepartmentId // Optional
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Teacher login failed for {EmployeeId}", request.EmployeeId);
                return BadRequest(new { message = "Invalid credentials." });
            }
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // 1. Check if the email entered belongs to a Department
                var dept = await _context.Departments
                    .Include(d => d.Admin)
                    .FirstOrDefaultAsync(d => d.Email.ToLower() == request.Email.ToLower());

                string loginEmail = request.Email;
                Profile profile = null;

                if (dept != null)
                {
                    // 👇 IT IS A DEPARTMENT LOGIN 👇
                    if (dept.AdminId == null || dept.Admin == null)
                        return Unauthorized(new { message = "No admin assigned to this department." });

                    // Switch the login email to the assigned admin's actual email
                    loginEmail = dept.Admin.Email;
                }

                // 2. Authenticate with Supabase (using either the real email or the department admin's email)
                var session = await _supabase.Auth.SignIn(loginEmail, request.Password);

                if (session?.User == null)
                    return Unauthorized(new { message = "Invalid email or password." });

                // 3. Fetch the user's profile
                if (!Guid.TryParse(session.User.Id, out Guid userId))
                    return BadRequest(new { message = "Invalid user ID format." });

                profile = await _context.Profiles
                    .Include(p => p.Department)
                    .FirstOrDefaultAsync(p => p.Id == userId);

                if (profile == null)
                    return Unauthorized(new { message = "User profile not found." });

                // 4. Return the correct data
                if (dept != null)
                {
                    // 👇 RETURN CUSTOM TOKEN FOR DEPARTMENT ADMIN 👇
                    // (Using the GenerateJwtToken method you already have)
                    var token = GenerateJwtToken(profile, dept.Id);

                    return Ok(new
                    {
                        token = token,
                        user = new
                        {
                            id = profile.Id,
                            email = profile.Email,
                            fullName = profile.FullName,
                            role = "department_admin", // Force role
                            departmentId = dept.Id,
                            departmentName = dept.Name,
                            departmentCode = dept.Code // So React can route to ADM, FIN, etc.
                        }
                    });
                }
                else
                {
                    // 👇 RETURN NORMAL TOKEN FOR EVERYONE ELSE 👇
                    return Ok(new
                    {
                        token = session.AccessToken,
                        refreshToken = session.RefreshToken,
                        user = new
                        {
                            id = profile.Id,
                            email = profile.Email,
                            fullName = profile.FullName,
                            role = profile.Role.ToString(),
                            department = profile.Department != null ? new
                            {
                                id = profile.Department.Id,
                                name = profile.Department.Name,
                                code = profile.Department.Code,
                                type = profile.Department.Type
                            } : null
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login failed for {Email}", request.Email);
                return BadRequest(new { message = "Invalid login credentials." });
            }
        }

        // POST: api/auth/register-user
        [HttpPost("register-user")]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> RegisterUser([FromBody] RegisterUserRequest request)
        {
            try
            {
                var serviceRoleKey = _configuration["Supabase:ServiceRoleKey"];
                var supabaseUrl = _configuration["Supabase:Url"];

                if (string.IsNullOrEmpty(serviceRoleKey) || string.IsNullOrEmpty(supabaseUrl))
                    return BadRequest(new { message = "Supabase Service Role Key is missing in appsettings.json" });

                // Create the Admin Client with the APIKEY header
                var adminClient = new Supabase.Gotrue.AdminClient(serviceRoleKey, new ClientOptions
                {
                    Url = $"{supabaseUrl}/auth/v1",
                    Headers = new Dictionary<string, string>
                    {
                        { "apikey", serviceRoleKey }
                    }
                });

                var user = await adminClient.CreateUser(new AdminUserAttributes
                {
                    Email = request.Email,
                    Password = request.Password,
                    EmailConfirm = true,
                    UserMetadata = new Dictionary<string, object>
                    {
                        { "full_name", request.FullName },
                        { "role", request.Role }
                    }
                });

                if (user == null)
                    return BadRequest(new { message = "Failed to create user in Supabase Auth." });

                await Task.Delay(500);

                var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Email == request.Email);
                if (profile != null)
                {
                    profile.FullName = request.FullName;
                    profile.Role = (ProfileRole)Enum.Parse(typeof(ProfileRole), request.Role); // ✅ Cast to enum

                    if (request.DepartmentId.HasValue)
                        profile.DepartmentId = request.DepartmentId.Value;

                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "User created successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        public class RegisterUserRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string FullName { get; set; } = string.Empty;
            public string Role { get; set; } = string.Empty;
            public long? DepartmentId { get; set; }
        }

        // GET: api/auth/users
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Profiles
                .Include(p => p.Department) // 👈 Also added Include here so the Super Admin table can show departments
                .ToListAsync();
            return Ok(users);
        }

        [HttpPost("department-login")]
        public async Task<IActionResult> DepartmentLogin([FromBody] LoginRequest request)
        {
            try
            {
                // 1. Find the department by the email they typed
                var dept = await _context.Departments
                    .Include(d => d.Admin) // Bring in the assigned admin's profile
                    .FirstOrDefaultAsync(d => d.Email.ToLower() == request.Email.ToLower());

                if (dept == null)
                    return Unauthorized(new { message = "Invalid department email." });

                // 2. Check if an admin is actually assigned
                if (dept.AdminId == null || dept.Admin == null)
                    return Unauthorized(new { message = "No admin has been assigned to this department yet." });

                var assignedAdmin = dept.Admin;

                // 👇 ADD THESE LOGS 👇
                Console.WriteLine("========== DEPARTMENT LOGIN ATTEMPT ==========");
                Console.WriteLine($"Entered Dept Email: {request.Email}");
                Console.WriteLine($"Entered Password: {request.Password}");
                Console.WriteLine($"Resolved Admin Email: '{assignedAdmin.Email}'");
                Console.WriteLine($"Resolved Admin ID: {assignedAdmin.Id}");
                Console.WriteLine("==============================================");

                var session = await _supabase.Auth.SignIn(assignedAdmin.Email, request.Password);

                // 3. 👇 FIX: Verify the password using Supabase Auth 👇
                // We use the Admin's actual email to log them in via Supabasw

                if (session?.User == null)
                    return Unauthorized(new { message = "Invalid password." });

                // 4. Generate our custom JWT Token
                // We use the Admin's ID, but force the role and department context
                var token = GenerateJwtToken(assignedAdmin, dept.Id);

                return Ok(new
                {
                    token = token,
                    user = new
                    {
                        id = assignedAdmin.Id,
                        fullName = assignedAdmin.FullName,
                        email = assignedAdmin.Email,
                        role = "department_admin", // Force role to department_admin for this session
                        departmentId = dept.Id,
                        departmentName = dept.Name
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Department login failed for {Email}", request.Email);
                return Unauthorized(new { message = "Invalid credentials." });
            }
        }

        [HttpPost("student-login")]
        public async Task<IActionResult> StudentLogin([FromBody] StudentLoginRequest request)
        {
            try
            {
                // 1. Find the student by Roll Number
                var profile = await _context.Profiles
                    .Include(p => p.StudentRecord) // Make sure to include the Student record
                    .FirstOrDefaultAsync(p => p.RollNo == request.RollNo);

                if (profile == null || profile.Role != ProfileRole.student)
                    return Unauthorized(new { message = "Invalid Roll Number." });

                // 2. Check if the portal is activated by the System Admin
                if (profile.StudentRecord == null || !profile.StudentRecord.IsActive)
                    return Unauthorized(new { message = "Your portal is inactive. Please contact the administration." });

                // 3. Authenticate with Supabase using the student's actual email
                var session = await _supabase.Auth.SignIn(profile.Email, request.Password);

                if (session?.User == null)
                    return Unauthorized(new { message = "Invalid password." });

                // 4. Return the token and user data
                return Ok(new
                {
                    token = session.AccessToken,
                    refreshToken = session.RefreshToken,
                    user = new
                    {
                        id = profile.Id,
                        email = profile.Email,
                        fullName = profile.FullName,
                        rollNo = profile.RollNo,
                        role = "student"
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Student login failed for {RollNo}", request.RollNo);
                return BadRequest(new { message = "Invalid login credentials." });
            }
        }

        [HttpGet("dashboard-stats")]
        [RoleRequirementFilter("superadmin")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalDepartments = await _context.Departments.CountAsync();
            var totalUsers = await _context.Profiles.CountAsync();
            var totalStudents = await _context.Students.CountAsync();
            var totalTeachers = await _context.Teachers.CountAsync();

            // Fetch Departments with their Admin names and counts
            var departments = await _context.Departments
                .Include(d => d.Admin)
                .Select(d => new
                {
                    name = d.Name,
                    adminName = d.Admin != null ? d.Admin.FullName : "Not Assigned",
                    studentCount = _context.Students.Count(s => s.DepartmentId == d.Id),
                    teacherCount = _context.Teachers.Count(t => t.DepartmentId == d.Id),
                    status = d.IsActive ? "Active" : "Inactive"
                })
                .ToListAsync();

            return Ok(new
            {
                stats = new
                {
                    departments = totalDepartments,
                    users = totalUsers,
                    students = totalStudents,
                    teachers = totalTeachers
                },
                departmentsList = departments
            });
        }

        public class StudentLoginRequest
        {
            public string RollNo { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
    }
}