import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosticService } from '../../services/diagnostic.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-upload-container">
      <h3>Upload Diagnostic Log File</h3>
      
      <div class="upload-area" 
           (dragover)="onDragOver($event)" 
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           [class.dragover]="isDragOver"
           (click)="fileInput.click()">
        
        <div class="upload-content">
          <div class="upload-icon">📁</div>
          <p class="upload-text">
            <strong>Click to browse</strong> or drag and drop your diagnostic log file here
          </p>
          <p class="upload-hint">
            Supported formats: .txt, .log (Max size: 50MB)
          </p>
        </div>
        
        <input 
          #fileInput
          type="file" 
          accept=".txt,.log"
          (change)="onFileSelected($event)"
          style="display: none;"
        >
      </div>
      
      <div class="upload-status" *ngIf="uploadStatus">
        <div class="status-message" [class]="uploadStatus.type">
          <span class="status-icon">
            {{ uploadStatus.type === 'success' ? '✅' : uploadStatus.type === 'error' ? '❌' : '⏳' }}
          </span>
          {{ uploadStatus.message }}
        </div>
      </div>
      
      <div class="upload-actions" *ngIf="selectedFile">
        <button class="btn btn-primary" (click)="uploadFile()" [disabled]="isUploading">
          {{ isUploading ? 'Uploading...' : 'Upload File' }}
        </button>
        <button class="btn btn-secondary" (click)="clearFile()">
          Clear
        </button>
      </div>
    </div>
  `,
  styles: [`
    .file-upload-container {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .file-upload-container h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 1.2rem;
    }

    .upload-area {
      border: 2px dashed #dee2e6;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
    }

    .upload-area:hover {
      border-color: #007bff;
      background-color: #f8f9fa;
    }

    .upload-area.dragover {
      border-color: #007bff;
      background-color: #e3f2fd;
      transform: scale(1.02);
    }

    .upload-content {
      pointer-events: none;
    }

    .upload-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }

    .upload-text {
      margin: 0 0 10px 0;
      color: #495057;
      font-size: 16px;
    }

    .upload-hint {
      margin: 0;
      color: #6c757d;
      font-size: 14px;
    }

    .upload-status {
      margin-top: 15px;
    }

    .status-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 15px;
      border-radius: 4px;
      font-size: 14px;
    }

    .status-message.success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status-message.error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .status-message.info {
      background-color: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .status-icon {
      font-size: 16px;
    }

    .upload-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-primary:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    @media (max-width: 768px) {
      .upload-area {
        padding: 30px 15px;
      }

      .upload-icon {
        font-size: 36px;
      }

      .upload-text {
        font-size: 14px;
      }

      .upload-actions {
        flex-direction: column;
      }
    }
  `]
})
export class FileUploadComponent {
  @Output() fileUpload = new EventEmitter<string>();

  selectedFile: File | null = null;
  isDragOver = false;
  isUploading = false;
  uploadStatus: { type: 'success' | 'error' | 'info'; message: string } | null = null;

  constructor(private diagnosticService: DiagnosticService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File): void {
    // Validate file type
    if (!file.name.match(/\.(txt|log)$/i)) {
      this.showStatus('error', 'Please select a valid .txt or .log file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      this.showStatus('error', 'File size must be less than 50MB');
      return;
    }

    this.selectedFile = file;
    this.showStatus('info', `Selected file: ${file.name} (${this.formatFileSize(file.size)})`);
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.showStatus('info', 'Uploading file...');

    this.diagnosticService.uploadFile(this.selectedFile).subscribe({
      next: (response) => {
        if (response.success) {
          this.showStatus('success', response.message || `File "${this.selectedFile?.name}" uploaded successfully`);
          this.fileUpload.emit('File uploaded successfully');
          this.selectedFile = null;
        } else {
          this.showStatus('error', response.message || 'Upload failed');
        }
        this.isUploading = false;
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.showStatus('error', 'Failed to upload file. Please try again.');
        this.isUploading = false;
      }
    });
  }

  clearFile(): void {
    this.selectedFile = null;
    this.uploadStatus = null;
  }

  private showStatus(type: 'success' | 'error' | 'info', message: string): void {
    this.uploadStatus = { type, message };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 