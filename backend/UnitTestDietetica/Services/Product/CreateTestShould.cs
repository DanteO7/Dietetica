using AutoMapper;
using backend_proyecto.Utils.Errors;
using Dietetica.Enums;
using Dietetica.Models;
using Dietetica.Models.DTO;
using Dietetica.Repositories;
using Dietetica.Services;
using Moq;
using System.Net;

namespace UnitTestDietetica
{
    public class CreateTestShould
    {
        private readonly Mock<IProductRepository> _productRepositoryMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ICodeRepository> _codeRepositoryMock;
        private readonly ProductServices _productServices;

        public CreateTestShould()
        {
            _productRepositoryMock = new Mock<IProductRepository>();
            _mapperMock = new Mock<IMapper>();
            _codeRepositoryMock = new Mock<ICodeRepository>();

            //_productServices = new ProductServices(
            //    _productRepositoryMock.Object,
            //    _mapperMock.Object,
            //    _codeRepositoryMock.Object
            //);
        }

        // ==============
        // CREATE PRODUCT
        // ==============

        // CreateDTO

        private CreateProductDTO ValidDto()
        {
            return new CreateProductDTO
            {
                Name = "Arroz",
                Price = 1500,
                Stock = 20,
                Type = ProductType.Unit,
                Codes = new List<CreateCodeDTO>
                {
                    new CreateCodeDTO
                    {
                        Value = "7791234567890",
                        Type = CodeType.Barcode
                    }
                }
            };
        }

        // Caso Exitoso

        [Fact]
        public async Task CreateProduct_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();

            _productRepositoryMock
                .Setup(r => r.CreateOneAsync(It.IsAny<Product>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseProductDTO>(It.IsAny<Product>()))
                .Returns(new ResponseProductDTO
                {
                    Name = dto.Name,
                    Price = dto.Price,
                    Stock = dto.Stock,
                    Type = dto.Type
                });

            // Act
            var result = await _productServices.CreateOne(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Arroz", result.Name);
            Assert.Equal(1500, result.Price);
            Assert.Equal(20, result.Stock);
            Assert.Equal(ProductType.Unit, result.Type);

            _productRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Product>()),
                Times.Once
            );

            _mapperMock.Verify(
                m => m.Map<ResponseProductDTO>(It.IsAny<Product>()),
                Times.Once
            );
        }

        // Validaciones de Nombre

        [Theory]
        [InlineData(null, "El nombre no puede ser nulo o tener mas de 100 carácteres")]
        [InlineData("", "El nombre no puede ser nulo o tener mas de 100 carácteres")]
        [InlineData("   ", "El nombre no puede ser nulo o tener mas de 100 carácteres")]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "El nombre no puede ser nulo o tener mas de 100 carácteres")]
        public async Task ThrowError_WhenNameIsNullOrEmpty(string? name, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.Name = name;

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() => _productServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _productRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // Validaciones de Precio

        [Theory]
        [InlineData(0, "El precio no puede ser menor o igual a cero")]
        [InlineData(-10, "El precio no puede ser menor o igual a cero")]
        [InlineData(null, "El precio no puede ser menor o igual a cero")]
        public async Task ThrowError_WhenPriceIsInvalid(decimal price, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.Price = price;

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _productServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _productRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // Validaciones de Stock

        [Theory]
        [InlineData(0, "El stock no puede ser menor o igual a cero")]
        [InlineData(-5, "El stock no puede ser menor o igual a cero")]
        [InlineData(null, "El stock no puede ser menor o igual a cero")]
        public async Task ThrowError_WhenStockIsInvalid(decimal stock, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.Stock = stock;

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() => _productServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _productRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // Validacion de Tipo

        [Fact]
        public async Task Throw_WhenTypeIsInvalid()
        {
            // Arrange
            var dto = ValidDto();
            dto.Type = (ProductType)999;
            string expected = "Tipo de producto inválido";

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() => _productServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _productRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // Validaciones de Código

        [Theory]
        [InlineData(true, "El producto debe tener al menos un código")]
        [InlineData(false, "El producto debe tener al menos un código")]
        public async Task ThrowError_WhenCodesAreNullOrEmpty(bool useNull, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.Codes = useNull
                ? null!
                : new List<CreateCodeDTO>();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() => _productServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _productRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        [Theory]
        [InlineData("", "Todos los códigos deben tener valor")]
        [InlineData(" ", "Todos los códigos deben tener valor")]
        [InlineData("   ", "Todos los códigos deben tener valor")]
        [InlineData(null, "Todos los códigos deben tener valor")]
        public async Task ThrowError_WhenAnyCodeValueIsInvalid(string? value, string expected)
        {
            // Arrange
            var dto = ValidDto();

            dto.Codes = new List<CreateCodeDTO>
            {
                new CreateCodeDTO
                {
                    Value = value!,
                    Type = CodeType.Barcode
                }
            };

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() => _productServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _productRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        [Theory]
        [InlineData("123", "123", "No puede haber códigos duplicados")]
        [InlineData("ABC", "ABC", "No puede haber códigos duplicados")]
        [InlineData("779111", "779111", "No puede haber códigos duplicados")]
        public async Task ThrowError_WhenCodesAreDuplicated(string code1, string code2, string expected)
        {
            // Arrange
            var dto = ValidDto();

            dto.Codes = new List<CreateCodeDTO>
            {
                new CreateCodeDTO
                {
                    Value = code1,
                    Type = CodeType.Barcode
                },
                new CreateCodeDTO
                {
                    Value = code2,
                    Type = CodeType.Barcode
                }
            };

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() => _productServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _productRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }
    }
}