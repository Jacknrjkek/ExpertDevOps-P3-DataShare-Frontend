
import { Component, inject, ChangeDetectorRef } from '@angular/core'; // Add ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router
import { FileService } from '../../../services/file.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload {
  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';
  expirationTime = 1; // Default "Une journée" (1 day) per mockup

  private fileService = inject(FileService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef); // Inject CD

  changeFile(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  get fileSize(): string {
    if (this.currentFile) {
      return (this.currentFile.size / (1024 * 1024)).toFixed(1) + ' Mo';
    }
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      return (this.selectedFiles[0].size / (1024 * 1024)).toFixed(1) + ' Mo';
    }
    return '';
  }

  selectFile(event: any): void {
    console.log('File selected event:', event);
    this.selectedFiles = event.target.files;
    console.log('Selected files:', this.selectedFiles);
    this.message = '';
    this.progress = 0;
  }

  upload(): void {
    console.log('Upload method called');
    this.progress = 0;

    if (this.selectedFiles) {
      console.log('Files selected:', this.selectedFiles);
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        console.log('Processing file:', file.name);
        this.currentFile = file;

        this.fileService.upload(this.currentFile, this.expirationTime).subscribe({
          next: (event: any) => {
            console.log('Upload event:', event);
            if (event.type === HttpEventType.UploadProgress) {
              if (event.total) {
                this.progress = Math.round((100 * event.loaded) / event.total);
                this.cd.detectChanges(); // Force UI update
              }
            } else if (event instanceof HttpResponse) {
              console.log('Upload complete');
              this.progress = 100; // Force 100%
              this.message = event.body.message || 'Fichier téléversé avec succès !';
              this.cd.detectChanges();

              // Redirect to files list after short delay
              setTimeout(() => {
                this.currentFile = undefined;
                this.router.navigate(['/files']);
              }, 1000);
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
            this.cd.detectChanges();
          },
        });
      } else {
        console.warn('File item(0) is null');
        this.message = "Erreur: Aucun fichier sélectionné";
      }
    } else {
      console.warn('No selectedFiles');
      this.message = "Erreur: Aucun fichier sélectionné";
    }
  }

  reset(): void {
    this.currentFile = undefined;
    this.selectedFiles = undefined;
    this.progress = 0;
    this.message = '';
  }
}
