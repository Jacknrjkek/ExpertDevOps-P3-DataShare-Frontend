
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FileService } from '../../../services/file.service';
import { StorageService } from '../../../services/storage.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

/**
 * Composant de téléversement de fichier anonyme (US07).
 * Accessible publiquement.
 */
@Component({
    selector: 'app-anonymous-upload',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './anonymous-upload.html',
    styleUrl: './anonymous-upload.scss',
})
export class AnonymousUploadComponent {
    selectedFiles?: FileList;
    currentFile?: File;
    progress = 0;
    message = '';
    expirationTime = 1; // Par défaut: "Une journée" (1 jour)
    shareToken: string | null = null; // Token à afficher après upload

    // US09 - Password Protection
    enablePassword = false;
    password = '';

    private fileService = inject(FileService);
    private storageService = inject(StorageService); // Inject StorageService
    private router = inject(Router);
    private cd = inject(ChangeDetectorRef);

    /**
     * Ouvre la boîte de dialogue système pour choisir un fichier.
     */
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
        this.selectedFiles = event.target.files;
        this.message = '';
        this.progress = 0;
        this.shareToken = null;
        this.password = '';
        this.enablePassword = false;
    }

    upload(): void {
        this.progress = 0;
        this.shareToken = null;

        if (this.selectedFiles) {
            const file: File | null = this.selectedFiles.item(0);

            if (file) {
                this.currentFile = file;
                const pwd = this.enablePassword && this.password ? this.password : undefined;

                if (this.enablePassword && (!this.password || this.password.length < 6)) {
                    this.message = 'Le mot de passe doit contenir au moins 6 caractères.';
                    this.currentFile = undefined;
                    return;
                }

                // Conditional Upload Logic
                const uploadObservable = this.storageService.isLoggedIn()
                    ? this.fileService.upload(this.currentFile, this.expirationTime, pwd)
                    : this.fileService.uploadAnonymous(this.currentFile, this.expirationTime, pwd);

                uploadObservable.subscribe({
                    next: (event: any) => {
                        if (event.type === HttpEventType.UploadProgress) {
                            if (event.total) {
                                this.progress = Math.round((100 * event.loaded) / event.total);
                                this.cd.detectChanges();
                            }
                        } else if (event instanceof HttpResponse) {
                            this.progress = 100;
                            this.message = event.body.message || 'Fichier téléversé avec succès !';

                            // Récupération du token de partage pour affichage immédiat
                            if (event.body.shareToken) {
                                this.shareToken = event.body.shareToken;
                            }

                            this.cd.detectChanges();
                        }
                    },
                    error: (err: any) => {
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
            }
        }
    }
}
