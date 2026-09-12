using Microsoft.AspNetCore.Mvc;

namespace StockRM.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected int GetUserId()
    {
        var subClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;
            
        return int.TryParse(subClaim, out var id) ? id : 0;
    }
}
