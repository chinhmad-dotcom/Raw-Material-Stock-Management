using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;

namespace StockRM.WebAPI.Controllers;

[Authorize]
public class AgeStandardsController : BaseApiController
{
    private readonly IAgeStandardService _ageStandardService;

    public AgeStandardsController(IAgeStandardService ageStandardService)
    {
        _ageStandardService = ageStandardService;
    }

    [HttpGet]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<IEnumerable<AgeStandardDto>>> GetAll()
    {
        var standards = await _ageStandardService.GetAllAsync();
        return Ok(standards);
    }

    [HttpGet("material/{materialId}")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<AgeStandardDto>> GetByMaterialId(int materialId)
    {
        var standard = await _ageStandardService.GetByMaterialIdAsync(materialId);
        if (standard == null)
        {
            return NotFound(new { message = $"Age standard for material {materialId} not found." });
        }
        return Ok(standard);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<AgeStandardDto>> CreateOrUpdate([FromBody] CreateAgeStandardDto dto)
    {
        if (dto == null || dto.MaterialId <= 0 || dto.MaxStorageAgeDays <= 0)
        {
            return BadRequest(new { message = "MaterialId and MaxStorageAgeDays must be positive integers." });
        }

        try
        {
            var result = await _ageStandardService.CreateOrUpdateAsync(dto, GetUserId());
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
