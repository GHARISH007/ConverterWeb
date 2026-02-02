using ConverterWeb.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Register code page provider for libraries (iTextSharp)
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddScoped<IFileConversionService, FileConversionService>();

builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAll",
		builder =>
		{
			builder.AllowAnyOrigin()
				   .AllowAnyMethod()
				   .AllowAnyHeader();
		});
});

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

// Serve static files (wwwroot)
app.UseStaticFiles();

// Redirect HTTP to HTTPS
app.UseHttpsRedirection();

// Apply CORS policy
app.UseCors("AllowAll");

// Authorization middleware
app.UseAuthorization();

// Map your API controllers
app.MapControllers();

// ✅ Serve index.html for root URL and any unmatched routes
app.MapFallbackToFile("index.html");

// Cloud Run port binding
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://*:{port}");

Console.WriteLine($"Server started on port {port}");

app.Run();
