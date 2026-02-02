// Modern File Converter Application
class FileConverterApp {
    constructor() {
        this.files = [];
        this.dimensionUpdateTimeout = null;
        this.initElements();
        this.bindEvents();
        this.setupDragAndDrop();
    }

    initElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.browseBtn = document.getElementById('browseBtn');
        this.filePreview = document.getElementById('filePreview');
        this.previewGrid = document.getElementById('previewGrid');
        this.convertType = document.getElementById('convertType');
        this.imageSettings = document.getElementById('imageSettings');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        this.oneClickCompression = document.getElementById('oneClickCompression');
        this.imgWidth = document.getElementById('imgWidth');
        this.imgHeight = document.getElementById('imgHeight');
        this.maintainRatio = document.getElementById('maintainRatio');
        this.imgDpi = document.getElementById('imgDpi');
        this.resetBtn = document.getElementById('resetBtn');
        this.convertBtn = document.getElementById('convertBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.resultFiles = document.getElementById('resultFiles');
        this.toastContainer = document.getElementById('toastContainer');
    }

    bindEvents() {
        this.browseBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
        this.convertType.addEventListener('change', (e) => this.handleConvertTypeChange(e.target.value));
        this.qualitySlider.addEventListener('input', (e) => this.updateQualityValue(e.target.value));
        this.oneClickCompression.addEventListener('change', (e) => this.handleOneClickCompression(e.target.checked));
        this.maintainRatio.addEventListener('change', (e) => this.toggleAspectRatio(e.target.checked));
        this.resetBtn.addEventListener('click', () => this.resetForm());
        this.convertBtn.addEventListener('click', () => this.startConversion());

        // Real-time dimension updates
        this.imgWidth.addEventListener('input', (e) => this.updateDimensions('width', e.target.value));
        this.imgHeight.addEventListener('input', (e) => this.updateDimensions('height', e.target.value));
    }

    setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.remove('drag-over');
            }, false);
        });

        this.uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFileSelect(files);
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFileSelect(selectedFiles) {
        this.files = Array.from(selectedFiles);
        this.displayFilePreviews();
        this.populateConversionOptions();
        this.showFilePreview();
    }

    displayFilePreviews() {
        this.previewGrid.innerHTML = '';

        // Process files with a small delay between each to prevent resource overload
        this.files.forEach((file, index) => {
            setTimeout(() => {
                this.createPreviewItem(file, index);
            }, index * 50); // 50ms delay between each file
        });
    }

    createPreviewItem(file, index) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';

        const fileName = file.name;
        const fileType = this.getFileTypeFromFile(file);

        if (fileType === 'image') {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="${fileName}">
                    <div class="file-info">${fileName}</div>
                    <small class="file-size">${this.formatFileSize(file.size)}</small>
                    <button class="remove-btn" onclick="app.removeFile(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            };
            reader.onerror = () => {
                // Handle read error
                previewItem.innerHTML = `
                    <i class="fas fa-file-image"></i>
                    <div class="file-info">${fileName}</div>
                    <small class="file-size">${this.formatFileSize(file.size)}</small>
                    <div class="error">Preview failed</div>
                    <button class="remove-btn" onclick="app.removeFile(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            previewItem.innerHTML = `
                <i class="fas fa-file ${this.getFileIconClass(file.type)}"></i>
                <div class="file-info">${fileName}</div>
                <small class="file-size">${this.formatFileSize(file.size)}</small>
                <button class="remove-btn" onclick="app.removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }

        this.previewGrid.appendChild(previewItem);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileIconClass(fileType) {
        if (fileType.includes('pdf')) return 'fa-file-pdf';
        if (fileType.includes('word')) return 'fa-file-word';
        if (fileType.includes('excel') || fileType.includes('sheet')) return 'fa-file-excel';
        if (fileType.includes('image')) return 'fa-file-image';
        if (fileType.includes('zip') || fileType.includes('compressed')) return 'fa-file-archive';
        return 'fa-file';
    }

    showFilePreview() {
        this.filePreview.style.display = 'block';
        this.uploadArea.style.display = 'none';
    }

    handleConvertTypeChange(value) {
        if (value.startsWith('img-') || value === 'compress-img') {
            this.imageSettings.style.display = 'block';
        } else {
            this.imageSettings.style.display = 'none';
        }
    }

    updateQualityValue(value) {
        this.qualityValue.textContent = `${value}%`;
    }

    handleOneClickCompression(checked) {
        if (checked) {
            this.qualitySlider.value = 50;
            this.updateQualityValue(50);
        }
    }

    toggleAspectRatio(checked) {
        if (checked && this.imgWidth.value && this.imgHeight.value) {
            // Maintain aspect ratio logic would go here
        }
    }

    updateDimensions(type, value) {
        if (this.maintainRatio.checked && this.files.length > 0 && this.files[0].type.startsWith('image/')) {
            // Add a small delay to prevent rapid successive calls
            if (this.dimensionUpdateTimeout) {
                clearTimeout(this.dimensionUpdateTimeout);
            }

            this.dimensionUpdateTimeout = setTimeout(() => {
                const img = new Image();
                const objectUrl = URL.createObjectURL(this.files[0]);

                img.onload = () => {
                    const originalWidth = img.width;
                    const originalHeight = img.height;

                    // Clean up the object URL immediately after loading
                    URL.revokeObjectURL(objectUrl);

                    if (type === 'width' && value) {
                        const ratio = originalHeight / originalWidth;
                        this.imgHeight.value = Math.round(value * ratio);
                    } else if (type === 'height' && value) {
                        const ratio = originalWidth / originalHeight;
                        this.imgWidth.value = Math.round(value * ratio);
                    }
                };

                // Set error handler to clean up on failure
                img.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                };

                img.src = objectUrl;
            }, 300); // 300ms debounce delay
        }
    }

    removeFile(index) {
        // Clear any pending dimension updates
        if (this.dimensionUpdateTimeout) {
            clearTimeout(this.dimensionUpdateTimeout);
            this.dimensionUpdateTimeout = null;
        }

        this.files.splice(index, 1);
        this.displayFilePreviews();
        this.populateConversionOptions();

        if (this.files.length === 0) {
            this.filePreview.style.display = 'none';
            this.uploadArea.style.display = 'block';
            this.convertType.innerHTML = '<option value="">-- Select Conversion Type --</option>';
        }
    }

    populateConversionOptions() {
        const conversionTypeSelect = this.convertType;
        conversionTypeSelect.innerHTML = '<option value="">-- Select Conversion Type --</option>';

        if (this.files.length === 0) return;

        // Determine file types (use MIME type when available, fall back to extension)
        const fileTypes = this.files.map(file => this.getFileTypeFromFile(file));
        const uniqueFileTypes = [...new Set(fileTypes)];

        // Populate conversion options based on file types
        uniqueFileTypes.forEach(fileType => {
            const options = this.getConversionOptionsForType(fileType);
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                conversionTypeSelect.appendChild(optionElement);
            });
        });
    }

    getFileType(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
        return 'unknown';
    }

    getFileTypeFromFile(file) {
        // Prefer MIME type when available
        if (file.type) {
            const mime = file.type.toLowerCase();
            if (mime.startsWith('image/')) return 'image';
            if (mime.includes('pdf')) return 'pdf';
            if (mime.includes('word') || mime.includes('document')) return 'word';
            if (mime.includes('excel') || mime.includes('spreadsheet')) return 'excel';
        }

        // Fallback to file extension if MIME type is empty (some OS file pickers omit it)
        const name = file.name.toLowerCase();
        if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.jfif') || name.endsWith('.jif') || name.endsWith('.png') || name.endsWith('.gif') || name.endsWith('.bmp') || name.endsWith('.webp') || name.endsWith('.ico')) return 'image';
        if (name.endsWith('.pdf')) return 'pdf';
        if (name.endsWith('.doc') || name.endsWith('.docx')) return 'word';
        if (name.endsWith('.xls') || name.endsWith('.xlsx')) return 'excel';

        return 'unknown';
    }

    getConversionOptionsForType(fileType) {
        const options = [];

        switch (fileType) {
            case 'image':
                options.push(
                    { value: 'img-to-pdf', text: 'Image to PDF' },
                    { value: 'img-to-jpeg', text: 'Image to JPEG' },
                    { value: 'img-to-png', text: 'Image to PNG' },
                    { value: 'img-to-webp', text: 'Image to WEBP' },
                    { value: 'img-to-avif', text: 'Image to AVIF' },
                    { value: 'img-to-ico', text: 'Image to ICO' },
                    { value: 'compress-img', text: 'Compress Image' }
                );
                break;
            case 'pdf':
                options.push(
                    { value: 'pdf-to-word', text: 'PDF to Word' }
                );
                break;
            case 'word':
                options.push(
                    { value: 'word-to-pdf', text: 'Word to PDF' }
                );
                break;
            case 'excel':
                options.push(
                    { value: 'excel-to-pdf', text: 'Excel to PDF' }
                );
                break;
        }

        return options;
    }

    cleanup() {
        // Clear any pending timeouts
        if (this.dimensionUpdateTimeout) {
            clearTimeout(this.dimensionUpdateTimeout);
            this.dimensionUpdateTimeout = null;
        }

        // Clear file references
        this.files = [];
    }

    resetForm() {
        this.cleanup();

        this.fileInput.value = '';
        this.previewGrid.innerHTML = '';
        this.convertType.innerHTML = '<option value="">-- Select Conversion Type --</option>';
        this.imageSettings.style.display = 'none';
        this.qualitySlider.value = 80;
        this.updateQualityValue(80);
        this.oneClickCompression.checked = false;
        this.imgWidth.value = '';
        this.imgHeight.value = '';
        this.imgDpi.value = 300;
        this.maintainRatio.checked = true;
        this.filePreview.style.display = 'none';
        this.uploadArea.style.display = 'block';
        this.progressContainer.style.display = 'none';
        this.resultsContainer.style.display = 'none';
    }

    async startConversion() {
        if (this.files.length === 0) {
            this.showToast('Please select files to convert', 'error');
            return;
        }

        if (!this.convertType.value) {
            this.showToast('Please select a conversion type', 'error');
            return;
        }

        // Disable buttons during conversion
        this.convertBtn.disabled = true;
        this.convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';

        this.showProgress(true);

        try {
            if (this.files.length === 1) {
                await this.convertSingleFile();
            } else {
                await this.convertBatchFiles();
            }
        } catch (error) {
            this.showToast('Conversion failed. Please try again.', 'error');
            console.error('Conversion error:', error);
        } finally {
            this.showProgress(false);
            // Re-enable buttons
            this.convertBtn.disabled = false;
            this.convertBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Convert Now';
        }
    }

    async convertSingleFile() {
        const formData = new FormData();
        formData.append('file', this.files[0]);
        formData.append('conversionType', this.convertType.value);
        formData.append('quality', this.qualitySlider.value);
        formData.append('oneClickCompression', this.oneClickCompression.checked);

        if (this.imgWidth.value) formData.append('width', this.imgWidth.value);
        if (this.imgHeight.value) formData.append('height', this.imgHeight.value);
        formData.append('dpi', this.imgDpi.value);
        formData.append('maintainAspectRatio', this.maintainRatio.checked);

        try {
            this.updateProgress(10); // Initial progress
            this.progressText.textContent = 'Preparing file...';

            const response = await this.uploadWithProgress(
                formData,
                '/api/FileConversion/convert',
                (progress) => {
                    this.updateProgress(10 + (progress * 0.8)); // Scale to 10-90%
                    this.progressText.textContent = `Converting... ${Math.round(10 + (progress * 0.8))}%`;
                }
            );

            this.updateProgress(95);
            this.progressText.textContent = 'Finalizing...';

            // Prefer server-provided filename header
            const serverFileName = response.name || response.fileName || null;
            const downloadName = serverFileName || 'converted_file';

            // Get original file size for comparison
            const originalFileSize = this.files[0].size;
            const compressedFileSize = (response.blob || response).size;

            // Show size comparison before download
            const sizeComparison = this.getSizeComparisonString(originalFileSize, compressedFileSize);

            // Check if compressed file is larger than original
            if (compressedFileSize > originalFileSize && this.convertType.value === 'compress-img') {
                this.updateProgress(100);
                this.progressText.textContent = 'Completed!';
                this.showToast(`Compression resulted in larger file (${sizeComparison}). No download performed.`, 'warning');
                return; // Skip download if compressed file is larger
            }

            this.downloadBlob(response.blob || response, downloadName);
            this.updateProgress(100);
            this.progressText.textContent = 'Completed!';
            this.showToast(`File converted successfully! ${sizeComparison}`, 'success');
        } catch (error) {
            this.showToast(error.message || 'Conversion failed', 'error');
            throw error;
        }
    }

    async convertBatchFiles() {
        const formData = new FormData();

        this.files.forEach(file => {
            formData.append('files', file);
        });

        formData.append('conversionType', this.convertType.value);
        formData.append('quality', this.qualitySlider.value);
        formData.append('oneClickCompression', this.oneClickCompression.checked);

        if (this.imgWidth.value) formData.append('width', this.imgWidth.value);
        if (this.imgHeight.value) formData.append('height', this.imgHeight.value);
        formData.append('dpi', this.imgDpi.value);
        formData.append('maintainAspectRatio', this.maintainRatio.checked);

        try {
            this.updateProgress(5); // Initial progress
            this.progressText.textContent = `Preparing ${this.files.length} files...`;

            const response = await this.uploadWithProgress(
                formData,
                '/api/FileConversion/batch-convert',
                (progress) => {
                    this.updateProgress(5 + (progress * 0.85)); // Scale to 5-90%
                    this.progressText.textContent = `Converting ${this.files.length} files... ${Math.round(5 + (progress * 0.85))}%`;
                }
            );

            this.updateProgress(95);
            this.progressText.textContent = 'Creating archive...';

            // Response can be either a Blob or an object { blob, fileName }
            const resBlob = (response && response.blob) ? response.blob : response;
            const fileName = (response && response.fileName) ? response.fileName : 'converted_files.zip';

            // Validate blob before trying to createObjectURL
            if (!resBlob || typeof resBlob.size !== 'number' || resBlob.size === 0) {
                this.showToast('Server returned an empty file. Conversion failed.', 'error');
                throw new Error('Empty or invalid response from server');
            }

            this.downloadBlob(resBlob, fileName);
            this.updateProgress(100);
            this.progressText.textContent = 'Completed!';
            this.showToast(`${this.files.length} files converted successfully!`, 'success');
        } catch (error) {
            this.showToast(error.message || 'Batch conversion failed', 'error');
            throw error;
        }
    }

    downloadBlob(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    updateProgress(percent) {
        this.progressFill.style.width = `${percent}%`;
        this.progressText.textContent = `Processing... ${Math.round(percent)}%`;
    }

    async uploadWithProgress(formData, endpoint, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    onProgress(Math.round(percentComplete));
                }
            });

            xhr.addEventListener('load', async () => {
                const resBlob = xhr.response;
                const contentType = (xhr.getResponseHeader('content-type') || '').toLowerCase();

                if (xhr.status >= 200 && xhr.status < 300) {
                    // Empty response
                    if (!resBlob || typeof resBlob.size !== 'number' || resBlob.size === 0) {
                        reject(new Error('Empty response received from server'));
                        return;
                    }

                    // If server returned JSON (error payload) in a blob, parse and reject
                    if (contentType.includes('application/json') || contentType.includes('text/')) {
                        try {
                            const text = await resBlob.text();
                            const json = JSON.parse(text);
                            const msg = json && (json.message || json.Message || json.error || json.errors) ? (json.message || json.Message || json.error || json.errors) : text;
                            reject(new Error(msg || 'Server returned an error'));
                            return;
                        } catch (e) {
                            reject(new Error('Unexpected server response'));
                            return;
                        }
                    }

                    // Successful binary response (PDF / ZIP / image)
                    const cdHeader = xhr.getResponseHeader('content-disposition') || xhr.getResponseHeader('x-filename');
                    if (cdHeader) {
                        let name = null;

                        // RFC 5987: filename*=UTF-8''encoded%20name.jpg
                        const starMatch = cdHeader.match(/filename\*\s*=\s*(?:UTF-8'')?([^;\n\r]+)/i);
                        if (starMatch && starMatch[1]) {
                            const encoded = starMatch[1].trim().replace(/^"|"$/g, '');
                            try { name = decodeURIComponent(encoded); } catch (e) { name = encoded; }
                        }

                        if (!name) {
                            const fnMatch = cdHeader.match(/filename\s*=\s*"?([^";]+)"?/i);
                            if (fnMatch && fnMatch[1]) name = fnMatch[1].trim();
                        }

                        if (name) { resolve({ blob: resBlob, fileName: name }); return; }
                    }

                    resolve(resBlob);
                } else {
                    // Non-success status: try to read JSON error body and surface message
                    try {
                        if (resBlob && typeof resBlob.text === 'function') {
                            const text = await resBlob.text();
                            try {
                                const json = JSON.parse(text);
                                const msg = json && (json.message || json.Message || json.error || json.errors) ? (json.message || json.Message || json.error || json.errors) : text;
                                reject(new Error(msg || `HTTP ${xhr.status}: ${xhr.statusText}`));
                                return;
                            } catch (e) {
                                // Not JSON
                            }
                        }
                    } catch (ex) {
                        // ignore
                    }

                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error occurred'));
            });

            xhr.open('POST', endpoint);
            xhr.responseType = 'blob';
            xhr.send(formData);
        });
    }

    showProgress(show) {
        this.progressContainer.style.display = show ? 'block' : 'none';
    }

    showResults() {
        this.resultsContainer.style.display = 'block';
        this.resultFiles.innerHTML = '';

        this.files.forEach((file, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';

            const originalName = file.name;
            const extension = this.getOutputExtension();
            const newName = originalName.substring(0, originalName.lastIndexOf('.')) + extension;

            resultItem.innerHTML = `
                <i class="fas fa-file-${this.getResultIcon()}"></i>
                <div>${newName}</div>
                <button class="download-btn" onclick="app.downloadFile('${newName}')">
                    <i class="fas fa-download"></i> Download
                </button>
            `;

            this.resultFiles.appendChild(resultItem);
        });
    }

    getOutputExtension() {
        const convertType = this.convertType.value;
        switch (convertType) {
            case 'img-to-pdf': return '.pdf';
            case 'pdf-to-word': return '.docx';
            case 'excel-to-pdf': return '.pdf';
            case 'img-to-jpeg': return '.jpg';
            case 'img-to-png': return '.png';
            case 'img-to-webp': return '.webp';
            case 'img-to-ico': return '.ico';
            case 'img-to-avif': return '.avif';
            case 'compress-img': return '_compressed' + file.name.substring(file.name.lastIndexOf('.'));
            default: return '.converted';
        }
    }

    getResultIcon() {
        const convertType = this.convertType.value;
        switch (convertType) {
            case 'img-to-pdf': return 'pdf';
            case 'pdf-to-word': return 'word';
            case 'excel-to-pdf': return 'pdf';
            case 'img-to-jpeg':
            case 'img-to-png':
            case 'img-to-webp':
            case 'img-to-ico':
            case 'compress-img': return 'image';
            default: return 'download';
        }
    }

    getSizeComparisonString(originalSize, newSize) {
        const originalSizeStr = this.formatFileSize(originalSize);
        const newSizeStr = this.formatFileSize(newSize);
        const percentage = ((newSize - originalSize) / originalSize * 100).toFixed(1);

        if (percentage > 0) {
            return `(Size increased: ${originalSizeStr} → ${newSizeStr} [${percentage}%])`;
        } else if (percentage < 0) {
            return `(Size reduced: ${originalSizeStr} → ${newSizeStr} [${Math.abs(percentage)}%])`;
        } else {
            return `(Size unchanged: ${originalSizeStr})`;
        }
    }

    downloadFile(filename) {
        // In a real application, this would trigger the actual file download
        // For now, we'll just show a success message
        this.showToast(`Download started: ${filename}`, 'info');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    getToastIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'info': return 'fa-info-circle';
            default: return 'fa-info-circle';
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FileConverterApp();
});