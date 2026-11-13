using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityPortal.API.Models
{
    [Table("students")]
    public class Student
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("profile_id")]
        public Guid ProfileId { get; set; }

        [Column("department_id")]
        public long DepartmentId { get; set; }

        [Column("program_id")]
        public long ProgramId { get; set; }

        [Column("batch_id")]
        public long BatchId { get; set; }

        [Column("section")]
        public string Section { get; set; } = string.Empty;

        [Column("father_name")]
        public string FatherName { get; set; } = string.Empty;

        [Column("is_active")]
        public bool IsActive { get; set; } = false;

        // ==========================================
        // Navigation Properties
        // ==========================================

        [ForeignKey("ProfileId")]
        public Profile? Profile { get; set; }

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }

        [ForeignKey("ProgramId")]
        public DegreeProgram? Program { get; set; }

        [ForeignKey("BatchId")]
        public Batch? Batch { get; set; }
    }
}