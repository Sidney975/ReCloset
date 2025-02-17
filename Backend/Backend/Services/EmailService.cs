using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using Backend.Models.Jerald.Orders;
using Microsoft.EntityFrameworkCore;

public class EmailService
{
    private readonly IConfiguration _config;
    private readonly MyDbContext _context;

    public EmailService(IConfiguration config, MyDbContext context)
    {
        _config = config;
        _context = context;
    }

    public async Task SendInvoiceEmailAsync(int orderId)
    {
        // Fetch order details from the database
        var order = _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.User)
            .FirstOrDefault(o => o.OrderId == orderId);

        if (order == null || order.User == null)
        {
            throw new Exception("Order not found or user not associated with the order.");
        }

        string customerName = order.User.Username;
        string toEmail = order.User.Email;
        decimal totalAmount = order.TotalPrice;

        var smtpClient = new SmtpClient(_config["EmailSettings:SMTPHost"])
        {
            Port = int.Parse(_config["EmailSettings:SMTPPort"]),
            Credentials = new NetworkCredential(_config["EmailSettings:SMTPUsername"], _config["EmailSettings:SMTPPassword"]),
            EnableSsl = bool.Parse(_config["EmailSettings:EnableSSL"])
        };

        string subject = $"Invoice for Order #{order.OrderId}";
        string body = GenerateInvoiceHtml(order);

        var mailMessage = new MailMessage
        {
            From = new MailAddress(_config["EmailSettings:SMTPUsername"], "Recloset Team"),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };

        mailMessage.To.Add(toEmail);
        await smtpClient.SendMailAsync(mailMessage);
    }

    private string GenerateInvoiceHtml(Order order)
    {
        string itemRows = "";
        foreach (var item in order.OrderItems)
        {
            itemRows += $@"
            <tr>
                <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{item.ProductName}</td>
                <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{item.Quantity}</td>
                <td style='padding: 10px; border-bottom: 1px solid #ddd;'>${item.ItemPrice:F2}</td>
                <td style='padding: 10px; border-bottom: 1px solid #ddd;'>${(item.Quantity * item.ItemPrice):F2}</td>
            </tr>";
        }

        return $@"
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .invoice-container {{ width: 100%; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; }}
                .header {{ text-align: center; font-size: 20px; font-weight: bold; }}
                .table-container {{ width: 100%; border-collapse: collapse; }}
                .table-container th, .table-container td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                .total {{ font-size: 18px; font-weight: bold; text-align: right; padding-top: 10px; }}
            </style>
        </head>
        <body>
            <div class='invoice-container'>
                <div class='header'>Invoice for Order #{order.OrderId}</div>
                <p>Hello {order.User.Username},</p>
                <p>Thank you for shopping with <strong>Recloset</strong>! Here is your order summary:</p>
                <table class='table-container'>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                    {itemRows}
                </table>
                <p class='total'>Grand Total: <strong>${order.TotalPrice:F2}</strong></p>
                <p>If you have any questions, feel free to contact us.</p>
                <p>Best regards, <br/><strong>Recloset Team</strong></p>
            </div>
        </body>
        </html>";
    }
}
