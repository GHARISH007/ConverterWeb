using System.ComponentModel.DataAnnotations;

namespace ConverterWeb.Models
{
    public class ConversionRequest
    {
        public IFormFile? File { get; set; }
        public string? ConversionType { get; set; }
        public int Quality { get; set; } = 80;
        public bool OneClickCompression { get; set; } = false;
        public int? Width { get; set; }
        public int? Height { get; set; }
        public int Dpi { get; set; } = 300;
        public bool MaintainAspectRatio { get; set; } = true;
    }

    public class BatchConversionRequest
    {
        public List<IFormFile>? Files { get; set; }
        public string? ConversionType { get; set; }
        public int Quality { get; set; } = 80;
        public bool OneClickCompression { get; set; } = false;
        public int? Width { get; set; }
        public int? Height { get; set; }
        public int Dpi { get; set; } = 300;
        public bool MaintainAspectRatio { get; set; } = true;
    }

    public class ConversionResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? FileName { get; set; }
        public byte[]? Data { get; set; }
        public string? ContentType { get; set; }
    }
}