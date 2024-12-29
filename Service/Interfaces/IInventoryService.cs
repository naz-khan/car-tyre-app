using MongoDB.Bson;
using Service.Models.SearchCriteria;
using Service.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http.Json;
using System.Text.Json.Nodes;

namespace Service.Interfaces
{
    public interface IInventoryService
    {
        Task<Pagination<BsonDocument>> Inventory(InventorySearchCriteria searchCriteria);
        Task<string> InventoryById(string id);
        Task SaveInventory(JsonObject inventory);
    }
}
