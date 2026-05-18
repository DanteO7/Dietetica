using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Dietetica.Services
{
    public class StorageService
    {
        private readonly Cloudinary _cloudinary;
        private readonly IConfiguration _config;

        public StorageService(IConfiguration config)
        {
            _config = config;

            var account = new Account(
                config["Cloudinary:CloudName"],
                config["Cloudinary:ApiKey"],
                config["Cloudinary:ApiSecret"]
            );

            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = $"{_config["Cloudinary:Folder"]}/products"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                throw new Exception(uploadResult.Error.Message);
            }

            return uploadResult.SecureUrl.ToString();
        }

        public async Task DeleteImageAsync(string imageUrl)
        {
            var uri = new Uri(imageUrl);

            var fileName = Path.GetFileNameWithoutExtension(uri.AbsolutePath);

            var publicId = $"{_config["Cloudinary:Folder"]}/products/{fileName}";

            var deleteParams = new DeletionParams(publicId);

            var result = await _cloudinary.DestroyAsync(deleteParams);

            if (result.Error != null)
            {
                throw new Exception(result.Error.Message);
            }
        }
    }
}