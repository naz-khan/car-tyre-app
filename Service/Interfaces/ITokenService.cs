using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace Service.Interfaces
{
    public interface ITokenService
    {
        Service.Services.Auth.TokenService.JwtAuthResult GenerateAccessToken(string Email, IEnumerable<Claim> claims);
        string GenerateRefreshToken();
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
    }
}
