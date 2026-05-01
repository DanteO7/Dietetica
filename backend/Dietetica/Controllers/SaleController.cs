using backend_proyecto.Utils.Errors;
using Dietetica.Models.DTO;
using Dietetica.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Dietetica.Controllers
{
    [Route("api/sales")]
    [ApiController]
    public class SaleController : ControllerBase
    {
        private readonly SaleServices _saleServices;
        public SaleController(SaleServices saleServices)
        {
            _saleServices = saleServices;
        }

        [HttpGet]
        [Authorize]
        [ProducesResponseType(typeof(PagedResponse<ResponseSaleDetailDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PagedResponse<ResponseSaleDetailDTO>>> GetAll(
            [FromQuery] DateTime? date, 
            [FromQuery] int? paymentMethodId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            try
            {
                page = page <= 0 ? 1 : page;
                pageSize = pageSize <= 0 ? 10 : pageSize;
                pageSize = pageSize > 50 ? 50 : pageSize;

                var sales = await _saleServices.GetAll(date, paymentMethodId, page, pageSize);
                return Ok(sales);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseSaleDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseSaleDTO>> GetOneById(int id)
        {
            try
            {
                var sale = await _saleServices.GetOneById(id);
                return Ok(sale);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Authorize]
        [ProducesResponseType(typeof(ResponseSaleDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseSaleDTO>> CreateOne([FromBody] CreateSaleDTO createSaleDTO)
        {
            try
            {
                var sale = await _saleServices.CreateOne(createSaleDTO);
                return Created("Sale Created", sale);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
            }
        }

        [HttpPatch("{id}/{methodId}")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseSaleDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseSaleDTO>> ChangePaymentMethod(int id, int methodId)
        {
            try
            {
                var sale = await _saleServices.ChangeMethod(id, methodId);
                return Ok(sale);
            }
            catch (HttpResponseError ex)
            {
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }
    }
}
