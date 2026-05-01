using AutoMapper;
using Dietetica.Enums;
using Dietetica.Models;
using Dietetica.Models.DTO;

namespace Dietetica.Config
{
    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<int?, int>().ConvertUsing((src, dest) => src ?? dest);
            CreateMap<string?, string>().ConvertUsing((src, dest) => src ?? dest);
            CreateMap<decimal?, decimal>().ConvertUsing((src, dest) => src ?? dest);
            CreateMap<ProductType?, ProductType>().ConvertUsing((src, dest) => src ?? dest);
            CreateMap<CodeType?, CodeType>().ConvertUsing((src, dest) => src ?? dest);

            // PRODUCT
            CreateMap<CreateProductDTO, Product>();
            CreateMap<UpdateProductDTO, Product>()
                .ForMember(dest => dest.Codes, opt => opt.Ignore());
            CreateMap<Product, ResponseProductDTO>();

            // CODE
            CreateMap<CreateCodeDTO, Code>();
            CreateMap<UpdateCodeDTO, Code>();
            CreateMap<UpdateCodeIndividualDTO, Code>();
            CreateMap<Code, ResponseCodeDTO>();

            // PAYMENT METHOD
            CreateMap<CreatePaymentMethodDTO, PaymentMethod>();
            CreateMap<UpdatePaymentMethodDTO, PaymentMethod>();
            CreateMap<PaymentMethod, ResponsePaymentMethodDTO>();

            // SALE
            CreateMap<CreateSaleDTO, Sale>();
            CreateMap<Sale, ResponseSaleDTO>()
                .ForMember(dest => dest.CreatedAt,
                    opt => opt.MapFrom(src => DateTimeHelper.ToArgentinaTime(src.CreatedAt)))
                .ForMember(dest => dest.PaymentMethod,
                    opt => opt.MapFrom(src => src.PaymentMethod));
            CreateMap<Sale, ResponseSaleDetailDTO>()
                .ForMember(dest => dest.CreatedAt,
                    opt => opt.MapFrom(src => DateTimeHelper.ToArgentinaTime(src.CreatedAt)))
                .ForMember(dest => dest.PaymentMethod,
                    opt => opt.MapFrom(src => src.PaymentMethod))
                .ForMember(dest => dest.Items,
                    opt => opt.MapFrom(src => src.Items));

            // SALE ITEM
            CreateMap<CreateSaleItemDTO, SaleItem>();
            CreateMap<SaleItem, ResponseSaleItemDTO>()
                .ForMember(dest => dest.ProductName,
                    opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.ProductType,
                    opt => opt.MapFrom(src => src.Product.Type));

            // USER
            CreateMap<CreateUserDTO, User>().ForMember(dest => dest.Password, opt => opt.Ignore());
            CreateMap<User, ResponseUserDTO>();
        }
    }
}
