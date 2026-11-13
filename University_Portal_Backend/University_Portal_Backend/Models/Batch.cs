using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityPortal.API.Models
{
    [Table("batches")]
    public class Batch
    {
        [Key][Column("id")] public long Id { get; set; }
        [Column("name")] public string Name { get; set; } = string.Empty;
        [Column("start_year")] public int StartYear { get; set; }
        [Column("end_year")] public int EndYear { get; set; }
        [Column("is_active")] public bool IsActive { get; set; } = true;
        [Column("created_at")] public DateTime CreatedAt { get; set; }
    }
}