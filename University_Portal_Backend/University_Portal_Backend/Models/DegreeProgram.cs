using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityPortal.API.Models
{
    [Table("programs")] // 👈 This tells EF Core to save it to the 'programs' table
    public class DegreeProgram
    {
        [Key][Column("id")] public long Id { get; set; }

        [Column("department_id")]
        public long DepartmentId { get; set; }

        [Column("name")] public string Name { get; set; } = string.Empty;
        [Column("code")] public string Code { get; set; } = string.Empty;
        [Column("degree_level")] public string DegreeLevel { get; set; } = string.Empty;
        [Column("duration_years")] public int DurationYears { get; set; }
        [Column("total_credit_hours")] public int TotalCreditHours { get; set; }
        [Column("description")] public string? Description { get; set; }
        [Column("is_active")] public bool IsActive { get; set; } = true;
        [Column("created_at")] public DateTime CreatedAt { get; set; }
        [Column("updated_at")] public DateTime UpdatedAt { get; set; }

        // 👇 Now C# knows this is the Department model
        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }
    }
}