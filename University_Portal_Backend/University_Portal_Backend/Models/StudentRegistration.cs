using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityPortal.API.Models
{
    [Table("student_registrations")]
    public class StudentRegistration
    {
        [Key][Column("id")] public long Id { get; set; }
        [Column("student_profile_id")] public Guid StudentProfileId { get; set; }
        [Column("program_course_id")] public long ProgramCourseId { get; set; }
        [Column("section_id")] public long SectionId { get; set; }
        [Column("status")] public string Status { get; set; } = "Enrolled";
        [Column("registered_at")] public DateTime RegisteredAt { get; set; }

        [ForeignKey("StudentProfileId")] public Profile? StudentProfile { get; set; }
        [ForeignKey("ProgramCourseId")] public ProgramCourse? ProgramCourse { get; set; }
        [ForeignKey("SectionId")] public Section? Section { get; set; }
    }
}