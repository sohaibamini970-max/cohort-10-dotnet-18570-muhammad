using Microsoft.EntityFrameworkCore;
using UniversityPortal.API.Models;

namespace UniversityPortal.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        // Existing DbSets
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<DegreeProgram> Programs { get; set; }
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Batch> Batches { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<ProgramCourse> ProgramCourses { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<Semester> Semesters { get; set; }
        public DbSet<ProgramSessionSemester> ProgramSessionSemesters { get; set; }

        // 👇 NEW DbSets 👇
        public DbSet<Student> Students { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<StudentRegistration> StudentRegistrations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ==========================================
            // 1. UNIQUE CONSTRAINTS
            // ==========================================
            modelBuilder.Entity<Profile>().HasIndex(p => p.Email).IsUnique();
            modelBuilder.Entity<Profile>().HasIndex(p => p.RollNo).IsUnique();
            modelBuilder.Entity<Department>().HasIndex(d => d.Code).IsUnique();
            modelBuilder.Entity<DegreeProgram>().HasIndex(p => p.Code).IsUnique();
            modelBuilder.Entity<Batch>().HasIndex(b => b.Name).IsUnique();
            modelBuilder.Entity<Course>().HasIndex(c => c.Code).IsUnique();
            modelBuilder.Entity<Session>().HasIndex(s => s.Name).IsUnique();
            modelBuilder.Entity<Semester>().HasIndex(s => s.Name).IsUnique();

            // ==========================================
            // 2. POSTGRESQL ENUM MAPPINGS
            // ==========================================
            modelBuilder.Entity<Profile>()
             .Property(p => p.Role)
             .HasColumnType("user_role");

            modelBuilder.Entity<Department>()
                .Property(d => d.Type)
                .HasColumnType("department_type");

            // ==========================================
            // 3. PROFILE & DEPARTMENT RELATIONSHIPS
            // ==========================================
            modelBuilder.Entity<Department>()
                .HasOne(d => d.Admin)
                .WithMany()
                .HasForeignKey(d => d.AdminId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Department>()
                .HasOne(d => d.Head)
                .WithMany()
                .HasForeignKey(d => d.HeadId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Profile>()
                .HasOne(p => p.Department)
                .WithMany()
                .HasForeignKey(p => p.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Teacher>()
                .HasOne(t => t.Profile)
                .WithOne()
                .HasForeignKey<Teacher>(t => t.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            // 👇 NEW: Student -> Profile Relationship 👇
            modelBuilder.Entity<Student>()
                .HasOne(s => s.Profile)
                .WithOne(p => p.StudentRecord) // Ensure Profile model has 'public Student? StudentRecord { get; set; }'
                .HasForeignKey<Student>(s => s.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            // ==========================================
            // 4. PROGRAM COURSE RELATIONSHIPS
            // ==========================================
            modelBuilder.Entity<ProgramCourse>()
                .HasOne(pc => pc.Program)
                .WithMany()
                .HasForeignKey(pc => pc.ProgramId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProgramCourse>()
                .HasOne(pc => pc.Course)
                .WithMany()
                .HasForeignKey(pc => pc.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProgramCourse>()
                .HasOne(pc => pc.Batch)
                .WithMany()
                .HasForeignKey(pc => pc.BatchId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProgramCourse>()
                .HasOne(pc => pc.Session)
                .WithMany()
                .HasForeignKey(pc => pc.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProgramCourse>()
                .HasOne(pc => pc.Semester)
                .WithMany()
                .HasForeignKey(pc => pc.SemesterId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProgramCourse>()
                .Property(pc => pc.Sections)
                .HasColumnType("text[]")
                .HasDefaultValue(Array.Empty<string>());

            modelBuilder.Entity<ProgramCourse>()
                .HasIndex(pc => new
                {
                    pc.ProgramId,
                    pc.CourseId,
                    pc.BatchId,
                    pc.SessionId,
                    pc.SemesterId
                })
                .IsUnique()
                .HasDatabaseName("ux_program_courses_unique_assignment");

            // ==========================================
            // 5. COURSE SELF-REFERENCING (PREREQUISITE)
            // ==========================================
            modelBuilder.Entity<Course>()
                .HasOne(c => c.Prerequisite)
                .WithMany()
                .HasForeignKey(c => c.PrerequisiteId)
                .OnDelete(DeleteBehavior.SetNull);

            // ==========================================
            // 6. PROGRAM SESSION SEMESTER RELATIONSHIPS
            // ==========================================
            modelBuilder.Entity<ProgramSessionSemester>()
                .HasIndex(x => new { x.ProgramId, x.BatchId, x.SessionId, x.SemesterId })
                .IsUnique();

            modelBuilder.Entity<ProgramSessionSemester>()
                .HasOne(x => x.Program)
                .WithMany()
                .HasForeignKey(x => x.ProgramId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProgramSessionSemester>()
                .HasOne(x => x.Batch)
                .WithMany()
                .HasForeignKey(x => x.BatchId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProgramSessionSemester>()
                .HasOne(x => x.Session)
                .WithMany()
                .HasForeignKey(x => x.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProgramSessionSemester>()
                .HasOne(x => x.Semester)
                .WithMany()
                .HasForeignKey(x => x.SemesterId)
                .OnDelete(DeleteBehavior.Restrict);

            // ==========================================
            // 7. SESSION DATE COLUMNS 
            // ==========================================
            modelBuilder.Entity<Session>()
                .Property(s => s.StartDate)
                .HasColumnType("date");

            modelBuilder.Entity<Session>()
                .Property(s => s.EndDate)
                .HasColumnType("date");

            // ==========================================
            // 8. 👇 NEW: STUDENT & SECTION RELATIONSHIPS 👇
            // ==========================================

            // Student -> Department, Program, Batch
            modelBuilder.Entity<Student>()
                .HasOne(s => s.Department)
                .WithMany()
                .HasForeignKey(s => s.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Student>()
                .HasOne(s => s.Program)
                .WithMany()
                .HasForeignKey(s => s.ProgramId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Student>()
                .HasOne(s => s.Batch)
                .WithMany()
                .HasForeignKey(s => s.BatchId)
                .OnDelete(DeleteBehavior.Restrict);

            // Section -> Program, Batch, Semester
            modelBuilder.Entity<Section>()
                .HasIndex(s => new { s.ProgramId, s.BatchId, s.SemesterId, s.Name })
                .IsUnique(); // Unique constraint for Section A, B, etc. per batch/sem

            modelBuilder.Entity<Section>()
                .HasOne(s => s.Program)
                .WithMany()
                .HasForeignKey(s => s.ProgramId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Section>()
                .HasOne(s => s.Batch)
                .WithMany()
                .HasForeignKey(s => s.BatchId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Section>()
                .HasOne(s => s.Semester)
                .WithMany()
                .HasForeignKey(s => s.SemesterId)
                .OnDelete(DeleteBehavior.Cascade);

            // StudentRegistration -> Student, ProgramCourse, Section
            modelBuilder.Entity<StudentRegistration>()
                .HasOne(r => r.StudentProfile)
                .WithMany()
                .HasForeignKey(r => r.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentRegistration>()
                .HasOne(r => r.ProgramCourse)
                .WithMany()
                .HasForeignKey(r => r.ProgramCourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentRegistration>()
                .HasOne(r => r.Section)
                .WithMany()
                .HasForeignKey(r => r.SectionId)
                .OnDelete(DeleteBehavior.Restrict); // Don't delete a registration if the section is deleted
        }
    }
}