using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityPortal.API.Models
{
    [Table("sections")]
    public class Section
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("program_id")]
        public long ProgramId { get; set; }

        [Column("batch_id")]
        public long BatchId { get; set; }

        [Column("semester_id")]
        public long SemesterId { get; set; }

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        // 👇 Add this field for the seat limit
        [Column("max_seats")]
        public int MaxSeats { get; set; } = 50;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        [ForeignKey("ProgramId")]
        public DegreeProgram? Program { get; set; }

        [ForeignKey("BatchId")]
        public Batch? Batch { get; set; }

        [ForeignKey("SemesterId")]
        public Semester? Semester { get; set; }
    }
}