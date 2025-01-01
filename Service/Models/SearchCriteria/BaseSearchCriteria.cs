using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Models.SearchCriteria
{
    public class BaseSearchCriteria
    {
        [Range(0, int.MaxValue)]
        [Display(Name = "Page Number")]
        public int PageNumber { get; set; } = 1;

        [Range(1, 500)]
        [Display(Name = "Page Size")]
        public int PageSize { get; set; } = 10;
    }
}
