using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityPortal.API.Models
{
    [Table("courses")]
    public class Course
    {
        [Key][Column("id")] public long Id { get; set; }
        [Column("code")] public string Code { get; set; } = string.Empty;
        [Column("name")] public string Name { get; set; } = string.Empty;
        [Column("credit_hours")] public int CreditHours { get; set; }
        [Column("type")] public string Type { get; set; } = "Core";

        // 👇 Self-referencing prerequisite 👇
        [Column("prerequisite_id")] public long? PrerequisiteId { get; set; }

        [Column("is_active")] public bool IsActive { get; set; } = true;
        [Column("created_at")] public DateTime CreatedAt { get; set; }

        [ForeignKey("PrerequisiteId")] public Course? Prerequisite { get; set; }
    }
}