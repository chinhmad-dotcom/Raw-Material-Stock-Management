using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;

namespace StockRM.WebAPI.Controllers;

[Authorize]
public class AlertsController : BaseApiController
{
    private readonly IAlertService _alertService;

    public AlertsController(IAlertService alertService)
    {
        _alertService = alertService;
    }

    [HttpGet("active")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<IEnumerable<AlertDto>>> GetActive()
    {
        var alerts = await _alertService.GetActiveAlertsAsync();
        return Ok(alerts);
    }

    [HttpPost("{id}/resolve")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Resolve(int id)
    {
        try
        {
            await _alertService.ResolveAlertAsync(id, GetUserId());
            return Ok(new { message = $"Alert {id} resolved successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
