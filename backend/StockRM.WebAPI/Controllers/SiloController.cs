using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockRM.Application.DTOs;
using StockRM.Application.Interfaces;

namespace StockRM.WebAPI.Controllers;

[Authorize]
[Route("api/[controller]")]
public class SiloController : BaseApiController
{
    private readonly ISiloStockService _siloStockService;

    public SiloController(ISiloStockService siloStockService)
    {
        _siloStockService = siloStockService;
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<SiloStockDto>> GetById(int id)
    {
        var entry = await _siloStockService.GetByIdAsync(id);
        if (entry == null)
        {
            return NotFound(new { message = $"Silo stock entry {id} not found." });
        }
        return Ok(entry);
    }

    [HttpGet("date")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<IEnumerable<SiloStockDto>>> GetByDate([FromQuery] DateTime date)
    {
        var entries = await _siloStockService.GetByDateAsync(date);
        return Ok(entries);
    }

    [HttpGet("silo/{siloId}")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<IEnumerable<SiloStockDto>>> GetBySilo(
        int siloId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var entries = await _siloStockService.GetBySiloAsync(siloId, from, to);
        return Ok(entries);
    }

    [HttpGet("material/{materialId}")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<IEnumerable<SiloStockDto>>> GetByMaterial(
        int materialId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var entries = await _siloStockService.GetByMaterialAsync(materialId, from, to);
        return Ok(entries);
    }

    [HttpGet("transactions")]
    [Authorize(Policy = "ReadAll")]
    public async Task<ActionResult<PagedResultDto<StockTransactionDto>>> GetTransactions(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 50,
        [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        if (page <= 0 || pageSize <= 0)
        {
            return BadRequest(new { message = "Page and PageSize must be greater than zero." });
        }

        var result = await _siloStockService.GetTransactionsAsync(page, pageSize, from, to);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "SiloAccess")]
    public async Task<ActionResult<SiloStockDto>> Create([FromBody] CreateSiloStockDto dto)
    {
        if (dto == null || dto.SiloId <= 0 || dto.MaterialId <= 0 || dto.OpeningStockTons < 0 || dto.IntakeTons < 0 || dto.DispatchTons < 0)
        {
            return BadRequest(new { message = "Invalid stock entry parameters. Negative values are not allowed." });
        }

        try
        {
            var created = await _siloStockService.CreateAsync(dto, GetUserId());
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex) when (ex is KeyNotFoundException || ex is InvalidOperationException)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "SiloAccess")]
    public async Task<ActionResult<SiloStockDto>> Update(int id, [FromBody] UpdateSiloStockDto dto)
    {
        if (dto == null || dto.OpeningStockTons < 0 || dto.IntakeTons < 0 || dto.DispatchTons < 0)
        {
            return BadRequest(new { message = "Invalid stock update parameters. Negative values are not allowed." });
        }

        try
        {
            var updated = await _siloStockService.UpdateAsync(id, dto, GetUserId());
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "SiloAccess")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _siloStockService.DeleteAsync(id, GetUserId());
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("import")]
    [Authorize(Policy = "SiloAccess")]
    public async Task<ActionResult<ExcelImportResultDto>> Import(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Excel file is required." });
        }

        try
        {
            using var stream = file.OpenReadStream();
            var result = await _siloStockService.ImportFromExcelAsync(stream, file.FileName, GetUserId());
            return Ok(result);
        }
        catch (NotImplementedException ex)
        {
            return StatusCode(501, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: 500);
        }
    }
}
