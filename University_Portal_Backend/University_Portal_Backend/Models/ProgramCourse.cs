using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityPortal.API.Models
{
    [Table("program_courses")]
    public class ProgramCourse
    {
        [Key][Column("id")] public long Id { get; set; }
        [Column("program_id")] public long ProgramId { get; set; }
        [Column("course_id")] public long CourseId { get; set; }
        [Column("batch_id")] public long BatchId { get; set; }

        // 👇 Updated to use IDs 👇
        [Column("session_id")] public long SessionId { get; set; }
        [Column("semester_id")] public long SemesterId { get; set; }

        [Column("sections")] public string[] Sections { get; set; } = Array.Empty<string>();
        [Column("created_at")] public DateTime CreatedAt { get; set; }

        // Navigation Properties
        [ForeignKey("ProgramId")] public DegreeProgram? Program { get; set; }
        [ForeignKey("CourseId")] public Course? Course { get; set; }
        [ForeignKey("BatchId")] public Batch? Batch { get; set; }
        [ForeignKey("SessionId")] public Session? Session { get; set; }
        [ForeignKey("SemesterId")] public Semester? Semester { get; set; }
    }
}