using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityPortal.API.Models
{
    [Table("teachers")]
    public class Teacher
    {
        [Key][Column("id")] public Guid Id { get; set; }

        [Column("profile_id")]
        public Guid ProfileId { get; set; }

        [Column("department_id")]
        public long? DepartmentId { get; set; }

        [Column("employee_id")] public string EmployeeId { get; set; } = string.Empty;
        [Column("designation")] public string Designation { get; set; } = string.Empty;
        [Column("joining_date")] public DateTime? JoiningDate { get; set; }
        [Column("qualification")] public string? Qualification { get; set; }

        [Column("is_hod")] public bool IsHod { get; set; } = false;
        [Column("is_chairman")] public bool IsChairman { get; set; } = false;
        [Column("is_dean")] public bool IsDean { get; set; } = false;

        // Navigation properties
        [ForeignKey("ProfileId")] public Profile? Profile { get; set; }
        [ForeignKey("DepartmentId")] public Department? Department { get; set; }
    }
}