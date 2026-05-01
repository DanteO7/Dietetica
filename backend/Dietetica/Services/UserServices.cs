using AutoMapper;
using backend_proyecto.Utils.Errors;
using Dietetica.Models.DTO;
using Dietetica.Repositories;
using System.Net;

namespace Dietetica.Services
{
    public class UserServices
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        public UserServices(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }
        public async Task<List<ResponseUserDTO>> GetAll()
        {
            var users = await _userRepository.GetAllAsync();
            return _mapper.Map<List<ResponseUserDTO>>(users);
        }

        public async Task<ResponseUserDTO> UpdateOne(int id, UpdateUserDTO updateUserDTO)
        {
            var user = await _userRepository.GetOneAsync(u => u.Id == id);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }
            if (updateUserDTO.Name != null && updateUserDTO.Name.Length > 50)
            {
                throw new HttpResponseError(HttpStatusCode.BadRequest, $"El nombre del usuario no puede tener mas de 50 caracteres");
            }

            _mapper.Map(updateUserDTO, user);
            await _userRepository.UpdateOneAsync(user);

            return _mapper.Map<ResponseUserDTO>(user);
        }

        public async Task DeleteOne(int id)
        {
            var user = await _userRepository.GetOneAsync(u => u.Id == id);
            if (user == null)
            {
                throw new HttpResponseError(HttpStatusCode.NotFound, $"No se encontró un usuario con el Id = '{id}'");
            }
            await _userRepository.DeleteOneAsync(user);
        }
    }
}
