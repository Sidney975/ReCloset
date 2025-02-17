﻿using AutoMapper;
using Backend.Models.Jerald.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;

        public PaymentController(MyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;

            // Enable the soft-delete filter for Payments
            _context.ApplyPaymentFilter = true;
        }


        private int GetUserId()
        {
            return Convert.ToInt32(User.Claims
            .Where(c => c.Type == ClaimTypes.NameIdentifier)
            .Select(c => c.Value).SingleOrDefault());
        }

        // GET all payments
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<PaymentDTO>), StatusCodes.Status200OK)]
        public IActionResult GetAll(string? search)
        {
            int userId = GetUserId(); // Get the logged-in user's ID

            // Query the database
            IQueryable<Payment> result = _context.Payments
        .Include(t => t.User) // Include user details
        .Where(p => p.UserId == userId); // 🔹 Filter by the logged-in user

            if (!string.IsNullOrEmpty(search))
            {
                result = result.Where(p => p.PaymentMethod.Contains(search));
            }

            // Materialize the query into a list
            var list = result.OrderBy(x => x.PaymentId).ToList();

            // Map the list to DTOs
            var paymentDtos = _mapper.Map<List<PaymentDTO>>(list);
            return Ok(paymentDtos);
        }


        // GET a specific payment by ID
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PaymentDTO), StatusCodes.Status200OK)]
        public IActionResult GetPaymentById(int id)
        {
            var payment = _context.Payments.Include(t => t.User).FirstOrDefault(p => p.PaymentId == id && p.UserId == GetUserId());
            if (payment == null)
            {
                return NotFound("Payment not found.");
            }

            PaymentDTO paymentDto = _mapper.Map<PaymentDTO>(payment);
            return Ok(paymentDto);
        }

        // POST to add a new payment
        [HttpPost, Authorize]
        [ProducesResponseType(typeof(PaymentDTO), StatusCodes.Status201Created)]
        public IActionResult AddPayment([FromBody] AddPaymentRequestDTO addPaymentRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Extract and store the last four digits for display
            var lastFourDigits = addPaymentRequest.CardNumber[^4..];

            // Hash sensitive fields
            var hashedCardNumber = BCrypt.Net.BCrypt.HashPassword(addPaymentRequest.CardNumber);
            var hashedCVV = BCrypt.Net.BCrypt.HashPassword(addPaymentRequest.CVV);

            var userId = GetUserId();
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null)
            {
                return BadRequest("Invalid user.");
            }

            // Create a Payment entity
            var payment = new Payment
            {
                PaymentMethod = addPaymentRequest.PaymentMethod,
                CardNumber = hashedCardNumber,
                CVV = hashedCVV,
                LastFourDigits = lastFourDigits,
                ExpiryDate = addPaymentRequest.ExpiryDate,
                BillingAddress = addPaymentRequest.BillingAddress,
                BillingZip = addPaymentRequest.BillingZip,
                DefaultPreference = addPaymentRequest.DefaultPreference,
                Status = addPaymentRequest.Status,
                UserId = userId,
                User = user,
                Country = addPaymentRequest.Country,
                City = addPaymentRequest.City   
            };

            // Add payment to the database
            _context.Payments.Add(payment);
            _context.SaveChanges();

            // Map to DTO
            var paymentDto = _mapper.Map<PaymentDTO>(payment);

            return CreatedAtAction(nameof(GetPaymentById), new { id = payment.PaymentId }, paymentDto);
        }

        [HttpPut("{id}"), Authorize]
        [ProducesResponseType(typeof(PaymentDTO), StatusCodes.Status200OK)]
        public IActionResult UpdatePayment(int id, [FromBody] UpdatePaymentRequestDTO updatePaymentRequest)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { Errors = errors });
            }
            int userId = GetUserId();

            
            var payment = _context.Payments.FirstOrDefault(p => p.PaymentId == id);
            if (payment == null)
            {
                return NotFound("Payment not found.");
            }
            if (payment.UserId != userId)
            {
                return Forbid();
            }
            // Handle DefaultPreference logic
            if (updatePaymentRequest.DefaultPreference == true)
            {
                _context.Payments
                    .Where(p => p.PaymentId != id)
                    .ToList()
                    .ForEach(p => p.DefaultPreference = false);
            }

            // Update provided fields
            payment.DefaultPreference = updatePaymentRequest.DefaultPreference ?? payment.DefaultPreference;
            payment.PaymentMethod = updatePaymentRequest.PaymentMethod ?? payment.PaymentMethod;

            if (!string.IsNullOrEmpty(updatePaymentRequest.CardNumber))
            {
                payment.LastFourDigits = updatePaymentRequest.CardNumber[^4..];
                payment.CardNumber = BCrypt.Net.BCrypt.HashPassword(updatePaymentRequest.CardNumber);
            }

            if (!string.IsNullOrEmpty(updatePaymentRequest.CVV))
            {
                payment.CVV = BCrypt.Net.BCrypt.HashPassword(updatePaymentRequest.CVV);
            }

            payment.ExpiryDate = updatePaymentRequest.ExpiryDate ?? payment.ExpiryDate;
            payment.BillingAddress = updatePaymentRequest.BillingAddress ?? payment.BillingAddress;
            payment.BillingZip = updatePaymentRequest.BillingZip ?? payment.BillingZip;
            payment.Status = updatePaymentRequest.Status ?? payment.Status;
            payment.Country = updatePaymentRequest.Country ?? payment.Country;
            payment.City = updatePaymentRequest.City ?? payment.City; 
            // Save changes
            _context.SaveChanges();

            // Map to DTO and return response
            var paymentDto = _mapper.Map<PaymentDTO>(payment);
            return Ok(paymentDto);
        }






        // DELETE a payment by ID
        [HttpDelete("{id}")]
        public IActionResult DeletePayment(int id)
        {
            var payment = _context.Payments.FirstOrDefault(p => p.PaymentId == id);
            if (payment == null)
            {
                return NotFound("Payment not found.");
            }

            // Mark the payment as deleted
            payment.IsDeleted = true;

            // Save changes to the database
            _context.SaveChanges();

            return NoContent();
        }

    }
}
