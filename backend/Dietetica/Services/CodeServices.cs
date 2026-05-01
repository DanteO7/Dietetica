using AutoMapper;
using backend_proyecto.Utils.Errors;
using Dietetica.Models;
using Dietetica.Models.DTO;
using Dietetica.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Dietetica.Services
{
    public class CodeServices
    {
        private readonly ICodeRepository _codeRepository;
        private readonly IMapper _mapper;
        private readonly IProductRepository _productRepository;
        public CodeServices(ICodeRepository codeRepository, IMapper mapper, IProductRepository productRepository)
        {
            _codeRepository = codeRepository;
            _mapper = mapper;
            _productRepository = productRepository;
        }

        public async Task<ResponseProductDTO> CreateOne(int productId, CreateCodeDTO createCodeDTO)
        {
            var product = await _productRepository.GetOneAsync(p => p.Id  == productId);
            if (product == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un producto con el Id = '{productId}'");
            }

            if(string.IsNullOrWhiteSpace(createCodeDTO.Value) || createCodeDTO.Value.Length > 100)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, "El valor del código no puede ser nulo o tener más de 100 carácteres");
            }

            if (!Enum.IsDefined(createCodeDTO.Type))
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, "Tipo de código inválido");
            }

            var code = _mapper.Map<Code>(createCodeDTO);
            code.ProductId = productId;
            await _codeRepository.CreateOneAsync(code);

            var updatedProduct = await _productRepository.GetOneAsync(
                 p => p.Id == code.ProductId,
                 p => p.Codes
             );
            return _mapper.Map<ResponseProductDTO>(product);
        }

        public async Task<ResponseProductDTO> DeleteOne(int codeId)
        {
            var code = await _codeRepository.GetOneAsync(c => c.Id == codeId);
            if (code == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un código con el Id = '{codeId}'");
            }

            var totalCodes = await _codeRepository
                .Query()
                .CountAsync(c => c.ProductId == code.ProductId);

            if (totalCodes <= 1)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No se puede eliminar el último código del producto");
            }
            var productId = code.ProductId;
            await _codeRepository.DeleteOneAsync(code);

            var product = await _productRepository.GetOneAsync(
                p => p.Id == productId,
                p => p.Codes
            );
            return _mapper.Map<ResponseProductDTO>(product);

        }

        public async Task<ResponseProductDTO> UpdateOne(int codeId, UpdateCodeIndividualDTO updateCodeIndividualDTO)
        {
            var code = await _codeRepository.GetOneAsync(c => c.Id == codeId);
            if (code == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un código con el Id = '{codeId}'");
            }

            if (updateCodeIndividualDTO.Value != null && updateCodeIndividualDTO.Value.Length > 100)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, "El valor del código no puede ser mayor a 100 carácteres");
            }

            if (updateCodeIndividualDTO.Type != null && !Enum.IsDefined(updateCodeIndividualDTO.Type.Value))
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, "Tipo de código inválido");
            }
            _mapper.Map(updateCodeIndividualDTO, code);
            await _codeRepository.UpdateOneAsync(code);

            var product = await _productRepository.GetOneAsync(
                 p => p.Id == code.ProductId,
                 p => p.Codes
             );
            return _mapper.Map<ResponseProductDTO>(product);
        }
    }
}
