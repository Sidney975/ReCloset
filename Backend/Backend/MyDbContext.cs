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
    public DbSet<Delivery> Deliveries { get; set; } // Register the Delivery model

    // Configure global query filters
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply a global query filter to exclude soft-deleted payments
        modelBuilder.Entity<Payment>().HasQueryFilter(p => ApplyPaymentFilter ? !p.IsDeleted : true);

        // You can configure other entity relationships or filters here


        modelBuilder.Entity<Product>()
            .HasOne(p => p.SustainabilityCertification)
            .WithMany()
            .HasForeignKey(p => p.CertId);


        modelBuilder.Entity<Product>()
            .Property(p => p.Available)
            .HasDefaultValue(true);  // Set default to `true`


        // Seed data for Warehouses
        modelBuilder.Entity<Warehouse>().HasData(
            new Warehouse { WarehouseId = 1, LocationName = "Northeast Warehouse", Street = "38 Ang Mo Kio Ind Park 2", City = "Singapore", State = "SG", PostalCode = "569511", Country = "Singapore", ContactNo = "12345678", Latitude = 1.3765864094476026, Longitude = 103.8659848158459 },
            new Warehouse { WarehouseId = 2, LocationName = "Central Warehouse", Street = "20 Depot Rd", City = "Singapore", State = "SG", PostalCode = "109677", Country = "Singapore", ContactNo = "87654321", Latitude = 1.281216720946465, Longitude = 103.81405834338983 }
        );

        // Seed data for Categories
        modelBuilder.Entity<Category>().HasData(
            new Category { CategoryId = 1, Name = "Clothing", Description = "Second-hand fashion items" },
            new Category { CategoryId = 2, Name = "Accessories", Description = "Jewelry, bags, belts, etc." }
        );

        // Seed data for Sustainability Certifications
        modelBuilder.Entity<SustainabilityCertification>().HasData(
            new SustainabilityCertification { CertId = 1, Name = "Fair Trade", Description = "Certified Fair Trade standard for ethical sourcing.", QRCodeUrl = "fairtrade.png" },
            new SustainabilityCertification { CertId = 2, Name = "Global Organic Textile Standard (GOTS)", Description = "Ensures organic fibers and environmental responsibility.", QRCodeUrl = "gots.png" }
        );


        modelBuilder.Entity<UserVoucher>().HasKey(uv => new { uv.UserId, uv.VoucherId });

        // Configure the relationships for UserVoucher
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
