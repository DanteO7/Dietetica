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
    public class UpdateTestShould
    {
        private readonly Mock<IProductRepository> _productRepositoryMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ICodeRepository> _codeRepositoryMock;
        private readonly ProductServices _productServices;

        public UpdateTestShould()
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
        // =====================================================
        // UPDATE PRODUCT
        // =====================================================

        // Update exitoso

        [Fact]
        public async Task UpdateOne_WhenDataIsValid()
        {
            // Arrange
            var dto = new UpdateProductDTO
            {
                Name = "Arroz Largo Fino",
                Price = 2200,
                Stock = 50,
                Type = ProductType.Unit
            };

            var product = MockExistingProduct();

            _productRepositoryMock
                .Setup(r => r.UpdateOneAsync(It.IsAny<Product>()))
                .Returns(Task.CompletedTask);

            _mapperMock
                .Setup(m => m.Map<ResponseProductDTO>(It.IsAny<Product>()))
                .Returns(new ResponseProductDTO
                {
                    Name = dto.Name,
                    Price = dto.Price.Value,
                    Stock = dto.Stock.Value,
                    Type = dto.Type.Value
                });

            // Act
            var result = await _productServices.UpdateOne(1, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Arroz Largo Fino", result.Name);
            Assert.Equal(2200, result.Price);
            Assert.Equal(50, result.Stock);
            Assert.Equal(ProductType.Unit, result.Type);

            _productRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Product>()),
                Times.Once
            );
        }

        // Producto no existe

        [Fact]
        public async Task ThrowError_WhenProductDoesNotExist()
        {
            // Arrange
            var dto = new UpdateProductDTO();

            _productRepositoryMock
                .Setup(r => r.GetOneAsync(
                    It.IsAny<Expression<Func<Product, bool>>>(),
                    It.IsAny<Expression<Func<Product, object>>[]>()))
                .ReturnsAsync((Product?)null);

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _productServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, ex.StatusCode);
            Assert.Equal("No se encontró un producto con el Id = '1'", ex.Message);

            _productRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // Validaciones de Nombre

        [Theory]
        [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "El nombre no puede tener mas de 100 carácteres")]
        public async Task ThrowError_WhenNameIsInvalid(string name, string expected)
        {
            // Arrange
            var dto = new UpdateProductDTO
            {
                Name = name
            };

            MockExistingProduct();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _productServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _productRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // Validaciones de Precio

        [Theory]
        [InlineData(0, "El precio no puede ser menor o igual a cero")]
        [InlineData(-10, "El precio no puede ser menor o igual a cero")]
        public async Task ThrowError_WhenPriceIsInvalid(decimal price, string expected)
        {
            // Arrange
            var dto = new UpdateProductDTO
            {
                Price = price
            };

            MockExistingProduct();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _productServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _productRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // Validaciones de Stock

        [Theory]
        [InlineData(0, "El stock no puede ser menor o igual a cero")]
        [InlineData(-5, "El stock no puede ser menor o igual a cero")]
        public async Task ThrowError_WhenStockIsInvalid(decimal stock, string expected)
        {
            // Arrange
            var dto = new UpdateProductDTO
            {
                Stock = stock
            };

            MockExistingProduct();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _productServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal(expected, ex.Message);

            _productRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // Validaciones de Tipo

        [Fact]
        public async Task ThrowError_WhenTypeIsInvalid()
        {
            // Arrange
            var dto = new UpdateProductDTO
            {
                Type = (ProductType)999
            };

            MockExistingProduct();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _productServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("Tipo de producto inválido", ex.Message);

            _productRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }


        // =====================================================
        // Validaciones de Codes
        // =====================================================

        // Codes vacío

        [Fact]
        public async Task ThrowError_WhenCodesIsEmpty()
        {
            // Arrange
            var dto = new UpdateProductDTO
            {
                Codes = new List<UpdateCodeDTO>()
            };

            MockExistingProduct();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _productServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("El producto debe tener al menos un código", ex.Message);

            _productRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // Code value vacío o espacios

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public async Task ThrowError_WhenAnyCodeValueIsEmpty(string value)
        {
            // Arrange
            var dto = new UpdateProductDTO
            {
                Codes = new List<UpdateCodeDTO>
            {
                new UpdateCodeDTO
                {
                    Value = value,
                    Type = CodeType.Barcode
                }
            }
            };

            MockExistingProduct();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _productServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("Los códigos no pueden estar vacíos", ex.Message);

            _productRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // Codes duplicados por value

        [Fact]
        public async Task ThrowError_WhenCodesAreDuplicated()
        {
            // Arrange
            var dto = new UpdateProductDTO
            {
                Codes = new List<UpdateCodeDTO>
            {
                new UpdateCodeDTO
                {
                    Value = "123",
                    Type = CodeType.Barcode
                },
                new UpdateCodeDTO
                {
                    Value = "123",
                    Type = CodeType.Auxiliary
                }
            }
            };

            MockExistingProduct();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _productServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("No puede haber códigos duplicados", ex.Message);

            _productRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // IDs repetidos

        [Fact]
        public async Task ThrowError_WhenIdsAreDuplicated()
        {
            // Arrange
            var dto = new UpdateProductDTO
            {
                Codes = new List<UpdateCodeDTO>
            {
                new UpdateCodeDTO
                {
                    Id = 1,
                    Value = "111",
                    Type = CodeType.Barcode
                },
                new UpdateCodeDTO
                {
                    Id = 1,
                    Value = "222",
                    Type = CodeType.Auxiliary
                }
            }
            };

            MockExistingProductWithCodes();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _productServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("Hay IDs de códigos repetidos", ex.Message);

            _productRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // ID inexistente

        [Fact]
        public async Task ThrowError_WhenCodeIdDoesNotBelongToProduct()
        {
            // Arrange
            var dto = new UpdateProductDTO
            {
                Codes = new List<UpdateCodeDTO>
            {
                new UpdateCodeDTO
                {
                    Id = 99,
                    Value = "123",
                    Type = CodeType.Barcode
                }
            }
            };

            MockExistingProductWithCodes();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _productServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("Uno o más códigos no pertenecen al producto", ex.Message);

            _productRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // Tipo inválido

        [Fact]
        public async Task ThrowError_WhenCodeTypeIsInvalid()
        {
            // Arrange
            var dto = new UpdateProductDTO
            {
                Codes = new List<UpdateCodeDTO>
            {
                new UpdateCodeDTO
                {
                    Value = "123",
                    Type = (CodeType)999
                }
            }
            };

            MockExistingProduct();

            // Act
            var ex = await Assert.ThrowsAsync<HttpResponseError>(() =>
                _productServices.UpdateOne(1, dto));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, ex.StatusCode);
            Assert.Equal("Tipo de código inválido", ex.Message);

            _productRepositoryMock.Verify(
                r => r.UpdateOneAsync(It.IsAny<Product>()),
                Times.Never
            );
        }

        // Helpers

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

        private Product MockExistingProductWithCodes()
        {
            var product = new Product
            {
                Id = 1,
                Name = "Arroz",
                Price = 1500,
                Stock = 20,
                Type = ProductType.Unit,
                Codes = new List<Code>
            {
                new Code
                {
                    Id = 1,
                    Value = "111",
                    Type = CodeType.Barcode,
                    ProductId = 1
                },
                new Code
                {
                    Id = 2,
                    Value = "222",
                    Type = CodeType.Auxiliary,
                    ProductId = 1
                }
            }
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