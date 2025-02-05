namespace Backend.Models.Jerald.Orders
{
    public class BasicOrderItemDTO
    {
        public int ProductId { get; set; }
        //public string ProductName { get; set; } = string.Empty; // Placeholder for Product Name
        public int Quantity { get; set; } // Quantity ordered
        public decimal ItemPrice { get; set; } // price for this item 
    }
}
