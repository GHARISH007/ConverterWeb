using ConverterWeb.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Register code page provider for libraries (iTextSharp)
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

// Add services
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
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Swagger in development
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();

// ✅ Serve static UI
app.UseDefaultFiles();  // serves wwwroot/index.html at /
app.UseStaticFiles();   // serves other static files (CSS/JS/images)

// ✅ API controllers
app.MapControllers();

// ✅ Cloud Run PORT
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://*:{port}");
Console.WriteLine($"Server started on port {port}");

app.Run();
