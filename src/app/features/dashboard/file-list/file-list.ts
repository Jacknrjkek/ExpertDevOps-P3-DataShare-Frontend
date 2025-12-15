import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../../../services/file.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-list.html',
  styleUrl: './file-list.scss',
})
export class FileList implements OnInit {
  files: any[] = [];
  message = '';
  private fileService = inject(FileService);

  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);


  filter: 'all' | 'active' | 'expired' = 'all';

  ngOnInit(): void {
    this.retrieveFiles();
  }

  setFilter(filter: 'all' | 'active' | 'expired'): void {
    this.filter = filter;
  }

  get filteredFiles(): any[] {
    const now = new Date();
    return this.files.filter(file => {
      const expirationDate = new Date(file.expirationDate);
      const isExpired = expirationDate < now;

      if (this.filter === 'active') return !isExpired;
      if (this.filter === 'expired') return isExpired;
      return true;
    });
  }

  isExpired(file: any): boolean {
    return new Date(file.expirationDate) < new Date();
  }

  getExpirationText(file: any): string {
    const expirationDate = new Date(file.expirationDate);
    const now = new Date();

    if (expirationDate < now) {
      return 'Expiré';
    }

    const diffTime = Math.abs(expirationDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'Expire demain';
    return `Expire dans ${diffDays} jours`;
  }

  retrieveFiles(): void {
    this.fileService.getFiles().subscribe({
      next: (data) => {
        this.files = data;
        this.cd.detectChanges();
      },
      error: (e) => console.error(e)
    });
  }

  fileToDeleteId: number | null = null;
  showDeleteModal = false;

  openDeleteModal(id: number): void {
    this.fileToDeleteId = id;
    this.showDeleteModal = true;
    this.cd.detectChanges();
  }

  confirmDelete(): void {
    if (this.fileToDeleteId) {
      this.fileService.deleteFile(this.fileToDeleteId).subscribe({
        next: (res) => {
          // 1. Close modal immediately
          this.cancelDelete();

          // 2. Update UI message (Safe check for null res from 204 No Content)
          this.message = (res && res.message) ? res.message : 'Fichier supprimé !';

          // 3. Refresh list
          this.retrieveFiles();

          // 4. Clear message after delay
          setTimeout(() => {
            this.message = '';
            this.cd.detectChanges();
          }, 3000);
        },
        error: (e) => {
          console.error('Delete error:', e);
          const errorMsg = e.error && e.error.message ? e.error.message : e.message;
          this.message = `Erreur (${e.status}): ${errorMsg}`;
          this.cd.detectChanges();
        }
      });
    } else {
      console.error('No ID to delete');
    }
  }

  cancelDelete(): void {
    this.fileToDeleteId = null;
    this.showDeleteModal = false;
    this.cd.detectChanges(); // Force UI to close modal
  }

  copyLink(token: string, event: Event): void {
    if (!token) return;

    const url = 'http://localhost:4200/share/' + token;
    navigator.clipboard.writeText(url).then(() => {
      // Button Feedback
      const button = event.target as HTMLButtonElement;
      const originalText = button.innerText;
      button.innerText = '✅ Copié !';
      button.classList.add('copied');

      this.message = 'Lien copié dans le presse-papier !';

      setTimeout(() => {
        button.innerText = originalText;
        button.classList.remove('copied');
        this.message = '';
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      this.message = 'Erreur lors de la copie du lien';
    });
  }
}
