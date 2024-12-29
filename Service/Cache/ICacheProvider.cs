using Microsoft.Extensions.Caching.Distributed;
using System;
using System.Threading.Tasks;

namespace Services.Cache
{
    public interface ICacheProvider
    {

        Task<T> GetFromCache<T>(string key);

        Task SetCache<T>(string key, T value, DistributedCacheEntryOptions options);

        Task ClearCache(string key);

        /// <summary>
        /// Try get from cache, otherwise load from loadData parameter and set into cache
        /// </summary>
        /// <typeparam name="T">Should be a nullable type</typeparam>
        /// <param name="key"></param>
        /// <param name="loadData"></param>
        /// <param name="options"></param>
        /// <returns></returns>
        Task<T> TryGetFromCache<T>(string key, Func<Task<T>> loadData, DistributedCacheEntryOptions options = null);

    }
}