using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;

namespace StockRM.WebAPI.Controllers;

[Authorize(Policy = "ReadAll")]
public class DashboardController : BaseApiController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
    {
        var summary = await _dashboardService.GetDashboardSummaryAsync();
        return Ok(summary);
    }

    [HttpGet("trend/silo")]
    public async Task<ActionResult<IEnumerable<StockTrendDto>>> GetSiloTrend(
        [FromQuery] int siloId, [FromQuery] int materialId, [FromQuery] int days = 30)
    {
        if (days <= 0)
        {
            return BadRequest(new { message = "Days parameter must be a positive integer." });
        }

        var trend = await _dashboardService.GetSiloTrendAsync(siloId, materialId, days);
        return Ok(trend);
    }

    [HttpGet("trend/additive")]
    public async Task<ActionResult<IEnumerable<StockTrendDto>>> GetAdditiveTrend(
        [FromQuery] int materialId, [FromQuery] int days = 30)
    {
        if (days <= 0)
        {
            return BadRequest(new { message = "Days parameter must be a positive integer." });
        }

        var trend = await _dashboardService.GetAdditiveTrendAsync(materialId, days);
        return Ok(trend);
    }

    [HttpGet("report/daily")]
    public async Task<ActionResult<DailyReportDto>> GetDailyReport([FromQuery] DateTime date)
    {
        var report = await _dashboardService.GetDailyReportAsync(date);
        return Ok(report);
    }
}
