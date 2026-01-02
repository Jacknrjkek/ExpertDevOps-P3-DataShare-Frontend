
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FileService } from '../../../services/file.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

/**
 * Composant de téléversement de fichier.
 * Gère la sélection de fichier, la barre de progression et l'envoi au serveur.
 */
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
  expirationTime = 1; // Par défaut: "Une journée" (1 jour)

  // US09 - Password Protection
  enablePassword = false;
  password = '';

  private fileService = inject(FileService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef); // Nécessaire pour forcer le rafraîchissement UI lors de l'upload

  /**
   * Ouvre la boîte de dialogue système pour choisir un fichier.
   */
  changeFile(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  /**
   * Formate la taille du fichier pour l'affichage (en Mo).
   */
  get fileSize(): string {
    if (this.currentFile) {
      return (this.currentFile.size / (1024 * 1024)).toFixed(1) + ' Mo';
    }
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      return (this.selectedFiles[0].size / (1024 * 1024)).toFixed(1) + ' Mo';
    }
    return '';
  }

  /**
   * Gestionnaire d'événement lors de la sélection d'un fichier.
   */
  selectFile(event: any): void {
    console.log('File selected event:', event);
    this.selectedFiles = event.target.files;
    console.log('Selected files:', this.selectedFiles);
    this.message = '';
    this.progress = 0;
    this.password = '';
    this.enablePassword = false;
  }

  /**
   * Lance l'upload du fichier sélectionné.
   * Gère les événements HTTP pour la barre de progression.
   */
  upload(): void {
    console.log('Upload method called');
    this.progress = 0;

    if (this.selectedFiles) {
      console.log('Files selected:', this.selectedFiles);
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        console.log('Processing file:', file.name);
        this.currentFile = file;

        const pwd = this.enablePassword && this.password ? this.password : undefined;

        if (this.enablePassword && (!this.password || this.password.length < 6)) {
          this.message = 'Le mot de passe doit contenir au moins 6 caractères.';
          this.currentFile = undefined;
          return;
        }

        // Appel au service
        this.fileService.upload(this.currentFile, this.expirationTime, pwd).subscribe({
          next: (event: any) => {
            console.log('Upload event:', event);

            // Calcul de la progression
            if (event.type === HttpEventType.UploadProgress) {
              if (event.total) {
                this.progress = Math.round((100 * event.loaded) / event.total);
                this.cd.detectChanges(); // Force UI update
              }

              // Fin de l'upload
            } else if (event instanceof HttpResponse) {
              console.log('Upload complete');
              this.progress = 100;
              this.message = event.body.message || 'Fichier téléversé avec succès !';
              this.cd.detectChanges();

              // Redirection vers la liste après confirmation visuelle
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
