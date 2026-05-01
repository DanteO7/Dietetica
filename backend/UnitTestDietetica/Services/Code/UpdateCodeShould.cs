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
    public class UpdateCodeTestsShould
    {
        private readonly Mock<ICodeRepository> _codeRepositoryMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IProductRepository> _productRepositoryMock;
        private readonly CodeServices _codeServices;

        public UpdateCodeTestsShould()
        {
            _codeRepositoryMock = new Mock<ICodeRepository>();
            _mapperMock = new Mock<IMapper>();
            _productRepositoryMock = new Mock<IProductRepository>();

            _codeServices = new CodeServices(
                _codeRepositoryMock.Object,
                _mapperMock.Object,
                _productRepositoryMock.Object
            );
        }

        // =====================================================
        // UPDATE CODE
        // =====================================================

        // Update exitoso

        [Fact]
        public async Task UpdateOne_WhenDataIsValid()
        {
            // Arrange
            var dto = new UpdateCodeIndividualDTO
            {
                Value = "7799999999999",
                Type = CodeType.Auxiliary
            };

            var code = MockExistingCode();

            _codeRepositoryMock
                .Setup(r => r.UpdateOneAsync(It.IsAny<Code>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseCodeDTO>(It.IsAny<Code>()))
                .Returns(new ResponseCodeDTO
                {
                    Id = 1,
                    Value = dto.Value,
                    Type = dto.Type.Value
                });

            // Act
            var result = await _codeServices.UpdateOne(1, dto);

            // Assert
            //Assert.NotNull(result);
            //Assert.Equal("7799999999999", result.Value);
            //Assert.Equal(CodeType.Auxiliary, result.Type);

            _codeRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Code>()),
                Times.Once
            );
        }

        // Código no existe

        [Fact]
        public async Task ThrowError_WhenCodeDoesNotExist()
        {
            // Arrange
            var dto = new UpdateCodeIndividualDTO();

            _codeRepositoryMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<Expression<Func<Code, bool>>>()))
                .ReturnsAsync((Code?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _codeServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un código con el Id = '1'", ex.Message);

            _codeRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Code>()),
                Times.Never
            );
        }

        // Validación de Value

        [Theory]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "El valor del código no puede ser mayor a 100 carácteres")]
        public async Task ThrowError_WhenValueIsInvalid(string value, string expected)
        {
            // Arrange
            var dto = new UpdateCodeIndividualDTO
            {
                Value = value
            };

            MockExistingCode();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _codeServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _codeRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Code>()),
                Times.Never
            );
        }

        // Validación de Type

        [Fact]
        public async Task ThrowError_WhenTypeIsInvalid()
        {
            // Arrange
            var dto = new UpdateCodeIndividualDTO
            {
                Type = (CodeType)999
            };

            MockExistingCode();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _codeServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("Tipo de código inválido", ex.Message);

            _codeRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Code>()),
                Times.Never
            );
        }

        // =====================================================
        // HELPER
        // =====================================================

        private Code MockExistingCode()
        {
            var code = new Code
            {
                Id = 1,
                Value = "7791234567890",
                Type = CodeType.Barcode,
                ProductId = 1
            };

            _codeRepositoryMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<Expression<Func<Code, bool>>>()))
                .ReturnsAsync(code);

            return code;
        }
    }
}