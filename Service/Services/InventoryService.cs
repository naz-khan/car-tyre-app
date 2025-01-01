using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using Service.Interfaces;
using Service.Models;
using Service.Models.SearchCriteria;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Service.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IMongoDatabase _database;
        public InventoryService(IMongoDatabase database)
        {
                _database = database;
        }
        public async Task<Pagination<BsonDocument>> Inventory(InventorySearchCriteria searchCriteria)
        {
            var filterBuilder = Builders<BsonDocument>.Filter;

            // Create filters dynamically using LINQ
            var filters = new List<FilterDefinition<BsonDocument>>
            {
                // Convert SKU to string since it is stored as a string in the database
                !string.IsNullOrEmpty(searchCriteria.SKU) ? filterBuilder.Eq("SKU", searchCriteria.SKU) : null,
                !string.IsNullOrEmpty(searchCriteria.ProductName) ? filterBuilder.Eq("ProductName", searchCriteria.ProductName) : null,
                !string.IsNullOrEmpty(searchCriteria.ProductBarcode) ? filterBuilder.Eq("ProductBarcode", searchCriteria.ProductBarcode) : null
            }.Where(filter => filter != null).ToList();

            // Combine filters with AND, or use an empty filter if none are provided
            var combinedFilter = filters.Any()
                ? filterBuilder.And(filters)
                : FilterDefinition<BsonDocument>.Empty;

            var collection = _database.GetCollection<BsonDocument>("Inventory");

            // Create paginated results
            var model = await Pagination<BsonDocument>
                .CreateFrom(collection, combinedFilter, searchCriteria.PageSize, searchCriteria.PageNumber);


            return model;
        }

        public async Task<string> InventoryById(string id)
        {
            var collection = _database.GetCollection<BsonDocument>("Inventory");

            var filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(id));

            var result = await collection.Find(filter).FirstOrDefaultAsync();

            return result.ToJson();
        }

        public async Task SaveInventory(JsonObject inventory)
        {

            var data = inventory.ToBsonDocument();

            var collection = _database.GetCollection<BsonDocument>("Inventory");

            var filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(data["_id"].ToString()));

            var result = await collection.Find(filter).FirstOrDefaultAsync();

            if(result != null)
            {
                await collection.UpdateOneAsync(filter, new BsonDocument("$set", data));
            }
            else {                 
                await collection.InsertOneAsync(data);
            }
        }

        public async Task DeleteInventory(string id)
        {

        }

        public async Task DeleteInventoryItems(string id, List<string> sku)
        {

        }

        public async Task<string> Tyres()
        {
            var collection = await _database.GetCollection<BsonDocument>("Tyres")
                .Find(_ => true)
                .ToListAsync();
            
            return collection.ToJson();
        }

        public async Task<Pagination<BsonDocument>> SearchTyres(TyreSearchCriteria searchCriteria)
        {
            var filterBuilder = Builders<BsonDocument>.Filter;

            // Create filters dynamically using LINQ
            var filters = new List<FilterDefinition<BsonDocument>>
            {
                // Convert SKU to string since it is stored as a string in the database
                !string.IsNullOrEmpty(searchCriteria.TyreWidth) ? filterBuilder.Eq("InventoryItems.Dimensions.width", searchCriteria.TyreWidth) : null,
                !string.IsNullOrEmpty(searchCriteria.TyreHeight) ? filterBuilder.Eq("InventoryItems.Dimensions.height", searchCriteria.TyreHeight) : null,
                !string.IsNullOrEmpty(searchCriteria.TyreRimSize) ? filterBuilder.Eq("InventoryItems.Dimensions.RimSize", searchCriteria.TyreRimSize) : null
            }.Where(filter => filter != null)
            .ToList();

            // Combine filters with AND, or use an empty filter if none are provided
            var combinedFilter = filters.Any()
                ? filterBuilder.And(filters)
                : FilterDefinition<BsonDocument>.Empty;

            var collection = _database.GetCollection<BsonDocument>("Inventory");

            // Create paginated results
            var model = await Pagination<BsonDocument>
                .CreateFrom(collection, combinedFilter, searchCriteria.PageSize, searchCriteria.PageNumber);


            return model;
        }
    }
}
