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
    public class ChangeMethodShould
    {
        private readonly Mock<ISaleRepository> _saleRepositoryMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IPaymentMethodRepository> _paymentMethodRepositoryMock;
        private readonly Mock<IProductRepository> _productRepositoryMock;

        private readonly SaleServices _saleServices;

        public ChangeMethodShould()
        {
            _saleRepositoryMock = new Mock<ISaleRepository>();
            _mapperMock = new Mock<IMapper>();
            _paymentMethodRepositoryMock = new Mock<IPaymentMethodRepository>();
            _productRepositoryMock = new Mock<IProductRepository>();

            _saleServices = new SaleServices(
                _saleRepositoryMock.Object,
                _mapperMock.Object,
                _paymentMethodRepositoryMock.Object,
                _productRepositoryMock.Object
            );
        }

        // =====================================================
        // CHANGE PAYMENT METHOD
        // =====================================================

        // Caso exitoso

        [Fact]
        public async Task ChangeMethod_WhenDataIsValid()
        {
            // Arrange
            var sale = MockExistingSale();
            MockExistingPaymentMethod();

            _saleRepositoryMock
                .Setup(r => r.UpdateOneAsync(It.IsAny<Sale>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseSaleDTO>(It.IsAny<Sale>()))
                .Returns(new ResponseSaleDTO
                {
                    Id = 1,
                    Total = 3000,
                    CreatedAt = DateTime.Now,
                    PaymentMethod = new ResponsePaymentMethodDTO
                    {
                        Id = 2,
                        Name = "Transferencia"
                    }
                });

            // Act
            var result = await _saleServices.ChangeMethod(1, 2);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Transferencia", result.PaymentMethod.Name);

            Assert.Equal(2, sale.PaymentMethodId);

            _saleRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Sale>()),
                Times.Once
            );
        }

        // Venta inexistente

        [Fact]
        public async Task ThrowError_WhenSaleDoesNotExist()
        {
            // Arrange
            _saleRepositoryMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<Sale, bool>>>()))
                .ReturnsAsync((Sale?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _saleServices.ChangeMethod(1, 2));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal(
                "No se encontró una venta con el Id = '1'",
                ex.Message
            );

            _saleRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Sale>()),
                Times.Never
            );
        }

        // Método inexistente

        [Fact]
        public async Task ThrowError_WhenPaymentMethodDoesNotExist()
        {
            // Arrange
            MockExistingSale();

            _paymentMethodRepositoryMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<PaymentMethod, bool>>>()))
                .ReturnsAsync((PaymentMethod?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _saleServices.ChangeMethod(1, 2));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal(
                "No se encontró un método de pago con el Id = '2'",
                ex.Message
            );

            _saleRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Sale>()),
                Times.Never
            );
        }

        // =====================================================
        // HELPERS
        // =====================================================

        private Sale MockExistingSale()
        {
            var sale = new Sale
            {
                Id = 1,
                Total = 3000,
                PaymentMethodId = 1,
                CreatedAt = DateTime.Now
            };

            _saleRepositoryMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<Sale, bool>>>()))
                .ReturnsAsync(sale);

            return sale;
        }

        private void MockExistingPaymentMethod()
        {
            _paymentMethodRepositoryMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<PaymentMethod, bool>>>()))
                .ReturnsAsync(new PaymentMethod
                {
                    Id = 2,
                    Name = "Transferencia"
                });
        }
    }
}