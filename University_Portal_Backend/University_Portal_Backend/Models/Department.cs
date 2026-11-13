using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityPortal.API.Models
{
    [Table("departments")]
    public class Department
    {
        [Key][Column("id")] public long Id { get; set; }
        [Column("name")] public string Name { get; set; } = string.Empty;
        [Column("code")] public string Code { get; set; } = string.Empty;

        // 👇 Add HasConversion<string>() here
        [Column("type")]
        public string Type { get; set; } = "education";

        [Column("description")] public string? Description { get; set; }
        [Column("location")] public string? Location { get; set; }
        [Column("building")] public string? Building { get; set; }
        [Column("email")] public string? Email { get; set; }
        [Column("phone")] public string? Phone { get; set; }
        [Column("established_year")] public int? EstablishedYear { get; set; }
        [Column("head_id")] public Guid? HeadId { get; set; }
        [Column("admin_id")] public Guid? AdminId { get; set; }
        [Column("is_active")] public bool IsActive { get; set; } = true;
        [Column("created_by")] public Guid? CreatedBy { get; set; }
        [Column("created_at")] public DateTime CreatedAt { get; set; }
        [Column("updated_at")] public DateTime UpdatedAt { get; set; }

        [ForeignKey("HeadId")] public Profile? Head { get; set; }
        [ForeignKey("AdminId")] public Profile? Admin { get; set; }
    }
}