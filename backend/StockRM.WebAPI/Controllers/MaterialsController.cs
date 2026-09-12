using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;
using StockRM.Domain.Enums;

namespace StockRM.WebAPI.Controllers;

[Authorize]
public class MaterialsController : BaseApiController
{
    private readonly IMaterialService _materialService;

    public MaterialsController(IMaterialService materialService)
    {
        _materialService = materialService;
    }

    [HttpGet]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<IEnumerable<MaterialDto>>> GetAll([FromQuery] bool includeInactive = false)
    {
        var materials = await _materialService.GetAllAsync(includeInactive);
        return Ok(materials);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<MaterialDto>> GetById(int id)
    {
        var material = await _materialService.GetByIdAsync(id);
        if (material == null)
        {
            return NotFound(new { message = $"Material {id} not found." });
        }
        return Ok(material);
    }

    [HttpGet("type/{type}")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<IEnumerable<MaterialDto>>> GetByType(MaterialType type)
    {
        var materials = await _materialService.GetByTypeAsync(type);
        return Ok(materials);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<MaterialDto>> Create([FromBody] CreateMaterialDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Code) || string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.NameVi))
        {
            return BadRequest(new { message = "Code, Name, and Vietnamese Name are required." });
        }

        try
        {
            var created = await _materialService.CreateAsync(dto, GetUserId());
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<MaterialDto>> Update(int id, [FromBody] UpdateMaterialDto dto)
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

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
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
}
