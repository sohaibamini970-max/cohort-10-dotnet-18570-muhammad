using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("sessions")]
public class Session
{
    [Key][Column("id")] public long Id { get; set; }
    [Column("name")] public string Name { get; set; } = string.Empty;

    [Column("start_date", TypeName = "date")] public DateTime StartDate { get; set; }
    [Column("end_date", TypeName = "date")] public DateTime EndDate { get; set; }

    [Column("is_active")] public bool IsActive { get; set; } = true;
    [Column("created_at")] public DateTime CreatedAt { get; set; }   // timestamptz stays
}