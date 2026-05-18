using backend_proyecto.Utils.Errors;
using Dietetica.Models.DTO;
using Dietetica.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Dietetica.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthServices _authServices;
        public AuthController(AuthServices authServices)
        {
            _authServices = authServices;
        }

        //[HttpPost("register")]
        //[ProducesResponseType(typeof(ResponseUserDTO), StatusCodes.Status201Created)]
        //[ProducesResponseType(typeof(HttpMessage), StatusCodes.Status400BadRequest)]
        //[ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        //public async Task<ActionResult<ResponseUserDTO>> Register([FromBody] CreateUserDTO dto)
        //{
        //    try
        //    {
        //        var user = await _authServices.Register(dto, HttpContext);
        //        return StatusCode(StatusCodes.Status201Created, user);
        //    }
        //    catch (HttpResponseError ex)
        //    {
        //        return StatusCode((int)ex.StatusCode, ex.Message);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
        //    }
        //}

        [HttpPost("login")]
        [ProducesResponseType(typeof(ResponseUserDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseUserDTO>> Login([FromBody] LoginDTO loginDTO)
        {
            try
            {
                var user = await _authServices.Login(loginDTO, HttpContext);
                return Ok(user);
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

        [HttpPost("logout")]
        [Authorize]
        [ProducesResponseType(typeof(void), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(void), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(HttpMessage), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> Logout()
        {
            try
            {
                await _authServices.Logout(HttpContext);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet("health")]
        [Authorize]
        public bool Health()
        {
            return true;
        }

        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseUserDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<ResponseUserDTO>> Me()
        {
            try
            {
                var user = await _authServices.Me(HttpContext);
                return Ok(user);
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
