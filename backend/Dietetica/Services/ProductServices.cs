using AutoMapper;
using backend_proyecto.Utils.Errors;
using Dietetica.Enums;
using Dietetica.Models;
using Dietetica.Models.DTO;
using Dietetica.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Dietetica.Services
{
    public class ProductServices
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;
        private readonly ICodeRepository _codeRepository;
        private readonly StorageService _storageService;

        public ProductServices(
            IProductRepository productRepository,
            IMapper mapper,
            ICodeRepository codeRepository,
            StorageService storageService)
        {
            _productRepository = productRepository;
            _mapper = mapper;
            _codeRepository = codeRepository;
            _storageService = storageService;
        }

        public async Task<PagedResponse<ResponseProductDTO>> GetAll(
            string? search,
            bool? isGranel,
            bool? isUnit,
            bool? isLowStock,
            int page = 1,
            int pageSize = 10)
        {
            IQueryable<Product> query = _productRepository.Query();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p =>
                    EF.Functions.ILike(p.Name, $"%{search}%") ||
                    p.Codes.Any(c => EF.Functions.ILike(c.Value, $"%{search}%")));
            }

            if (isGranel == true && isUnit == true)
            {
            }
            else if (isGranel == true)
            {
                query = query.Where(p => p.Type == ProductType.Weight);
            }
            else if (isUnit == true)
            {
                query = query.Where(p => p.Type == ProductType.Unit);
            }
            if (isLowStock == true)
            {
                query = query.Where(p => (p.Type == ProductType.Unit && p.Stock <= 5) || (p.Type == ProductType.Weight && p.Stock <= 3000));
            }

            var totalCount = await query.CountAsync();

            query = query.OrderBy(p => p.Name);

            var products = await query
                .Include(p => p.Codes)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var mapped = _mapper.Map<List<ResponseProductDTO>>(products);

            return new PagedResponse<ResponseProductDTO>
            {
                Items = mapped,
                Page = page,
                PageSize = pageSize,
                HasNextPage = page * pageSize < totalCount
            };
        }

        public async Task<ResponseProductDTO> GetOneById(int id)
        {
            var product = await _productRepository.GetOneAsync(
                p => p.Id == id,
                p => p.Codes);

            if (product == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un producto con el Id = '{id}'");
            }

            return _mapper.Map<ResponseProductDTO>(product);
        }

        public async Task<ResponseProductDTO> GetOneByCode(string value)
        {
            var code = await _codeRepository.GetByValueAsync(value);

            if (code == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un codigo con el valor = '{value}'");
            }

            return _mapper.Map<ResponseProductDTO>(code.Product);
        }

        public async Task<ResponseProductDTO> CreateOne(CreateProductDTO createProductDTO)
        {
            var exists = await _productRepository
                .Query()
                .AnyAsync(p => p.Name == createProductDTO.Name);

            if (exists)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Ya existe un producto con ese nombre"
                );
            }

            if (string.IsNullOrWhiteSpace(createProductDTO.Name) ||
                createProductDTO.Name.Length > 100)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El nombre no puede ser nulo o tener mas de 100 carácteres");
            }

            if (createProductDTO.ShortName != null)
            {
                if (string.IsNullOrWhiteSpace(createProductDTO.ShortName))
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "El nombre corto no puede estar vacío");
                }

                if (createProductDTO.ShortName.Length > 32)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "El nombre corto no puede tener más de 32 caracteres");
                }
            }

            if (createProductDTO.Price <= 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El precio no puede ser menor o igual a cero");
            }

            if (createProductDTO.Price > 9999999)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El precio es demasiado grande");
            }

                if (createProductDTO.Stock <= 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El stock no puede ser menor o igual a cero");
            }

            if (createProductDTO.Stock > 999999)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El stock es demasiado grande");
            }

                if (!Enum.IsDefined(createProductDTO.Type))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Tipo de producto inválido");
            }

            if (createProductDTO.Codes == null || !createProductDTO.Codes.Any())
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El producto debe tener al menos un código");
            }

            if (createProductDTO.Codes.Any(c => string.IsNullOrWhiteSpace(c.Value)))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Todos los códigos deben tener valor");
            }

            if (createProductDTO.Codes
                .GroupBy(c => c.Value.Trim().ToLower())
                .Any(g => g.Count() > 1))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No puede haber códigos duplicados");
            }

            var values = createProductDTO.Codes.Select(c => c.Value).ToList();

            var existingCodes = await _codeRepository.Query()
                .Where(c => values.Contains(c.Value))
                .Select(c => c.Value)
                .ToListAsync();

            if (existingCodes.Any())
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    $"Ya existen los códigos: {string.Join(", ", existingCodes)}"
                );
            }

            var invalidCode = createProductDTO.Codes.FirstOrDefault(c => !Enum.IsDefined(c.Type));

            if (invalidCode != null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    $"Tipo inválido para el código '{invalidCode.Value}'");
            }

            // Validación imagen opcional
            if (createProductDTO.ImageUrl != null &&
                createProductDTO.ImageUrl.Length > 500)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "La imagen no es válida");
            }

            var product = new Product
            {
                Name = createProductDTO.Name.Trim(),
                ShortName = string.IsNullOrWhiteSpace(createProductDTO.ShortName)
                    ? null
                    : createProductDTO.ShortName.Trim(),
                Price = createProductDTO.Price,
                Stock = createProductDTO.Stock,
                Type = createProductDTO.Type,
                ImageUrl = string.IsNullOrWhiteSpace(createProductDTO.ImageUrl)
                    ? null
                    : createProductDTO.ImageUrl.Trim(),

                Codes = createProductDTO.Codes.Select(c => new Code
                {
                    Value = c.Value.Trim(),
                    Type = c.Type
                }).ToList()
            };

            await _productRepository.CreateOneAsync(product);

            return _mapper.Map<ResponseProductDTO>(product);
        }

        public async Task DeleteOne(int id)
        {
            var product = await _productRepository.GetOneAsync(p => p.Id == id);

            if (product == null)
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un producto con el Id = '{id}'");

            Console.WriteLine($"ImageUrl del producto: '{product.ImageUrl}'");

            if (!string.IsNullOrWhiteSpace(product.ImageUrl))
                await _storageService.DeleteImageAsync(product.ImageUrl);

            await _productRepository.DeleteOneAsync(product);
        }

        public async Task<ResponseProductDTO> UpdateOne(
            int id,
            UpdateProductDTO updateProductDTO)
        {
            var product = await _productRepository.GetOneAsync(
                p => p.Id == id,
                p => p.Codes);

            if (product == null)
            {
                throw new HttpResponseError(
                    HttpStatusCode.NotFound,
                    $"No se encontró un producto con el Id = '{id}'");
            }

            // Nombre
            if (updateProductDTO.Name != null)
            {
                if (string.IsNullOrWhiteSpace(updateProductDTO.Name))
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "El nombre no puede estar vacío");
                }

                if (updateProductDTO.Name.Length > 100)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "El nombre no puede tener más de 100 carácteres");
                }

                var exists = await _productRepository
                    .Query()
                    .AnyAsync(p =>
                        p.Id != id &&
                        p.Name.ToLower() == updateProductDTO.Name.Trim().ToLower());

                if (exists)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "Ya existe un producto con ese nombre");
                }
            }

            // ShortName
            if (updateProductDTO.ShortName != null)
            {
                if (string.IsNullOrWhiteSpace(updateProductDTO.ShortName))
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "El nombre corto no puede estar vacío");
                }

                if (updateProductDTO.ShortName.Length > 32)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "El nombre corto no puede tener más de 32 caracteres");
                }
            }

            // Precio
            if (updateProductDTO.Price != null &&
                updateProductDTO.Price <= 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El precio no puede ser menor o igual a cero");
            }

            // Stock
            if (updateProductDTO.Stock != null &&
                updateProductDTO.Stock <= 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El stock no puede ser menor o igual a cero");
            }

            // Tipo producto
            if (updateProductDTO.Type != null &&
                !Enum.IsDefined(updateProductDTO.Type.Value))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Tipo de producto inválido");
            }

            // Imagen
            if (updateProductDTO.ImageUrl != null)
            {
                if (updateProductDTO.ImageUrl.Length > 500)
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "La imagen no es válida");
                }

                var oldUrl = product.ImageUrl;

                product.ImageUrl = string.IsNullOrWhiteSpace(updateProductDTO.ImageUrl)
                    ? null
                    : updateProductDTO.ImageUrl.Trim();

                if (!string.IsNullOrWhiteSpace(oldUrl) &&
                    oldUrl != product.ImageUrl)
                {
                    await _storageService.DeleteImageAsync(oldUrl);
                }
            }

            // Códigos
            if (updateProductDTO.Codes != null)
            {
                ValidateCodes(updateProductDTO.Codes, product);

                // largo máximo
                if (updateProductDTO.Codes.Any(c => c.Value.Trim().Length > 100))
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        "Los códigos no pueden tener más de 100 carácteres");
                }

                // verificar duplicados en base de datos
                var incomingValues = updateProductDTO.Codes
                    .Select(c => c.Value.Trim())
                    .ToList();

                var currentIds = product.Codes
                    .Select(c => c.Id)
                    .ToHashSet();

                var existingCodes = await _codeRepository.Query()
                    .Where(c =>
                        incomingValues.Contains(c.Value) &&
                        !currentIds.Contains(c.Id))
                    .Select(c => c.Value)
                    .ToListAsync();

                if (existingCodes.Any())
                {
                    throw new HttpResponseError(
                        HttpStatusCode.BadRequest,
                        $"Ya existen los códigos: {string.Join(", ", existingCodes)}");
                }

                SyncCodes(updateProductDTO.Codes, product);
            }

            _mapper.Map(updateProductDTO, product);

            if (updateProductDTO.Name != null)
                product.Name = updateProductDTO.Name.Trim();

            if (updateProductDTO.ShortName != null)
                product.ShortName = string.IsNullOrWhiteSpace(updateProductDTO.ShortName)
                    ? null
                    : updateProductDTO.ShortName.Trim();

            await _productRepository.UpdateOneAsync(product);

            return _mapper.Map<ResponseProductDTO>(product);
        }

        private void ValidateCodes(List<UpdateCodeDTO> codes, Product product)
        {
            if (codes.Count == 0)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "El producto debe tener al menos un código");
            }

            if (codes.Any(c => string.IsNullOrWhiteSpace(c.Value)))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Los códigos no pueden estar vacíos");
            }

            var duplicatedValues = codes
                .GroupBy(c => c.Value.Trim().ToLower())
                .Any(g => g.Count() > 1);

            if (duplicatedValues)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "No puede haber códigos duplicados");
            }

            var duplicatedIds = codes
                .Where(c => c.Id.HasValue)
                .GroupBy(c => c.Id!.Value)
                .Any(g => g.Count() > 1);

            if (duplicatedIds)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Hay IDs de códigos repetidos");
            }

            var existingIds = product.Codes
                .Select(c => c.Id)
                .ToHashSet();

            var invalidIds = codes
                .Where(c => c.Id.HasValue)
                .Any(c => !existingIds.Contains(c.Id!.Value));

            if (invalidIds)
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Uno o más códigos no pertenecen al producto");
            }

            if (codes.Any(c => !Enum.IsDefined(c.Type)))
            {
                throw new HttpResponseError(
                    HttpStatusCode.BadRequest,
                    "Tipo de código inválido");
            }
        }

        private void SyncCodes(List<UpdateCodeDTO> codes, Product product)
        {
            var existingCodes = product.Codes.ToList();

            var incomingIds = codes
                .Where(c => c.Id.HasValue)
                .Select(c => c.Id!.Value)
                .ToHashSet();

            var toRemove = existingCodes
                .Where(c => !incomingIds.Contains(c.Id))
                .ToList();

            foreach (var code in toRemove)
                product.Codes.Remove(code);

            foreach (var codeDto in codes)
            {
                if (!codeDto.Id.HasValue)
                {
                    product.Codes.Add(new Code
                    {
                        Value = codeDto.Value.Trim(),
                        Type = codeDto.Type
                    });

                    continue;
                }

                var existing = existingCodes
                    .First(c => c.Id == codeDto.Id.Value);

                existing.Value = codeDto.Value.Trim();
                existing.Type = codeDto.Type;
            }
        }
    }
}