using Backend.Models.Jerald.Orders;
using Backend.Models.Jerald.Payments;
using Backend.Models.Sarah.Admins;
using Backend.Models.Sarah.Users;
using Backend.Models.Sophie;
using Microsoft.EntityFrameworkCore;

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

    // ✅ Configure Global Query Filters & Relationships
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Exclude soft-deleted payments
        modelBuilder.Entity<Payment>().HasQueryFilter(p => ApplyPaymentFilter ? !p.IsDeleted : true);

        // ✅ Global filter: Exclude soft-deleted users (Status != "Inactive")
        modelBuilder.Entity<User>().HasQueryFilter(u => u.Status != "Inactive");

        // ✅ Global filter: Ensure only active admins are retrieved
        modelBuilder.Entity<Admin>().HasQueryFilter(a => a.Status != "Inactive");

        // ✅ Make Order -> User relationship optional to avoid breaking Orders when User is deleted
        modelBuilder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.SetNull); // 🔥 Ensures Orders remain even if User is deleted


        // ✅ Corrected: Define the Admin-User relationship
        modelBuilder.Entity<User>()
            .HasOne(u => u.ManagedByAdmin)
            .WithMany() // No need to specify a navigation property in Admin
            .HasForeignKey(u => u.ManagedByAdminId)
            .OnDelete(DeleteBehavior.SetNull); // If an Admin is deleted, Users remain

        // ✅ Seed data for Warehouses
        modelBuilder.Entity<Warehouse>().HasData(
            new Warehouse { WarehouseId = 1, LocationName = "Central Warehouse", Street = "123 Green St", City = "Singapore", State = "SG", PostalCode = "123456", Country = "Singapore", ContactNo = "12345678" },
            new Warehouse { WarehouseId = 2, LocationName = "East Warehouse", Street = "456 Blue St", City = "Singapore", State = "SG", PostalCode = "654321", Country = "Singapore", ContactNo = "87654321" }
        );

        // ✅ Seed data for Categories
        modelBuilder.Entity<Category>().HasData(
            new Category { CategoryId = 1, Name = "Clothing", Description = "Second-hand fashion items" },
            new Category { CategoryId = 2, Name = "Accessories", Description = "Jewelry, bags, belts, etc." }
        );

        // ✅ Seed data for Sustainability Certifications
        modelBuilder.Entity<SustainabilityCertification>().HasData(
            new SustainabilityCertification { CertId = 1, Name = "Fair Trade", Description = "Certified Fair Trade standard for ethical sourcing." },
            new SustainabilityCertification { CertId = 2, Name = "Global Organic Textile Standard (GOTS)", Description = "Ensures organic fibers and environmental responsibility." }
        );

        base.OnModelCreating(modelBuilder);
    }
}
