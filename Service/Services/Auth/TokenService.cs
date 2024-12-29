using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Service.Interfaces;
using Service.Models.AppSettings;
using Services.Cache;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Service.Services.Auth
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly ICacheProvider cache;
        private readonly JwtTokenConfig _jwtTokenConfig;
        private readonly byte[] _secret;
        public TokenService(JwtTokenConfig jwtTokenConfig, ICacheProvider cache)
        {
            _jwtTokenConfig = jwtTokenConfig;
            this.cache = cache;
            _secret = Encoding.ASCII.GetBytes(jwtTokenConfig.Secret);
        }

        public JwtAuthResult GenerateTokens(string username, Claim[] claims, DateTime now)
        {
            var expiry = now.AddMinutes(_jwtTokenConfig.AccessTokenExpiration);

            var shouldAddAudienceClaim = string.IsNullOrWhiteSpace(claims?.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Aud)?.Value);
            var jwtToken = new JwtSecurityToken(
                _jwtTokenConfig.Issuer,
                shouldAddAudienceClaim ? _jwtTokenConfig.Audience : string.Empty,
                claims,
                expires: expiry,
                signingCredentials: new SigningCredentials(new SymmetricSecurityKey(_secret), SecurityAlgorithms.HmacSha256Signature));
            var accessToken = new JwtSecurityTokenHandler().WriteToken(jwtToken);

            var refreshExpiry = now.AddMinutes(_jwtTokenConfig.RefreshTokenExpiration);
            var refreshToken = new RefreshToken
            {
                Email = username,
                TokenString = GenerateRefreshTokenString(),
                ExpireAt = refreshExpiry
            };

            var accessTokenModel = new AccessToken
            {
                AccessTokenString = accessToken,
                ExpireAt = expiry
            };

            cache.SetCache(refreshToken.TokenString, refreshToken, null);

            return new JwtAuthResult
            {
                AccessToken = accessTokenModel,
                RefreshToken = refreshToken
            };
        }

        public void RemoveRefreshTokenByToken(string token)
        {
            cache.ClearCache(token);
        }
        public async Task<RefreshToken> GetRefreshTokenValid(string refreshToken, DateTime now)
        {
            try
            {
                var token = await cache.GetFromCache<RefreshToken>(refreshToken);
                if (token == null)
                {
                    throw new SecurityTokenException("Invalid token");
                }
                if (token.ExpireAt < now)
                {
                    throw new SecurityTokenException("Invalid token");
                }

                return token;
            }
            catch (Exception ex)
            {
                throw new SecurityTokenException("Invalid token", ex);
            }


        }

        public (ClaimsPrincipal, JwtSecurityToken) DecodeJwtToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                throw new SecurityTokenException("Invalid token");
            }
            var principal = new JwtSecurityTokenHandler()
                .ValidateToken(token,
                    new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = _jwtTokenConfig.Issuer,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(_secret),
                        ValidAudience = _jwtTokenConfig.Audience,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.FromMinutes(1)
                    },
                    out var validatedToken);
            return (principal, validatedToken as JwtSecurityToken);
        }

        private static string GenerateRefreshTokenString()
        {
            var randomNumber = new byte[32];
            using var randomNumberGenerator = RandomNumberGenerator.Create();
            randomNumberGenerator.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
