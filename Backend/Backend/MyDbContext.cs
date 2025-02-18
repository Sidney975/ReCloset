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


    public required DbSet<OrderAddress> OrderAddresses { get; set; }


    // Configure global query filters
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
        // modelBuilder.Entity<User>()
        //     .HasOne(u => u.ManagedByAdmin)
        //     .WithMany()
        //     .HasForeignKey(p => p.CertId);


        // Seed data for Warehouses
        modelBuilder.Entity<Warehouse>().HasData(
            new Warehouse { WarehouseId = 1, LocationName = "Northeast Warehouse", Street = "38 Ang Mo Kio Ind Park 2", City = "Singapore", State = "SG", PostalCode = "569511", Country = "Singapore", ContactNo = "12345678", Latitude = 1.3765864094476026, Longitude = 103.8659848158459 },
            new Warehouse { WarehouseId = 2, LocationName = "Central Warehouse", Street = "20 Depot Rd", City = "Singapore", State = "SG", PostalCode = "109677", Country = "Singapore", ContactNo = "87654321", Latitude = 1.281216720946465, Longitude = 103.81405834338983 }
        );

        // Seed data for Categories
        modelBuilder.Entity<Category>().HasData(
            new Category { CategoryId = 1, Name = "Accessory", Description = "Jewelry, bags, belts, etc." },
            new Category { CategoryId = 2, Name = "Blouse", Description = "Upper garment resembling a shirt, typically with a collar, buttons, and sleeves." },
            new Category { CategoryId = 3, Name = "Dress", Description = "One-piece garment that covers the body and extends down over the thighs or legs." },
            new Category { CategoryId = 4, Name = "Jacket", Description = "Outer garment extending either to the waist or the hips, typically having sleeves and a fastening down the front." },
            new Category { CategoryId = 5, Name = "T-Shirt", Description = "Short-sleeved casual top, generally made of cotton, having the shape of a T when spread out flat." }
        );

        // Seed data for Sustainability Certifications
        modelBuilder.Entity<SustainabilityCertification>().HasData(
            new SustainabilityCertification { CertId = 1, Name = "Fair Trade", Description = "Certified Fair Trade standard for ethical sourcing.", QRCodeUrl = "fairtrade.png" },
            new SustainabilityCertification { CertId = 2, Name = "Global Organic Textile Standard (GOTS)", Description = "Ensures organic fibers and environmental responsibility.", QRCodeUrl = "gots.png" }
        );

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

        modelBuilder.Entity<Voucher>()
            .HasOne(v => v.Category)
            .WithMany(c => c.Vouchers)
            .HasForeignKey(v => v.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Order>()
        .HasMany(o => o.Deliveries) // **Fix Here**
        .WithOne(d => d.Order)
        .HasForeignKey(d => d.OrderId)
        .OnDelete(DeleteBehavior.Cascade);


        base.OnModelCreating(modelBuilder);

    }
}
