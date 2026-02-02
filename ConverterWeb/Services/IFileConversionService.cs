using ConverterWeb.Models;

namespace ConverterWeb.Services
{
    public interface IFileConversionService
    {
        Task<ConversionResponse> ConvertImageToPdfAsync(ConversionRequest request);
        Task<ConversionResponse> ConvertPdfToWordAsync(ConversionRequest request);
        Task<ConversionResponse> ConvertPdfToExcelAsync(ConversionRequest request);
        Task<ConversionResponse> ConvertExcelToPdfAsync(ConversionRequest request);
        Task<ConversionResponse> ConvertImageFormatAsync(ConversionRequest request, string targetFormat);
        Task<ConversionResponse> ConvertWordToPdfAsync(ConversionRequest request);
        Task<ConversionResponse> CompressImageAsync(ConversionRequest request);
        Task<List<ConversionResponse>> ProcessBatchConversionAsync(BatchConversionRequest request);
    }
}