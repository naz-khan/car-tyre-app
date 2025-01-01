using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Service.Interfaces;
using Service.Models.SearchCriteria;
using System.Text.Json.Nodes;

namespace CarTyres.Server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class InventoryController : Controller
    {
        private IInventoryService _service { get; set; }

        public InventoryController(IInventoryService service)
        {
            _service = service;
        }

        [HttpGet("inventory")]
        [Authorize]
        public async Task<IActionResult> Inventory([FromQuery] InventorySearchCriteria searchCriteria)
        {
            var r = await _service.Inventory(searchCriteria);
            return Ok(r);
        }

        [HttpGet("inventory/{id}")]
        [Authorize]
        public async Task<IActionResult> InventoryById(string id)
        {
            var r = await _service.InventoryById(id);
            return Ok(r);
        }

        [HttpPost("inventory")]
        [Authorize]
        public async Task<IActionResult> SaveInventory([FromBody] JsonObject data)
        {
            await _service.SaveInventory(data);
            return Ok();
        }

        [HttpGet("tyres")]
        public async Task<IActionResult> Tyres()
        {
            var r = await _service.Tyres();
            return Ok(r);
        }

        [HttpGet("search-tyres")]
        public async Task<IActionResult> SearchTyres([FromQuery] TyreSearchCriteria data)
        {
            var r = await _service.SearchTyres(data);
            return Ok(r);
        }
    }
}
