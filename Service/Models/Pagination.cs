using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Models
{
    public class Pagination<T>
    {
        public string Results { get; private set; }
        public long TotalRows { get; private set; }
        public int PageNumber { get; private set; }
        public int PerPage { get; private set; }

        public int LastPage => (int)Math.Ceiling((TotalRows / (decimal)PerPage));

        public int ReturnedResults => Results.Count();

        private Pagination() { }

        public static async Task<Pagination<T>> CreateFrom(IMongoCollection<T> collection, FilterDefinition<T> filter, int perPage, int pageNumber)
        {
            try
            {
                var pagination = new Pagination<T>
                {
                    PerPage = perPage,
                    PageNumber = pageNumber,
                    TotalRows = await collection.CountDocumentsAsync(filter)
                };

                var res = await collection
                    .Find(filter)
                    .Skip((pageNumber - 1) * perPage)
                    .Limit(perPage)
                    .ToListAsync();

                pagination.Results = res.ToJson();

                return pagination;
            }
            catch (Exception ex)
            {
                throw new Exception($"Pagination error: {ex.Message}", ex);
            }

        }
    }
}
