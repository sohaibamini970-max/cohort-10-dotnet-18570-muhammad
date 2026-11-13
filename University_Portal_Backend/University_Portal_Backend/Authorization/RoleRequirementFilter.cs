using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UniversityPortal.API.Data;

namespace UniversityPortal.API.Authorization
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class RoleRequirementFilter : AuthorizeAttribute, IAsyncAuthorizationFilter
    {
        private readonly string[] _allowedRoles;

        public RoleRequirementFilter(string allowedRoles)
        {
            _allowedRoles = allowedRoles.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                       .Select(r => r.Trim().ToLower())
                                       .ToArray();
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            if (user.Identity == null || !user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Check Token Roles (Department Admin custom token)
            var tokenRoles = user.FindAll(ClaimTypes.Role).Select(c => c.Value.ToLower()).ToList();
            if (tokenRoles.Contains("department_admin"))
            {
                return; // Valid custom token
            }

            // Check DB Roles (Supabase token)
            var userIdString = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? user.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var dbContext = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
            var profile = await dbContext.Profiles.AsNoTracking().FirstOrDefaultAsync(p => p.Id == userId);

            if (profile == null)
            {
                context.Result = new ForbidResult();
                return;
            }

            var dbRole = profile.Role.ToString().ToLower();
            if (!_allowedRoles.Contains(dbRole))
            {
                context.Result = new ForbidResult();
                return;
            }
        }
    }
}