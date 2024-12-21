using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Service.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;

namespace Service.Services.Auth
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public JwtAuthResult GenerateAccessToken(string Email, IEnumerable<Claim> claims)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["jwtTokenConfig:secret"]));
            var expiry = DateTime.Now.AddMinutes(int.Parse(_configuration["jwtTokenConfig:accessTokenExpiration"]));

            var jwToken = new JwtSecurityToken(
                issuer: _configuration["jwtTokenConfig:issuer"],
                audience: _configuration["jwtTokenConfig:audience"],
                claims: claims,
                notBefore: DateTime.Now,
                expires: expiry,
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            var accessToken = new JwtSecurityTokenHandler().WriteToken(jwToken);

            var refreshToken = new RefreshToken
            {
                UserName = Email,
                TokenString = GenerateRefreshToken(),
                ExpireAt = expiry
            };

            return new JwtAuthResult
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };

        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidAudience = _configuration["jwtTokenConfig:audience"],
                ValidateIssuer = true,
                ValidIssuer = _configuration["jwtTokenConfig.issuer"],
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["jwtTokenConfig:secret"])),
                ValidateLifetime = true,
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken;
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;
            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");

            return principal;
        }

        public class JwtAuthResult
        {
            [JsonPropertyName("accessToken")]
            public string? AccessToken { get; set; }

            [JsonPropertyName("refreshToken")]
            public RefreshToken? RefreshToken { get; set; }
        }

        public class RefreshToken
        {
            [JsonPropertyName("username")]
            public string? UserName { get; set; }    // can be used for usage tracking
                                                    // can optionally include other metadata, such as user agent, ip address, device name, and so on

            [JsonPropertyName("tokenString")]
            public string? TokenString { get; set; }

            [JsonPropertyName("expireAt")]
            public DateTime ExpireAt { get; set; }
        }
    }
}
