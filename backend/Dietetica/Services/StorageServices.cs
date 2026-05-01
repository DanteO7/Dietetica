using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;

namespace Dietetica.Services
{
    public class StorageService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;

        public StorageService(IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _httpClientFactory = httpClientFactory;
            _config = config;
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            var supabaseUrl = _config["Supabase:Url"];
            var serviceKey = _config["Supabase:ServiceKey"];
            var bucket = _config["Supabase:Bucket"];

            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{extension}";
            var path = $"products/{fileName}";

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("apikey", serviceKey);
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {serviceKey}");

            using var stream = file.OpenReadStream();
            var content = new StreamContent(stream);
            content.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);

            var response = await client.PostAsync(
                $"{supabaseUrl}/storage/v1/object/{bucket}/{path}",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Error al subir imagen: {error}");
            }

            return $"{supabaseUrl}/storage/v1/object/public/{bucket}/{path}";
        }

        public async Task DeleteImageAsync(string imageUrl)
        {
            var supabaseUrl = _config["Supabase:Url"];
            var serviceKey = _config["Supabase:ServiceKey"];
            var bucket = _config["Supabase:Bucket"];

            var prefix = $"{supabaseUrl}/storage/v1/object/public/{bucket}/";
            var path = imageUrl.Replace(prefix, "");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("apikey", serviceKey);
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {serviceKey}");

            var response = await client.DeleteAsync(
                $"{supabaseUrl}/storage/v1/object/{bucket}/{path}"
            );
            var responseBody = await response.Content.ReadAsStringAsync();
        }
    }
}