using Dietetica.Models;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Dietetica.Config
{
    public class ApplicationDbContext : DbContext, IDataProtectionKeyContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Code> Codes { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(p => p.Id);

                entity.Property(p => p.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(p => p.Price)
                    .IsRequired()
                    .HasPrecision(10, 2);

                entity.Property(p => p.Stock)
                    .HasPrecision(10, 3)
                    .IsRequired();

                entity.Property(p => p.Type)
                    .IsRequired()
                    .HasConversion<string>();

                entity.HasIndex(p => p.Name).IsUnique();
            });

            modelBuilder.Entity<Code>(entity =>
            {
                entity.HasKey(c => c.Id);

                entity.Property(c => c.Value)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(c => c.Type)
                    .IsRequired()
                    .HasConversion<string>();

                entity.HasOne(c => c.Product)
                    .WithMany(p => p.Codes)
                    .HasForeignKey(c => c.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(c => c.Value)
                    .IsUnique();
            });

            modelBuilder.Entity<Sale>(entity =>
            {
                entity.HasKey(s => s.Id);

                entity.Property(s => s.CreatedAt)
                    .HasDefaultValueSql("NOW()")
                    .IsRequired();

                entity.Property(s => s.TicketNumber)
                    .IsRequired();

                entity.Property(s => s.Total)
                    .IsRequired()
                    .HasPrecision(10, 2);

                entity.HasOne(s => s.PaymentMethod)
                    .WithMany()
                    .HasForeignKey(s => s.PaymentMethodId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(s => s.CreatedAt);
            });

            modelBuilder.Entity<SaleItem>(entity =>
            {
                entity.HasKey(i => i.Id);

                entity.Property(i => i.Quantity)
                    .IsRequired()
                    .HasPrecision(10, 3);

                entity.Property(i => i.UnitPrice)
                    .IsRequired()
                    .HasPrecision(10, 2);

                entity.HasOne(i => i.Sale)
                    .WithMany(s => s.Items)
                    .HasForeignKey(i => i.SaleId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(i => i.Product)
                    .WithMany()
                    .HasForeignKey(i => i.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PaymentMethod>(entity =>
            {
                entity.HasKey(m => m.Id);

                entity.Property(m => m.Name)
                    .IsRequired()
                    .HasMaxLength(50);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);

                entity.Property(u => u.Username)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(u => u.Password)
                    .IsRequired();

                entity.HasIndex(u => u.Username)
                    .IsUnique();
            });
        }
    }    
}
