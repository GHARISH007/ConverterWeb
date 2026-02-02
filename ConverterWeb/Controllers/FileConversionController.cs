using Microsoft.AspNetCore.Mvc;
using ConverterWeb.Models;
using ConverterWeb.Services;
using System.IO;

namespace ConverterWeb.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileConversionController : ControllerBase
    {
        private readonly IFileConversionService _conversionService;
        private readonly ILogger<FileConversionController> _logger;

        public FileConversionController(IFileConversionService conversionService, ILogger<FileConversionController> logger)
        {
            _conversionService = conversionService;
            _logger = logger;
        }

                    [HttpPost("convert")]
                    public async Task<IActionResult> ConvertFile([FromForm] ConversionRequest request)
                    {
                        if (request.File == null || request.File.Length == 0)
                            return BadRequest(new { success = false, message = "No file uploaded" });

                        if (string.IsNullOrEmpty(request.ConversionType))
                            return BadRequest(new { success = false, message = "Conversion type not specified" });

                        var fileName = request.File.FileName ?? string.Empty;
                        var conversionType = request.ConversionType.ToLowerInvariant();

                        _logger.LogInformation("Starting conversion {ConversionType} for {FileName} (ContentType={ContentType})", conversionType, fileName, request.File.ContentType);

                        ConversionResponse result;

                        try
                        {
                            // Image conversions
                            if (conversionType.StartsWith("img-") || conversionType == "compress-img")
                            {
                                if (!IsImageFile(fileName))
                                    return BadRequest(new { success = false, message = "Selected conversion requires an image file" });

                                result = conversionType switch
                                {
                                    "img-to-pdf" => await _conversionService.ConvertImageToPdfAsync(request),
                                    "img-to-jpeg" => await _conversionService.ConvertImageFormatAsync(request, "jpeg"),
                                    "img-to-png" => await _conversionService.ConvertImageFormatAsync(request, "png"),
                                    "img-to-webp" => await _conversionService.ConvertImageFormatAsync(request, "webp"),
                                    "img-to-avif" => await _conversionService.ConvertImageFormatAsync(request, "avif"),
                                    "img-to-ico" => await _conversionService.ConvertImageFormatAsync(request, "ico"),
                                    "compress-img" => await _conversionService.CompressImageAsync(request),
                                    _ => new ConversionResponse { Success = false, Message = "Invalid image conversion type" }
                                };
                            }
                            // PDF conversions
                            else if (conversionType.StartsWith("pdf-"))
                            {
                                if (!IsPdf(fileName))
                                    return BadRequest(new { success = false, message = "Selected conversion requires a PDF file" });

                                result = conversionType switch
                                {
                                    "pdf-to-word" => await _conversionService.ConvertPdfToWordAsync(request),
                                    _ => new ConversionResponse { Success = false, Message = "Invalid PDF conversion type" }
                                };
                            }
                            // Excel conversions
                            else if (conversionType.StartsWith("excel-"))
                            {
                                if (!IsExcel(fileName))
                                    return BadRequest(new { success = false, message = "Selected conversion requires an Excel file" });

                                result = conversionType switch
                                {
                                    "excel-to-pdf" => await _conversionService.ConvertExcelToPdfAsync(request),
                                    _ => new ConversionResponse { Success = false, Message = "Invalid Excel conversion type" }
                                };
                            }
                            // Word conversions
                            else if (conversionType.StartsWith("word-"))
                            {
                                if (!IsWord(fileName))
                                    return BadRequest(new { success = false, message = "Selected conversion requires a Word file" });

                                result = conversionType switch
                                {
                                    "word-to-pdf" => await _conversionService.ConvertWordToPdfAsync(request),
                                    _ => new ConversionResponse { Success = false, Message = "Invalid Word conversion type" }
                                };
                            }
                            else
                            {
                                return BadRequest(new { success = false, message = "Unsupported conversion type" });
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Conversion failed for {ConversionType} on file {FileName}", conversionType, fileName);
                            return StatusCode(500, new { success = false, message = "An error occurred during conversion" });
                        }

                        if (!result.Success)
                            return BadRequest(new { success = false, message = result.Message });

                        return File(result.Data, result.ContentType, result.FileName);
                    }

        [HttpPost("batch-convert")]
        public async Task<IActionResult> BatchConvert([FromForm] BatchConversionRequest request)
        {
            try
            {
                if (request.Files == null || !request.Files.Any())
                {
                    return BadRequest(new { success = false, message = "No files uploaded" });
                }

                if (string.IsNullOrEmpty(request.ConversionType))
                {
                    return BadRequest(new { success = false, message = "Conversion type not specified" });
                }

                var results = await _conversionService.ProcessBatchConversionAsync(request);

                // Return a ZIP file containing all converted files
                var zipStream = CreateZipFile(results);
                var zipFileName = "converted_files.zip";

                return File(zipStream, "application/zip", zipFileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during batch file conversion");
                return StatusCode(500, new { success = false, message = "An error occurred during batch conversion" });
            }
        }

        private MemoryStream CreateZipFile(List<ConversionResponse> results)
        {
            var zipStream = new MemoryStream();
            
            using (var archive = new System.IO.Compression.ZipArchive(zipStream, System.IO.Compression.ZipArchiveMode.Create, true))
            {
                foreach (var result in results.Where(r => r.Success && r.Data != null))
                {
                    var entry = archive.CreateEntry(result.FileName);
                    using (var entryStream = entry.Open())
                    {
                        entryStream.Write(result.Data, 0, result.Data.Length);
                    }
                }
            }

            zipStream.Position = 0;
            return zipStream;
        }

        private bool IsImageFile(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return false;

            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            return ext == ".jpg" || ext == ".jpeg" || ext == ".jfif" || ext == ".jif" || ext == ".png" || ext == ".gif" || ext == ".bmp" || ext == ".webp" || ext == ".ico" || ext == ".avif";
        }

        private bool IsPdf(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return false;

            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            return ext == ".pdf";
        }

        private bool IsExcel(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return false;

            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            return ext == ".xls" || ext == ".xlsx";
        }

        private bool IsWord(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return false;

            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            return ext == ".doc" || ext == ".docx";
        }

        [HttpGet("supported-formats")]
        public IActionResult GetSupportedFormats()
        {
            var formats = new
            {
                // include jfif/jif as common jpeg variants
                imageInput = new[] { "jpg", "jpeg", "jfif", "jif", "png", "gif", "bmp", "webp", "ico", "avif" },
                imageOutput = new[] { "jpg", "jpeg", "png", "webp", "ico", "avif" },
                documentInput = new[] { "pdf", "xls", "xlsx", "doc", "docx" },
                documentOutput = new[] { "docx", "pdf" },
                conversionTypes = new[]
                {
                    "img-to-pdf",
                    "pdf-to-word",
                    "excel-to-pdf",
                    "img-to-jpeg",
                    "img-to-png",
                    "img-to-webp",
                    "img-to-avif",
                    "img-to-ico",
                    "compress-img",
                    "word-to-pdf"
                }
            };

            return Ok(formats);
        }
                    [HttpGet("conversion-options")]
            public IActionResult GetConversionOptions([FromQuery] string fileName)
            {
            if (string.IsNullOrEmpty(fileName))
            return BadRequest("File name required");


            var ext = Path.GetExtension(fileName).ToLower();


            if (ext == ".pdf")
            {
                return Ok(new[]
                {
                    "pdf-to-word"
                });
            }

            if (ext == ".xls" || ext == ".xlsx")
            {
                return Ok(new[]
                {
                    "excel-to-pdf"
                });
            }

            if (ext == ".doc" || ext == ".docx")
            {
                return Ok(new[]
                {
                    "word-to-pdf"
                });
            }


            if (ext == ".jpg" || ext == ".jpeg" || ext == ".png" ||
            ext == ".bmp" || ext == ".gif" || ext == ".webp" || ext == ".ico")
            {
            return Ok(new[]
            {
            "img-to-pdf",
            "img-to-jpeg",
            "img-to-png",
            "img-to-webp",
            "img-to-ico",
            "compress-img"
            });
            }


            return Ok(Array.Empty<string>());
            }
    }
}