using AutoMapper;
using backend_proyecto.Utils.Errors;
using Dietetica.Models;
using Dietetica.Models.DTO;
using Dietetica.Repositories;
using Dietetica.Services;
using Moq;
using System.Net;

namespace UnitTestDietetica
{
    public class CreatePaymentMethodShould
    {
        private readonly Mock<IPaymentMethodRepository> _paymentMethodRepositoryMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly PaymentMethodServices _paymentMethodServices;

        public CreatePaymentMethodShould()
        {
            _paymentMethodRepositoryMock = new Mock<IPaymentMethodRepository>();
            _mapperMock = new Mock<IMapper>();

            _paymentMethodServices = new PaymentMethodServices(
                _paymentMethodRepositoryMock.Object,
                _mapperMock.Object
            );
        }

        // =====================================================
        // CREATE PAYMENT METHOD
        // =====================================================

        // DTO válido

        private CreatePaymentMethodDTO ValidDto()
        {
            return new CreatePaymentMethodDTO
            {
                Name = "Efectivo"
            };
        }

        // Caso exitoso

        [Fact]
        public async Task CreateOne_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();

            _mapperMock
                .Setup(m => m.Map<PaymentMethod>(It.IsAny<CreatePaymentMethodDTO>()))
                .Returns(new PaymentMethod
                {
                    Name = dto.Name
                });

            _paymentMethodRepositoryMock
                .Setup(r => r.CreateOneAsync(It.IsAny<PaymentMethod>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponsePaymentMethodDTO>(It.IsAny<PaymentMethod>()))
                .Returns(new ResponsePaymentMethodDTO
                {
                    Name = dto.Name
                });

            // Act
            var result = await _paymentMethodServices.CreateOne(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Efectivo", result.Name);

            _paymentMethodRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<PaymentMethod>()),
                Times.Once
            );

            _mapperMock.Verify(
                m => m.Map<PaymentMethod>(It.IsAny<CreatePaymentMethodDTO>()),
                Times.Once
            );

            _mapperMock.Verify(
                m => m.Map<ResponsePaymentMethodDTO>(It.IsAny<PaymentMethod>()),
                Times.Once
            );
        }

        // Validaciones de Name

        [Theory]
        [InlineData(null, "El nombre no puede ser nulo o tener más de 50 carácteres")]
        [InlineData("", "El nombre no puede ser nulo o tener más de 50 carácteres")]
        [InlineData("   ", "El nombre no puede ser nulo o tener más de 50 carácteres")]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "El nombre no puede ser nulo o tener más de 50 carácteres")]
        public async Task ThrowError_WhenNameIsInvalid(string? name, string expected)
        {
            // Arrange
            var dto = ValidDto();
            dto.Name = name!;

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _paymentMethodServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _paymentMethodRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<PaymentMethod>()),
                Times.Never
            );
        }
    }
}