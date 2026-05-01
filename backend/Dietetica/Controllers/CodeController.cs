using backend_proyecto.Utils.Errors;
using Dietetica.Models.DTO;
using Dietetica.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Dietetica.Controllers
{
    [Route("api/codes")]
    [ApiController]
    public class CodeController : ControllerBase
    {
        private readonly CodeServices _codeServices;
        public CodeController(CodeServices codeServices)
        {
            _codeServices = codeServices;
        }

        [HttpPost("{productId}")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseCodeDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseCodeDTO>> CreateOne(int productId, [FromBody] CreateCodeDTO createCodeDTO)
        {
            try
            {
                var code = await _codeServices.CreateOne(productId, createCodeDTO);
                return Created("Code Created", code);
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

        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseProductDTO>> DeleteOne(int id)
        {
            try
            {
                var product = await _codeServices.DeleteOne(id);
                return Ok(product);
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

        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseCodeDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseCodeDTO>> UpdateOne(int id, [FromBody] UpdateCodeIndividualDTO updateCodeIndividualDTO)
        {
            try
            {
                var code = await _codeServices.UpdateOne(id, updateCodeIndividualDTO);
                return Ok(code);
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
