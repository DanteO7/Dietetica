using Microsoft.AspNetCore.Http;
using System.Net;

namespace Dietetica.Middlewares
{
    public class CsrfProtectionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly string[] _allowedOrigins;
        public CsrfProtectionMiddleware(RequestDelegate next, IConfiguration config)
        {
            _next = next;
            _allowedOrigins = config
                .GetSection("Frontend:AllowedOrigins")
                .Get<string[]>()
                ?? [];
        }

        public async Task Invoke(HttpContext context)
        {
            if (context.Request.Path.StartsWithSegments("/swagger"))
            {
                await _next(context);
                return;
            }

            var method = context.Request.Method;

            if (method == HttpMethods.Post ||
                method == HttpMethods.Put ||
                method == HttpMethods.Delete ||
                method == HttpMethods.Patch)
            {
                var origin = context.Request.Headers["Origin"].ToString();

                if (string.IsNullOrEmpty(origin) || !_allowedOrigins.Contains(origin))
                {
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsync("Invalid origin");
                    return;
                }

                var isSwagger = origin.Contains("localhost:5050");

                if (!isSwagger &&
                    !context.Request.Headers.ContainsKey("X-Requested-With"))
                {
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsync("Missing required header");
                    return;
                }
            }

            await _next(context);
        }
    }
}