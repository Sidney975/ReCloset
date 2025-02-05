using AutoMapper;
using Backend.Models.Jerald.Orders;
using Backend.Models.Jerald.Payments;

namespace Backend
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Map OrderItem to BasicOrderItemDto
            CreateMap<OrderItem, BasicOrderItemDTO>()
                .ForMember(dest => dest.ItemPrice, opt => opt.MapFrom(src => src.ItemPrice));

            // Map Payment to BasicPaymentDto
            CreateMap<Payment, BasicPaymentDTO>()
                .ForMember(dest => dest.MaskedCardNumber, opt => opt.MapFrom(src => $"**** **** **** {src.LastFourDigits}"))
                .ForMember(dest => dest.IsDefault, opt => opt.MapFrom(src => src.DefaultPreference));


            // Map Order to OrderDTO
            CreateMap<Order, OrderDTO>()
                .ForMember(dest => dest.UserDetails, opt => opt.MapFrom(src => src.User)) // Ensure UserDetails is mapped
                .ForMember(dest => dest.DeliveryMethod, opt => opt.MapFrom(src => src.DeliveryOption.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.ShipmentStatus.ToString()))
                .ForMember(dest => dest.PaymentDetails, opt => opt.MapFrom(src => src.Payment));

            CreateMap<Payment, PaymentDTO>()
                .ForMember(dest => dest.UserDetails, opt => opt.MapFrom(src => src.User)) // Ensure UserDetails is mapped
                .ForMember(dest => dest.MaskedCardNumber, opt => opt.MapFrom(src => $"**** **** **** {src.LastFourDigits}"))
                .ForMember(dest => dest.ExpiryDate, opt => opt.MapFrom(src => src.ExpiryDate.ToString("MM/yy")))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.IsDefault, opt => opt.MapFrom(src => src.DefaultPreference)); // Explicitly map DefaultPreference to IsDefault
        }
    }
}
