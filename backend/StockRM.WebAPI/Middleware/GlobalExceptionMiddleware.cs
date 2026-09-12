using System.Net;
using System.Text.Json;

namespace StockRM.WebAPI.Middleware;

/// <summary>
/// Catches all unhandled exceptions and returns a consistent JSON error response.
/// Prevents stack traces leaking to clients in production.
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            ArgumentNullException      => (HttpStatusCode.BadRequest,    exception.Message),
            ArgumentException          => (HttpStatusCode.BadRequest,    exception.Message),
            UnauthorizedAccessException => (HttpStatusCode.Forbidden,    "Access denied."),
            KeyNotFoundException       => (HttpStatusCode.NotFound,      exception.Message),
            InvalidOperationException  => (HttpStatusCode.Conflict,      exception.Message),
            _                          => (HttpStatusCode.InternalServerError, "An unexpected error occurred.")
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            success = false,
            statusCode = (int)statusCode,
            message,
            detail = _env.IsDevelopment() ? exception.ToString() : null,
            timestamp = DateTime.UtcNow
        };

        var json = JsonSerializer.Serialize(response,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        await context.Response.WriteAsync(json);
    }
}
