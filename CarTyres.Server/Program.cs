using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using Service.Interfaces;
using Service.Models.AppSettings;
using Service.Services;
using Service.Services.Auth;
using Services.Cache;
using StackExchange.Redis;
using System;
using System.Security.Authentication;
using System.Text;
using System.Xml.Xsl;

var builder = WebApplication.CreateBuilder(args);

var appSettings = builder.Configuration.GetSection("AppSettings").Get<AppSettings>();
builder.Services.AddSingleton(appSettings);

var jwtTokenConfig = builder.Configuration.GetSection("jwtTokenConfig").Get<JwtTokenConfig>();
builder.Services.AddSingleton(jwtTokenConfig);

var connectionStrings = builder.Configuration.GetSection("ConnectionStrings").Get<ConnectionStrings>();
builder.Services.AddSingleton(connectionStrings);

// Add services to the container.
var accessTokenKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtTokenConfig.Secret));

// Add authentication services
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = true;
    options.SaveToken = true;
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

// Add distributed cache service backed by Redis cache
builder.Services.AddSingleton<ICacheProvider>(provider =>
{
    var connectionString = connectionStrings.Redis; // Get Redis connection string from configuration
    return new CacheProvider(connectionString, appSettings); // Pass connection string and app settings to CacheProvider
});
// Connect to Redis
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect(connectionStrings.Redis));

// MongoDB client setup
MongoClientSettings settings = MongoClientSettings.FromUrl(new MongoUrl(connectionStrings.CarDB));
settings.SslSettings = new SslSettings() { EnabledSslProtocols = SslProtocols.Tls12 };
var mongoClient = new MongoClient(settings);
builder.Services.AddSingleton<IMongoClient>(s => mongoClient);
builder.Services.AddScoped(s => s.GetRequiredService<IMongoClient>().GetDatabase("CarTyre"));

builder.Services.AddCors(c =>
{
    c.AddPolicy("AllowSpecificOrigin", b =>
        b.AllowCredentials()
         .WithOrigins(builder.Configuration.GetValue<string>("AllowedOrigins").Split(","))
         .AllowAnyHeader()
         .AllowAnyMethod());
});

builder.Services
    //.AddSingleton<Services.Cache.ICacheProvider, Services.Cache.CacheProvider>()
    .AddSingleton<ICacheAppSettings>(appSettings)
    .AddScoped<ITokenService, TokenService>()
    .AddSingleton<IHttpContextAccessor, HttpContextAccessor>()   
    .AddScoped<IAuthService, AuthService>()
    .AddScoped<IPasswordHasher, PasswordHasher>()
    .AddScoped<IInventoryService, InventoryService>();

builder.Services.AddControllers();

// Swagger setup
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Tyre_API", Version = "v1" });
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline
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
