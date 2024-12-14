using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarTyres.Server.Controllers
{
    public class AuthController : Controller
    {
        [Authorize]
        [HttpGet("protected")]
        public IActionResult Protected()
        {
            return Ok(new { message = "This is a protected route." });
        }
    }
}
