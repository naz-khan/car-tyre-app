using MongoDB.Bson;
using MongoDB.Driver;
using Service.Interfaces;
using Service.Models;
using Service.Services.Auth;
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
            var user = await GetUserByEmail(email);

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

                var jwtToken = _tokenService.GenerateTokens(user.Email, usersClaims, DateTime.Now);

                return new User
                {
                    _Id = user._Id,
                    Firstname = user.Firstname,
                    Lastname = user.Lastname,
                    Email = user.Email,
                    Role = user.Role,
                    AccessToken = jwtToken.AccessToken.AccessTokenString,
                    RefreshToken = jwtToken.RefreshToken.TokenString,
                    TokenExpiration = jwtToken.AccessToken.ExpireAt.ToString("yyyy-MM-dd HH:mm:ss")
                };
            }

            return null;
        }
        
        public async Task<User> RefreshToken(RefreshTokenRequest request)
        {
            var refreshToken = await _tokenService.GetRefreshTokenValid(request.RefreshToken, DateTime.Now);

            var user = await GetUserByEmail(refreshToken.Email);

            var usersClaims = new[]
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user._Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var newJwtToken = _tokenService.GenerateTokens(refreshToken.Email, usersClaims, DateTime.Now);

            return new User
            {
                _Id = user._Id,
                Firstname = user.Firstname,
                Lastname = user.Lastname,
                Email = user.Email,
                Role = user.Role,
                AccessToken = newJwtToken.AccessToken.AccessTokenString,
                RefreshToken = newJwtToken.RefreshToken.TokenString,
                TokenExpiration = newJwtToken.AccessToken.ExpireAt.ToString("yyyy-MM-dd HH:mm:ss")
            };
        }
        public async Task CreateUser(User data)
        {          
            data.Password = _passwordHasher.GenerateIdentityV3Hash(data.Password);

            await _database.GetCollection<User>("Users")
                .InsertOneAsync(data);
        }

        private async Task<User> GetUserByEmail(string email)
        {
            return await _database.GetCollection<User>("Users")
                .Find(x => x.Email == email)
                .FirstOrDefaultAsync();
        }
    }
}
