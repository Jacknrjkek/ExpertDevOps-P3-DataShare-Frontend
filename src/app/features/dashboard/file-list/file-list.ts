import { Component, inject, OnInit } from '@angular/core';
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

  ngOnInit(): void {
    this.retrieveFiles();
  }

  retrieveFiles(): void {
    this.fileService.getFiles().subscribe({
      next: (data) => {
        this.files = data;
      },
      error: (e) => console.error(e)
    });
  }

  deleteFile(id: number): void {
    this.fileService.deleteFile(id).subscribe({
      next: (res) => {
        this.message = res.message ? res.message : 'Fichier supprimé !';
        this.retrieveFiles();
      },
      error: (e) => console.error(e)
    });
  }

  copyLink(token: string): void {
    const url = 'http://localhost:4200/share/' + token; // Assuming localized share link
    navigator.clipboard.writeText(url).then(() => {
      this.message = 'Lien copié !';
      setTimeout(() => this.message = '', 3000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }
}
