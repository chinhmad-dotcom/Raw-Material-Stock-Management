using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;

namespace StockRM.WebAPI.Controllers;

[Authorize]
public class SilosController : BaseApiController
{
    private readonly ISiloService _siloService;

    public SilosController(ISiloService siloService)
    {
        _siloService = siloService;
    }

    [HttpGet]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<IEnumerable<SiloDto>>> GetAll()
    {
        var silos = await _siloService.GetAllAsync();
        return Ok(silos);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<SiloDto>> GetById(int id)
    {
        var silo = await _siloService.GetByIdAsync(id);
        if (silo == null)
        {
            return NotFound(new { message = $"Silo {id} not found." });
        }
        return Ok(silo);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<SiloDto>> Create([FromBody] CreateSiloDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Code) || string.IsNullOrWhiteSpace(dto.Name) || dto.CapacityTons <= 0)
        {
            return BadRequest(new { message = "Code, Name, and positive CapacityTons are required." });
        }

        try
        {
            var created = await _siloService.CreateAsync(dto, GetUserId());
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<SiloDto>> Update(int id, [FromBody] CreateSiloDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Code) || string.IsNullOrWhiteSpace(dto.Name) || dto.CapacityTons <= 0)
        {
            return BadRequest(new { message = "Code, Name, and positive CapacityTons are required." });
        }

        try
        {
            var updated = await _siloService.UpdateAsync(id, dto, GetUserId());
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
            await _siloService.DeleteAsync(id, GetUserId());
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
