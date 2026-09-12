using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;
using StockRM.Domain.Enums;

namespace StockRM.WebAPI.Controllers;

[Authorize]
[Route("api/[controller]")]
public class ConfigurationController : BaseApiController
{
    private readonly IMaterialService _materialService;
    private readonly IAgeStandardService _ageStandardService;

    public ConfigurationController(
        IMaterialService materialService,
        IAgeStandardService ageStandardService)
    {
        _materialService = materialService;
        _ageStandardService = ageStandardService;
    }

    [HttpGet("materials")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<IEnumerable<MaterialDto>>> GetMaterials([FromQuery] bool includeInactive = false)
    {
        var result = await _materialService.GetAllAsync(includeInactive);
        return Ok(result);
    }

    [HttpGet("materials/{id}")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<MaterialDto>> GetMaterial(int id)
    {
        var material = await _materialService.GetByIdAsync(id);
        if (material == null)
        {
            return NotFound(new { message = $"Material {id} not found." });
        }
        return Ok(material);
    }

    [HttpGet("materials/type/{type}")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<IEnumerable<MaterialDto>>> GetMaterialsByType(MaterialType type)
    {
        var result = await _materialService.GetByTypeAsync(type);
        return Ok(result);
    }

    [HttpPost("materials")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<MaterialDto>> CreateMaterial([FromBody] CreateMaterialDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Code) || string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.NameVi))
        {
            return BadRequest(new { message = "Code, Name, and Vietnamese Name are required." });
        }

        try
        {
            var created = await _materialService.CreateAsync(dto, GetUserId());
            return CreatedAtAction(nameof(GetMaterial), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("materials/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<MaterialDto>> UpdateMaterial(int id, [FromBody] UpdateMaterialDto dto)
    {
        if (dto == null)
        {
            return BadRequest(new { message = "Update parameters are required." });
        }

        try
        {
            var updated = await _materialService.UpdateAsync(id, dto, GetUserId());
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("materials/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteMaterial(int id)
    {
        try
        {
            await _materialService.DeleteAsync(id, GetUserId());
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("age-standards")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<IEnumerable<AgeStandardDto>>> GetAgeStandards()
    {
        var result = await _ageStandardService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("age-standards/material/{materialId}")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<AgeStandardDto>> GetAgeStandardByMaterial(int materialId)
    {
        var standard = await _ageStandardService.GetByMaterialIdAsync(materialId);
        if (standard == null)
        {
            return NotFound(new { message = $"Age standard for material {materialId} not found." });
        }
        return Ok(standard);
    }

    [HttpPost("age-standards")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<AgeStandardDto>> UpsertAgeStandard([FromBody] CreateAgeStandardDto dto)
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
