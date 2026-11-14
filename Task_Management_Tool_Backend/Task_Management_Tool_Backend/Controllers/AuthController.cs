using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Task_Management_Tool_Backend.Data;
using Task_Management_Tool_Backend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Serilog; // 👈 Added Serilog

namespace Task_Management_Tool_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public class LoginDto
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok("AuthController is alive!");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            // 👇 Log the attempt
            Log.Information("Login attempt for email: {Email}", model.Email);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);

            if (user == null || user.PasswordHash != model.Password)
            {
                // 👇 Log the failure
                Log.Warning("Failed login attempt for email: {Email}", model.Email);
                return Unauthorized(new { message = "Invalid credentials" });
            }

            // 👇 Log the success
            Log.Information("User {Email} logged in successfully as {Role}", user.Email, user.Role);

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                user = new
                {
                    email = user.Email,
                    name = user.Name,
                    role = user.Role.ToLower()
                }
            });
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}