using AutoMapper;
using backend_proyecto.Services;
using backend_proyecto.Utils.Errors;
using Dietetica.Models;
using Dietetica.Models.DTO;
using Dietetica.Repositories;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Net;
using System.Security.Claims;

namespace Dietetica.Services
{
    public class AuthServices
    {
        private readonly IUserRepository _userRepository;
        private readonly IEncoderServices _encoderServices;
        private readonly IMapper _mapper;

        public AuthServices(
            IUserRepository userRepository,
            IEncoderServices encoderServices,
            IMapper mapper)
        {
            _userRepository = userRepository;
            _encoderServices = encoderServices;
            _mapper = mapper;
        }

        public async Task<ResponseUserDTO> Register(CreateUserDTO dto, HttpContext context)
        {
            var existingUser = await _userRepository.GetByUsernameAsync(dto.Username);

            if (existingUser != null)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El usuario '{dto.Username}' ya existe.");
            }

            var user = _mapper.Map<User>(dto);

            user.Password = _encoderServices.Encode(dto.Password);

            await _userRepository.CreateOneAsync(user);

            await SignIn(user, context);

            return _mapper.Map<ResponseUserDTO>(user);
        }

        public async Task<ResponseUserDTO> Login(LoginDTO dto, HttpContext context)
        {
            var user = await _userRepository.GetByUsernameAsync(dto.Username);

            if (user == null || !_encoderServices.Verify(dto.Password, user.Password))
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, "Invalid credentials.");
            }

            await SignIn(user, context);

            return _mapper.Map<ResponseUserDTO>(user);
        }

        public async Task Logout(HttpContext context)
        {
            await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        }

        private async Task SignIn(User user, HttpContext context)
        {
            var claims = new List<Claim>
            {
                new Claim("id", user.Id.ToString()),
                new Claim("username", user.Username)
            };

            var identity = new ClaimsIdentity(
                claims,
                CookieAuthenticationDefaults.AuthenticationScheme
            );

            var principal = new ClaimsPrincipal(identity);

            await context.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTime.UtcNow.AddDays(1)
                }
            );
        }

        public async Task<ResponseUserDTO> Me(HttpContext context)
        {
            if (context.User.Identity == null || !context.User.Identity.IsAuthenticated)
            {
                throw new HttpResponseError(HttpStatusCode.Unauthorized, "No autenticado.");
            }

            var idClaim = context.User.FindFirst("id")?.Value;

            if (string.IsNullOrEmpty(idClaim))
            {
                throw new HttpResponseError(HttpStatusCode.Unauthorized, "Sesión inválida.");
            }

            int userId = int.Parse(idClaim);

            var user = await _userRepository.GetOneAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, "Usuario no encontrado.");
            }

            return _mapper.Map<ResponseUserDTO>(user);
        }
    }
}