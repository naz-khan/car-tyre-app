using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Services.Models
{
    public class LoginDetails
    {
        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("password")]
        public string Password { get; set; }
    }

    public class ResetPassword
    {
        public string ResetPasswordId { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
    }
}
