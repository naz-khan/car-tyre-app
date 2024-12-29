using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Service.Services.Auth
{
    public class RefreshTokenRequest
    {
        [JsonPropertyName("refreshToken")]
        public string RefreshToken { get; set; }
    }

    public class JwtAuthResult
    {
        [JsonPropertyName("accessToken")]
        public AccessToken AccessToken { get; set; }

        [JsonPropertyName("refreshToken")]
        public RefreshToken? RefreshToken { get; set; }
    }


    public class AccessToken
    {
        public string? AccessTokenString { get; set; }
        public DateTime ExpireAt { get; set; }
    }
    public class RefreshToken
    {
        [JsonPropertyName("email")]
        public string? Email { get; set; }    // can be used for usage tracking
                                              // can optionally include other metadata, such as user agent, ip address, device name, and so on

        [JsonPropertyName("tokenString")]
        public string? TokenString { get; set; }

        [JsonPropertyName("expireAt")]
        public DateTime ExpireAt { get; set; }
    }
}
