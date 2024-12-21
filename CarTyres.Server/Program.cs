using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using Service.Interfaces;
using Service.Models.AppSettings;
using Service.Services;
using Service.Services.Auth;
using System;
using System.Security.Authentication;
using System.Text;
using System.Xml.Xsl;

var builder = WebApplication.CreateBuilder(args);

var jwtTokenConfig = builder.Configuration.GetSection("jwtTokenConfig").Get<JwtTokenConfig>();
builder.Services.AddSingleton(jwtTokenConfig);

var connectionStrings = builder.Configuration.GetSection("ConnectionStrings").Get<ConnectionStrings>();
builder.Services.AddSingleton(connectionStrings);

// Add services to the container.
var accessTokenKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtTokenConfig.Secret));
var refreshTokenKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtTokenConfig.RefreshTokenSecret));

// Add authentication services
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtTokenConfig.Issuer,
        ValidAudience = jwtTokenConfig.Audience,
        IssuerSigningKey = accessTokenKey
    };
});


MongoClientSettings settings = MongoClientSettings.FromUrl(
  new MongoUrl(connectionStrings.CarDB)
);
settings.SslSettings = new SslSettings() { EnabledSslProtocols = SslProtocols.Tls12 };
var mongoClient = new MongoClient(settings);
builder.Services.AddSingleton<IMongoClient>(s => mongoClient);
builder.Services.AddScoped(s => s.GetRequiredService<IMongoClient>().GetDatabase("CarTyre"));

builder.Services.AddCors(c =>
{
    c.AddPolicy("AllowSpecificOrigin",
        b => b
            .AllowCredentials()
            .WithOrigins(builder.Configuration.GetValue<string>("AllowedOrigins").Split(","))
            .AllowAnyHeader()
            .AllowAnyMethod()
        );
});

builder.Services.AddScoped<IAuthService, AuthService>()
                .AddScoped<IPasswordHasher, PasswordHasher>()
                .AddScoped<ITokenService, TokenService>()
                .AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Tyre_API", Version = "v1" });
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Tyre_API v1"));
}

app.UseHttpsRedirection();

app.UseCors("AllowSpecificOrigin");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
