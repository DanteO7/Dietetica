using Microsoft.AspNetCore.Http;
using System.Net;

namespace Dietetica.Middlewares
{
    public class CsrfProtectionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly string _allowedOrigin;

        public CsrfProtectionMiddleware(RequestDelegate next, IConfiguration config)
        {
            _next = next;
            _allowedOrigin = config["Frontend:Url"] ?? "https://localhost:7171";
        }

        public async Task Invoke(HttpContext context)
        {
            var method = context.Request.Method;

            if (method == HttpMethods.Post ||
                method == HttpMethods.Put ||
                method == HttpMethods.Delete ||
                method == HttpMethods.Patch)
            {
                var origin = context.Request.Headers["Origin"].ToString();

                if (string.IsNullOrEmpty(origin) || origin != _allowedOrigin)
                {
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsync("Invalid origin");
                    return;
                }

                if (!context.Request.Headers.ContainsKey("X-Requested-With"))
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