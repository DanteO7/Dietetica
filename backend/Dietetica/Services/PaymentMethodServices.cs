using AutoMapper;
using backend_proyecto.Utils.Errors;
using Dietetica.Models;
using Dietetica.Models.DTO;
using Dietetica.Repositories;
using System.Net;

namespace Dietetica.Services
{
    public class PaymentMethodServices
    {
        private readonly IPaymentMethodRepository _paymentMethodRepository;
        private readonly IMapper _mapper;
        public PaymentMethodServices(IPaymentMethodRepository paymentMethodRepository, IMapper mapper)
        {
            _paymentMethodRepository = paymentMethodRepository;
            _mapper = mapper;
        }

        public async Task<List<ResponsePaymentMethodDTO>> GetAll()
        {
            var methods = await _paymentMethodRepository.GetAllAsync();
            return _mapper.Map<List<ResponsePaymentMethodDTO>>(methods);
        }

        public async Task<ResponsePaymentMethodDTO> CreateOne(CreatePaymentMethodDTO createPaymentMethodDTO)
        {
            var existingMethod = await _paymentMethodRepository.GetOneAsync(m => m.Name.ToLower() == createPaymentMethodDTO.Name.ToLower());
            if(existingMethod != null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"Ya existe un metodo de pago con el nombre = '{createPaymentMethodDTO.Name}'");
            }

            if (string.IsNullOrWhiteSpace(createPaymentMethodDTO.Name) || createPaymentMethodDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre no puede ser nulo o tener más de 50 carácteres");
            }

            if (createPaymentMethodDTO.Discount < 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, "El descuento no puede ser menor a cero");
            }

            if (createPaymentMethodDTO.Discount > 100)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, "El descuento no puede superior a 100%");
            }

            var method = _mapper.Map<PaymentMethod>(createPaymentMethodDTO);
            await _paymentMethodRepository.CreateOneAsync(method);
            return _mapper.Map<ResponsePaymentMethodDTO>(method);
        }

        public async Task DeleteOne(int methodId)
        {
            var method = await _paymentMethodRepository.GetOneAsync(m => m.Id == methodId);
            if(method == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un método de pago con el Id = '{methodId}'");
            }

            await _paymentMethodRepository.DeleteOneAsync(method);
        }
        public async Task<ResponsePaymentMethodDTO> UpdateOne(int methodId, UpdatePaymentMethodDTO updatePaymentMethodDTO)
        {
            var method = await _paymentMethodRepository.GetOneAsync(m => m.Id == methodId);
            if (method == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un método de pago con el Id = '{methodId}'");
            }

            if (updatePaymentMethodDTO.Name != null)
            {
                var existingMethod = await _paymentMethodRepository.GetOneAsync(
                    m => m.Name.ToLower() == updatePaymentMethodDTO.Name.ToLower()
                         && m.Id != methodId
                );

                if (existingMethod != null)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest, $"Ya existe un metodo de pago con el nombre = '{updatePaymentMethodDTO.Name}'"
                    );
                }
            }

            if (updatePaymentMethodDTO.Name != null && updatePaymentMethodDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre no puede tener más de 50 carácteres");
            }
            if (updatePaymentMethodDTO.Discount != null && updatePaymentMethodDTO.Discount < 0)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, "El descuento no puede ser menor a cero");
            }
            if (updatePaymentMethodDTO.Discount != null && updatePaymentMethodDTO.Discount > 100)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, "El descuento no puede superior a 100%");
            }

            _mapper.Map(updatePaymentMethodDTO, method);
            await _paymentMethodRepository.UpdateOneAsync(method);
            return _mapper.Map<ResponsePaymentMethodDTO>(method);
        }
    }
}
