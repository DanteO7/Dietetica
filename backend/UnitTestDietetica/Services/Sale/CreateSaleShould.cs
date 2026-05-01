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
    public class CreateSaleShould
    {
        private readonly Mock<ISaleRepository> _saleRepositoryMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IPaymentMethodRepository> _paymentMethodRepositoryMock;
        private readonly Mock<IProductRepository> _productRepositoryMock;

        private readonly SaleServices _saleServices;

        public CreateSaleShould()
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
        // CREATE SALE
        // =====================================================

        private CreateSaleDTO ValidDto()
        {
            return new CreateSaleDTO
            {
                PaymentMethodId = 1,
                Items = new List<CreateSaleItemDTO>
                {
                    new CreateSaleItemDTO
                    {
                        ProductId = 1,
                        Quantity = 2
                    }
                }
            };
        }

        // Caso exitoso

        [Fact]
        public async Task CreateOne_WhenDataIsValid()
        {
            // Arrange
            var dto = ValidDto();

            MockExistingPaymentMethod();

            MockProducts(new List<Product>
            {
                new Product
                {
                    Id = 1,
                    Name = "Arroz",
                    Price = 1500,
                    Stock = 10
                }
            });

            _saleRepositoryMock
                .Setup(r => r.CreateOneAsync(It.IsAny<Sale>()))
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
                        Id = 1,
                        Name = "Efectivo"
                    }
                });

            // Act
            var result = await _saleServices.CreateOne(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal(3000, result.Total);
            Assert.Equal("Efectivo", result.PaymentMethod.Name);

            _saleRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Sale>()),
                Times.Once
            );
        }

        // Método inexistente

        [Fact]
        public async Task ThrowError_WhenPaymentMethodDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            _paymentMethodRepositoryMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<PaymentMethod, bool>>>()))
                .ReturnsAsync((PaymentMethod?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _saleServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal(
                "No se encontró un método de pago con el Id = '1'",
                ex.Message
            );

            _saleRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Sale>()),
                Times.Never
            );
        }

        // Items vacíos o nulos

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task ThrowError_WhenItemsAreNullOrEmpty(bool useNull)
        {
            // Arrange
            var dto = ValidDto();

            dto.Items = useNull
                ? null!
                : new List<CreateSaleItemDTO>();

            MockExistingPaymentMethod();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _saleServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(
                "La venta tiene que tener por lo menos un item",
                ex.Message
            );

            _saleRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Sale>()),
                Times.Never
            );
        }

        // Producto inexistente

        [Fact]
        public async Task ThrowError_WhenProductDoesNotExist()
        {
            // Arrange
            var dto = ValidDto();

            MockExistingPaymentMethod();

            _productRepositoryMock
                .Setup(r => r.GetByIdsAsync(It.IsAny<List<int>>()))
                .ReturnsAsync(new List<Product>());

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _saleServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(
                "No se encontró un producto con el id = '1'",
                ex.Message
            );

            _saleRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Sale>()),
                Times.Never
            );
        }

        // Stock insuficiente

        [Fact]
        public async Task ThrowError_WhenStockIsInsufficient()
        {
            // Arrange
            var dto = ValidDto();

            MockExistingPaymentMethod();

            MockProducts(new List<Product>
            {
                new Product
                {
                    Id = 1,
                    Name = "Arroz",
                    Price = 1500,
                    Stock = 1
                }
            });

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _saleServices.CreateOne(dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(
                "Stock insuficiente para Arroz",
                ex.Message
            );

            _saleRepositoryMock.Verify(
                r => r.CreateOneAsync(It.IsAny<Sale>()),
                Times.Never
            );
        }

        // =====================================================
        // HELPERS
        // =====================================================

        private void MockExistingPaymentMethod()
        {
            _paymentMethodRepositoryMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<PaymentMethod, bool>>>()))
                .ReturnsAsync(new PaymentMethod
                {
                    Id = 1,
                    Name = "Efectivo"
                });
        }

        private void MockProducts(List<Product> products)
        {
            _productRepositoryMock
                .Setup(r => r.GetByIdsAsync(It.IsAny<List<int>>()))
                .ReturnsAsync(products);
        }
    }
}