using AutoMapper;
using backend_proyecto.Utils.Errors;
using Dietetica.Enums;
using Dietetica.Models;
using Dietetica.Models.DTO;
using Dietetica.Repositories;
using Dietetica.Services;
using Moq;
using System.Linq.Expressions;
using System.Net;

namespace UnitTestDietetica
{
    public class CreateCodeShould
    {
        private readonly Mock<ICodeRepository> _codeRepositoryMock;
        private readonly Mock<IProductRepository> _productRepositoryMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly CodeServices _codeServices;

        public CreateCodeShould()
        {
            _codeRepositoryMock = new Mock<ICodeRepository>();
            _productRepositoryMock = new Mock<IProductRepository>();
            _mapperMock = new Mock<IMapper>();

            _codeServices = new CodeServices(
                _codeRepositoryMock.Object,
                _mapperMock.Object,
                _productRepositoryMock.Object
            );
        }

        // =====================
        // CREATE CODE
        // =====================

        private CreateCodeDTO ValidDto()
        {
            return new CreateCodeDTO
            {
                Value = "7791234567890",
                Type = CodeType.Barcode
            };
        }

        // Caso exitoso

        [Fact]
        public async Task CreateCode_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();

            MockExistingProduct();

            _mapperMock
                .Setup(m => m.Map<Code>(It.IsAny<CreateCodeDTO>()))
                .Returns(new Code
                {
                    Value = dto.Value,
                    Type = dto.Type,
                    ProductId = 1
                });

            _codeRepositoryMock
                .Setup(r => r.CreateOneAsync(It.IsAny<Code>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseCodeDTO>(It.IsAny<Code>()))
                .Returns(new ResponseCodeDTO
                {
                    Value = dto.Value,
                    Type = dto.Type
                });

            // Act
            var result = await _codeServices.CreateOne(1, dto);

            // Assert
            //Assert.NotNull(result);
            //Assert.Equal("7791234567890", result.Value);
            //Assert.Equal(CodeType.Barcode, result.Type);

            _codeRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Code>()),
                Times.Once
            );
        }

        // Producto no existe

        [Fact]
        public async Task ThrowError_WhenProductDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _productRepositoryMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<Expression<Func<Product, bool>>>(),
                    It.IsAny<Expression<Func<Product, object>>[]>()))
                .ReturnsAsync((Product?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _codeServices.CreateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un producto con el Id = '1'", ex.Message);

            _codeRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Code>()),
                Times.Never
            );
        }

        // Validaciones de Value

        [Theory]
        [InlineData(null, "El valor del código no puede ser nulo o tener más de 100 carácteres")]
        [InlineData("", "El valor del código no puede ser nulo o tener más de 100 carácteres")]
        [InlineData("   ", "El valor del código no puede ser nulo o tener más de 100 carácteres")]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "El valor del código no puede ser nulo o tener más de 100 carácteres")]
        public async Task ThrowError_WhenValueIsInvalid(string? value, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.Value = value!;

            MockExistingProduct();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _codeServices.CreateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _codeRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Code>()),
                Times.Never
            );
        }

        // Tipo inválido

        [Fact]
        public async Task ThrowError_WhenTypeIsInvalid()
        {
            // Arrange
            var dto = ValidDto();
            dto.Type = (CodeType)999;

            MockExistingProduct();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _codeServices.CreateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("Tipo de código inválido", ex.Message);

            _codeRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Code>()),
                Times.Never
            );
        }

        // Helper

        private Product MockExistingProduct()
        {
            var product = new Product
            {
                Id = 1,
                Name = "Arroz",
                Price = 1500,
                Stock = 20,
                Type = ProductType.Unit,
                Codes = new List<Code>()
            };

            _productRepositoryMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<Expression<Func<Product, bool>>>(),
                    It.IsAny<Expression<Func<Product, object>>[]>()))
                .ReturnsAsync(product);

            return product;
        }
    }
}