using Service.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IAuthService
    {
        Task<User> AuthenticateUserAsync(string email, string password);
        Task CreateUser(User data);
    }
}
