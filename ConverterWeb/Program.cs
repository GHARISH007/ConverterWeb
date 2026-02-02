using ConverterWeb.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Register code page provider for libraries (iTextSharp) that require code page encodings
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

app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

// ✅ Default root endpoint so "/" URL works
app.MapGet("/", () => "🚀 Turbo File Converter API is running!");

// Map all your controllers
app.MapControllers();

// ✅ Listen on the Cloud Run PORT environment variable
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://*:{port}");

Console.WriteLine($"Server started on port {port}"); // optional logging for debugging

app.Run();
