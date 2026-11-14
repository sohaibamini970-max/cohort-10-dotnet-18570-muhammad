using Microsoft.EntityFrameworkCore;
using Task_Management_Tool_Backend.Models;

namespace Task_Management_Tool_Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Only the Users table for now
        public DbSet<User> Users { get; set; }
    }
}