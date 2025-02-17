using Backend.Models.Jerald.Orders;
using Backend.Models.Jerald.Payments;
using Backend.Models.Sarah.Admins;
using Backend.Models.Sarah.Users;
using Microsoft.EntityFrameworkCore;
using Backend.Models.Sophie;
using Backend.Models.Sidney.Voucher;
using Backend.Models.Sidney.Delivery;

public class MyDbContext(IConfiguration configuration) : DbContext
{
    private readonly IConfiguration _configuration = configuration;
    public bool ApplyPaymentFilter { get; set; } = false;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        string? connectionString = _configuration.GetConnectionString("MyConnection");
        if (!string.IsNullOrEmpty(connectionString))
        {
            optionsBuilder.UseMySQL(connectionString);
        }
    }

    public required DbSet<Payment> Payments { get; set; }
    public required DbSet<Order> Orders { get; set; }
    public required DbSet<OrderItem> OrderItems { get; set; }
    public required DbSet<User> Users { get; set; }
    public required DbSet<Admin> Admins { get; set; }
    public required DbSet<Product> Products { get; set; }
    public required DbSet<Category> Categories { get; set; }
    public required DbSet<CollectionPoint> CollectionPoints { get; set; }
    public required DbSet<Warehouse> Warehouses { get; set; }
    public required DbSet<SustainabilityCertification> SustainabilityCertifications { get; set; }
    public required DbSet<UpcyclingRequest> UpcyclingRequests { get; set; }

    public required DbSet<Voucher> Vouchers { get; set; }
    public required DbSet<UserVoucher> UserVouchers { get; set; }
    public required DbSet<Delivery> Deliveries { get; set; } // Fixed: Marked as required

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Payment>().HasQueryFilter(p => ApplyPaymentFilter ? !p.IsDeleted : true);
        modelBuilder.Entity<User>().HasQueryFilter(u => u.Status != "Inactive");
        modelBuilder.Entity<Admin>().HasQueryFilter(a => a.Status != "Inactive");

        modelBuilder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<User>()
            .HasOne(u => u.ManagedByAdmin)
            .WithMany()
            .HasForeignKey(u => u.ManagedByAdminId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.SustainabilityCertification)
            .WithMany()
            .HasForeignKey(p => p.CertId);

        modelBuilder.Entity<UserVoucher>().HasKey(uv => new { uv.UserId, uv.VoucherId });

        modelBuilder.Entity<UserVoucher>()
            .HasOne(uv => uv.User)
            .WithMany(u => u.UserVouchers)
            .HasForeignKey(uv => uv.UserId);

        modelBuilder.Entity<UserVoucher>()
            .HasOne(uv => uv.Voucher)
            .WithMany(v => v.UserVouchers)
            .HasForeignKey(uv => uv.VoucherId);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Delivery)
            .WithOne(d => d.Order)
            .HasForeignKey<Delivery>(d => d.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Voucher>()
            .HasOne(v => v.Category)
            .WithMany(c => c.Vouchers)
            .HasForeignKey(v => v.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(modelBuilder);
    }
}
