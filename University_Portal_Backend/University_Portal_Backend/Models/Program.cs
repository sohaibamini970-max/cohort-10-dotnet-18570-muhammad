using Microsoft.EntityFrameworkCore;
using UniversityPortal.API.Data;
using UniversityPortal.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text.Json;

AppContext.SetSwitch("System.Net.Dns.EnableIPv4", true);
var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// EF Core → Supabase Postgres
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions =>
        {
            // Retry up to 5 times if there's a transient network failure
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorCodesToAdd: null);

            // Increase the timeout to 60 seconds (Supabase pooler can be slow to wake up)
            npgsqlOptions.CommandTimeout(60);

            npgsqlOptions.MapEnum<ProfileRole>("user_role");
        }
    ));

// Supabase Client (Auth only)
var supabaseUrl = builder.Configuration["Supabase:Url"]!;
var supabaseKey = builder.Configuration["Supabase:Key"]!;

var supabaseOptions = new Supabase.SupabaseOptions
{
    AutoRefreshToken = true,
    AutoConnectRealtime = false
};
var supabaseClient = new Supabase.Client(supabaseUrl, supabaseKey, supabaseOptions);
await supabaseClient.InitializeAsync();
builder.Services.AddSingleton(supabaseClient);

// JWT Auth
var jwtKey = builder.Configuration["Jwt:Key"];
var keyBytes = System.Text.Encoding.ASCII.GetBytes(jwtKey!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // 1. Standard Supabase Configuration
        options.Authority = $"{supabaseUrl}/auth/v1";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            RoleClaimType = ClaimTypes.Role,

            // 👈 Important: Add your custom key so custom tokens don't fail signature check
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
                if (string.IsNullOrEmpty(token)) return Task.CompletedTask;

                var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                try
                {
                    var jwtToken = tokenHandler.ReadJwtToken(token);

                    // If it's our custom Department Admin token (HS256)
                    if (jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                    {
                        var validationParameters = new TokenValidationParameters
                        {
                            ValidateIssuerSigningKey = true,
                            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
                            ValidateIssuer = false,
                            ValidateAudience = false,
                            ValidateLifetime = true
                        };

                        var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                        context.Principal = principal;
                        context.Success();
                    }
                    // If it's a Supabase token (RS256), the default middleware handles it using the Authority
                }
                catch (Exception)
                {
                    context.Fail("Invalid Token");
                }

                return Task.CompletedTask;
            },

            OnTokenValidated = context =>
            {
                var claimsIdentity = context.Principal?.Identity as ClaimsIdentity;
                if (claimsIdentity != null)
                {
                    // 1. If it's our custom Department Admin token, it's already good.
                    var existingRole = claimsIdentity.FindFirst(ClaimTypes.Role)?.Value;
                    if (existingRole == "department_admin") return Task.CompletedTask;

                    // 2. Supabase puts custom data inside "user_metadata" as a JSON string
                    var userMetadataClaim = claimsIdentity.FindFirst("user_metadata")?.Value;

                    if (!string.IsNullOrEmpty(userMetadataClaim))
                    {
                        try
                        {
                            using var doc = JsonDocument.Parse(userMetadataClaim);
                            if (doc.RootElement.TryGetProperty("role", out var roleElement))
                            {
                                var actualRole = roleElement.GetString();
                                if (!string.IsNullOrEmpty(actualRole))
                                {
                                    // Remove default "authenticated" role
                                    var defaultRoleClaim = claimsIdentity.FindFirst(ClaimTypes.Role);
                                    if (defaultRoleClaim != null && defaultRoleClaim.Value == "authenticated")
                                    {
                                        claimsIdentity.RemoveClaim(defaultRoleClaim);
                                    }

                                    // Add the real role (superadmin, teacher, etc.)
                                    claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, actualRole));
                                }
                            }
                        }
                        catch (JsonException ex)
                        {
                            Console.WriteLine($"Error parsing user_metadata: {ex.Message}");
                        }
                    }
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// CORS for React
builder.Services.AddCors(o => o.AddPolicy("AllowReact", p =>
    p.WithOrigins("http://localhost:5173")
     .AllowAnyHeader()
     .AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();