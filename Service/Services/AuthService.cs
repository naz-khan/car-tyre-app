using MongoDB.Bson;
using MongoDB.Driver;
using Service.Interfaces;
using Service.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using static MongoDB.Driver.WriteConcern;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Service.Services
{
    public class AuthService : IAuthService
    {
        private readonly IMongoDatabase _database;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;

        public AuthService(IMongoDatabase database, IPasswordHasher passwordHasher, ITokenService tokenService)
        {
            _database = database;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
        }
        public async Task<User> AuthenticateUserAsync(string email, string password)
        {
            var user = await _database.GetCollection<User>("Users")
                .Find(x => x.Email == email)
                .FirstOrDefaultAsync();

            if(user == null)
            {
                return null;
            }

            if (_passwordHasher.VerifyIdentityV3Hash(password, user.Password))
            {
                var usersClaims = new[]
                {
                    new Claim(ClaimTypes.Name, user.Email),
                    new Claim(ClaimTypes.NameIdentifier, user._Id.ToString()),
                    new Claim(ClaimTypes.Role, user.Role)
                };

                var jwtToken = _tokenService.GenerateAccessToken(user.Email, usersClaims);

                return new User
                {
                    _Id = user._Id,
                    Firstname = user.Firstname,
                    Lastname = user.Lastname,
                    Email = user.Email,
                    Role = user.Role,
                    AccessToken = jwtToken.AccessToken,
                    RefreshToken = jwtToken.RefreshToken.TokenString,
                    TokenExpiration = jwtToken.RefreshToken.ExpireAt.ToString("yyyy-MM-dd HH:mm:ss")
                };
            }

            return null;
        }
        
        public async Task CreateUser(User data)
        {          
            data.Password = _passwordHasher.GenerateIdentityV3Hash(data.Password);

            await _database.GetCollection<User>("Users")
                .InsertOneAsync(data);
        }
    }
}
