using Service.Services.Auth;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static Service.Services.Auth.TokenService;

namespace Service.Interfaces
{
    public interface ITokenService
    {
        JwtAuthResult GenerateTokens(string username, Claim[] claims, DateTime now);
        (ClaimsPrincipal, JwtSecurityToken) DecodeJwtToken(string token);
        Task<RefreshToken> GetRefreshTokenValid(string refreshToken, DateTime now);
        void RemoveRefreshTokenByToken(string token);
    }
}
