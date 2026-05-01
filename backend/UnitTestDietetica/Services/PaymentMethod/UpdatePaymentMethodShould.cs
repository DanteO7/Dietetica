using AutoMapper;
using backend_proyecto.Utils.Errors;
using Dietetica.Models;
using Dietetica.Models.DTO;
using Dietetica.Repositories;
using Dietetica.Services;
using Moq;
using System.Linq.Expressions;
using System.Net;

namespace UnitTestDietetica
{
    public class UpdatePaymentMethodShould
    {
        private readonly Mock<IPaymentMethodRepository> _paymentMethodRepositoryMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly PaymentMethodServices _paymentMethodServices;

        public UpdatePaymentMethodShould()
        {
            _paymentMethodRepositoryMock = new Mock<IPaymentMethodRepository>();
            _mapperMock = new Mock<IMapper>();

            _paymentMethodServices = new PaymentMethodServices(
                _paymentMethodRepositoryMock.Object,
                _mapperMock.Object
            );
        }

        // =====================================================
        // UPDATE PAYMENT METHOD
        // =====================================================

        // Caso exitoso

        [Fact]
        public async Task UpdateOne_WhenDataIsValid()
        {
            // Arrange
            var dto = new UpdatePaymentMethodDTO
            {
                Name = "Transferencia"
            };

            var method = MockExistingMethod();

            _paymentMethodRepositoryMock
                .Setup(r => r.UpdateOneAsync(It.IsAny<PaymentMethod>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponsePaymentMethodDTO>(It.IsAny<PaymentMethod>()))
                .Returns(new ResponsePaymentMethodDTO
                {
                    Id = method.Id,
                    Name = dto.Name
                });

            // Act
            var result = await _paymentMethodServices.UpdateOne(1, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Transferencia", result.Name);

            _paymentMethodRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<PaymentMethod>()),
                Times.Once
            );
        }

        // Método no existe

        [Fact]
        public async Task ThrowError_WhenMethodDoesNotExist()
        {
            // Arrange
            var dto = new UpdatePaymentMethodDTO();

            _paymentMethodRepositoryMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<Expression<Func<PaymentMethod, bool>>>()))
                .ReturnsAsync((PaymentMethod?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentMethodServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal(
                "No se encontró un método de pago con el Id = '1'",
                ex.Message
            );

            _paymentMethodRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<PaymentMethod>()),
                Times.Never
            );
        }

        // Validación de Name

        [Theory]
        [InlineData(
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "El nombre no puede tener más de 50 carácteres"
        )]
        public async Task ThrowError_WhenNameIsInvalid(
            string name,
            string expected)
        {
            // Arrange
            var dto = new UpdatePaymentMethodDTO
            {
                Name = name
            };

            MockExistingMethod();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentMethodServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _paymentMethodRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<PaymentMethod>()),
                Times.Never
            );
        }

        // =====================================================
        // HELPER
        // =====================================================

        private PaymentMethod MockExistingMethod()
        {
            var method = new PaymentMethod
            {
                Id = 1,
                Name = "Efectivo"
            };

            _paymentMethodRepositoryMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<Expression<Func<PaymentMethod, bool>>>()))
                .ReturnsAsync(method);

            return method;
        }
    }
}