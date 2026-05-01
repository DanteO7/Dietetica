using backend_proyecto.Utils.Errors;
using Dietetica.Models.DTO;
using Dietetica.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dietetica.Controllers
{
    [Route("api/upload")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly StorageService _storageService;

        public UploadController(StorageService storageService)
        {
            _storageService = storageService;
        }

        [HttpPost("image")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseImageDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseImageDTO>> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Archivo inválido");

            var allowed = new[] { "image/png", "image/jpeg", "image/webp" };
            if (!allowed.Contains(file.ContentType))
                return BadRequest("Formato inválido");

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest("Máximo 5MB");

            try
            {
                var url = await _storageService.UploadImageAsync(file);
                return Ok(new ResponseImageDTO { Url = url });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}