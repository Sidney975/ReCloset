using Backend.Models.Jerald.Orders;
using Backend.Models.Jerald.Payments;
using Backend.Models.Sarah.Users;
using Backend.Models.Sophie;
using Backend.Models.Sidney.Voucher;
using Backend.Models.Sidney.Delivery;
using Microsoft.EntityFrameworkCore;

public class MyDbContext : DbContext
{
    public bool ApplyPaymentFilter { get; set; } = false;

    public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

    // Define all DbSets (Tables)
    public DbSet<User> Users { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<CollectionPoint> CollectionPoints { get; set; }
    public DbSet<Warehouse> Warehouses { get; set; }
    public DbSet<SustainabilityCertification> SustainabilityCertifications { get; set; }
    public DbSet<UpcyclingRequest> UpcyclingRequests { get; set; }
    public DbSet<Voucher> Vouchers { get; set; }
    public DbSet<UserVoucher> UserVouchers { get; set; }
    public DbSet<Delivery> Deliveries { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // 🔹 Apply Soft Delete Filters
        modelBuilder.Entity<Payment>().HasQueryFilter(p => ApplyPaymentFilter ? !p.IsDeleted : true);
        modelBuilder.Entity<User>().HasQueryFilter(u => u.Status != "Inactive");

        // 🔹 Ensure UserId is Unique
        modelBuilder.Entity<User>()
            .HasIndex(u => u.UserId)
            .IsUnique();

        // 🔹 Admin-User Relationship
        modelBuilder.Entity<User>()
            .HasOne(u => u.ManagedByAdmin)
            .WithMany()
            .HasForeignKey(u => u.ManagedByAdminId)
            .OnDelete(DeleteBehavior.Restrict);

        // 🔹 Orders Relationship (User -> Orders)
        modelBuilder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // 🔹 User-Voucher Relationship (Many-to-Many)
        modelBuilder.Entity<UserVoucher>().HasKey(uv => new { uv.UserId, uv.VoucherId });

        modelBuilder.Entity<UserVoucher>()
            .HasOne(uv => uv.User)
            .WithMany(u => u.UserVouchers)
            .HasForeignKey(uv => uv.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserVoucher>()
            .HasOne(uv => uv.Voucher)
            .WithMany(v => v.UserVouchers)
            .HasForeignKey(uv => uv.VoucherId)
            .OnDelete(DeleteBehavior.Cascade);

        // 🔹 Delivery Relationship (One-to-One with Order)
        modelBuilder.Entity<Order>()
            .HasOne(o => o.Delivery)
            .WithOne(d => d.Order)
            .HasForeignKey<Delivery>(d => d.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // 🔹 Voucher-Category Relationship
        modelBuilder.Entity<Voucher>()
            .HasOne(v => v.Category)
            .WithMany(c => c.Vouchers)
            .HasForeignKey(v => v.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(modelBuilder);
    }
}
