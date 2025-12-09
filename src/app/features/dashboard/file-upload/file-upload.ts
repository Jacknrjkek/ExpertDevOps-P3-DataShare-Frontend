import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../../../services/file.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload {
  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';

  private fileService = inject(FileService);

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
    this.message = '';
    this.progress = 0;
  }

  upload(): void {
    this.progress = 0;

    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        this.currentFile = file;

        this.fileService.upload(this.currentFile).subscribe({
          next: (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.progress = Math.round((100 * event.loaded) / event.total);
            } else if (event instanceof HttpResponse) {
              this.message = event.body.message || 'Fichier téléversé avec succès !';
            }
          },
          error: (err: any) => {
            console.error('Upload Error:', err);
            this.progress = 0;
            if (err.error && err.error.message) {
              this.message = err.error.message;
            } else {
              this.message = 'Erreur lors du téléversement : ' + (err.message || 'Inconnue');
            }
            this.currentFile = undefined;
          },
        });
      }
    }
  }

  reset(): void {
    this.currentFile = undefined;
    this.selectedFiles = undefined;
    this.progress = 0;
    this.message = '';
  }
}
