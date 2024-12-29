using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Models.AppSettings
{
    public class AppSettings : ICacheAppSettings
    {
        public int CacheDefaultSeconds { get; set; }
    }
}
