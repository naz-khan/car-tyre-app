using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver.Core.Configuration;
using Service.Interfaces;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Services.Cache
{
    public class CacheProvider : ICacheProvider
    {
        private readonly ConnectionMultiplexer _redisConnection;
        private readonly StackExchange.Redis.IDatabase _database;
        private readonly ICacheAppSettings cacheAppSettings;
        public CacheProvider(string connectionString, ICacheAppSettings cacheAppSettings)
        {

            _redisConnection = ConnectionMultiplexer.Connect("localhost,abortConnect=false");
            _database = _redisConnection.GetDatabase();
            this.cacheAppSettings = cacheAppSettings;
        }

        public async Task<T> GetFromCache<T>(string key)
        {
            var cachedResponse = await _database.StringGetAsync(key);
            return string.IsNullOrEmpty(cachedResponse) ? default(T) : JsonSerializer.Deserialize<T>(cachedResponse);
        }

        public async Task SetCache<T>(string key, T value, DistributedCacheEntryOptions options = null)
        {
            if (options == null)
            {
                options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(cacheAppSettings.CacheDefaultSeconds)
                };
            }

            var response = JsonSerializer.Serialize(value);
            TimeSpan? expiry = options.AbsoluteExpirationRelativeToNow;

            // Use the StackExchange.Redis method to set the value
            await _database.StringSetAsync(key, response, expiry);
        }

        /// <summary>
        /// Suggest T is a nullable type
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="key"></param>
        /// <param name="loadData"></param>
        /// <param name="options"></param>
        /// <returns></returns>
        public async Task<T> TryGetFromCache<T>(string key, Func<Task<T>> loadData, DistributedCacheEntryOptions options = null)
        {
            var result = await GetFromCache<T>(key);
            if (result == null || result.Equals(default(T))) //default value so try load from function
            {
                result = await loadData();
                await SetCache(key, result, options);
            }
            return result;
        }

        public async Task ClearCache(string key)
        {
            await _database.KeyDeleteAsync(key); // Use StackExchange.Redis method to remove the key
        }
    }
}

