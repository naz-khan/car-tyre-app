using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using Service.Models;

namespace CarTyres.Server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private IAuthService _service { get; set; }

        public AuthController(IAuthService service)
        {
            _service = service;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Services.Models.LoginDetails data)
        {
            if (data == null || string.IsNullOrEmpty(data.Email) || string.IsNullOrEmpty(data.Password))
            {
                return BadRequest(new { message = "Email or password cannot be empty" });
            }

            var user = await _service.AuthenticateUserAsync(data.Email, data.Password);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            return Ok(user);
        }
    }
}
