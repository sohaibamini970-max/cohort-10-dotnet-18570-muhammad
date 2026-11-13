using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityPortal.API.Models
{
    [Table("program_session_semesters")]
    public class ProgramSessionSemester
    {
        [Key][Column("id")] public long Id { get; set; }

        [Column("program_id")] public long ProgramId { get; set; }
        [Column("batch_id")] public long BatchId { get; set; }
        [Column("session_id")] public long SessionId { get; set; }
        [Column("semester_id")] public long SemesterId { get; set; }

        [Column("is_active")] public bool IsActive { get; set; }
        [Column("created_at")] public DateTime CreatedAt { get; set; }

        // 👇 match the class names that actually exist in your project
        public DegreeProgram? Program { get; set; }
        public Batch? Batch { get; set; }
        public Session? Session { get; set; }
        public Semester? Semester { get; set; }
    }
}