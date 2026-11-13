using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityPortal.API.Models
{
    [Table("semesters")]
    public class Semester
    {
        [Key][Column("id")] public long Id { get; set; }
        [Column("name")] public string Name { get; set; } = string.Empty;
        [Column("is_active")] public bool IsActive { get; set; } = true;
        [Column("created_at")] public DateTime CreatedAt { get; set; }
    }
}