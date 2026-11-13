using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityPortal.API.Models
{
    [Table("profiles")]
    public class Profile
    {
        [Key][Column("id")] public Guid Id { get; set; }
        [Column("email")] public string Email { get; set; } = string.Empty;
        [Column("full_name")] public string FullName { get; set; } = string.Empty;

        [Column("role")] 
        public ProfileRole Role { get; set; } = ProfileRole.student;
        [Column("phone")] public string? Phone { get; set; }
        [Column("avatar_url")] public string? AvatarUrl { get; set; }
        [Column("is_active")] public bool IsActive { get; set; } = true;
        [Column("created_at")] public DateTime CreatedAt { get; set; }
        [Column("updated_at")] public DateTime UpdatedAt { get; set; }

        // 👇 Add these two lines 👇
        [Column("department_id")]
        public long? DepartmentId { get; set; }

        // Inside Profile.cs
        [Column("roll_no")]
        public string? RollNo { get; set; }

        // Navigation property
        public Student? StudentRecord { get; set; }

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }
    }
}