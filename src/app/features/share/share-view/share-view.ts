import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ShareService } from '../../../services/share.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-share-view',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './share-view.html',
  styleUrl: './share-view.scss'
})
export class ShareView implements OnInit {
  token: string | null = null;
  fileData: any = null;
  errorMessage = '';
  loading = true;

  private route = inject(ActivatedRoute);
  private shareService = inject(ShareService);

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    if (this.token) {
      this.fetchMetadata(this.token);
    } else {
      this.errorMessage = 'Lien invalide.';
      this.loading = false;
    }
  }

  fetchMetadata(token: string): void {
    this.shareService.getShareMetadata(token).subscribe({
      next: (data) => {
        this.fileData = data;
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 410) {
          this.errorMessage = 'Ce lien a expiré.';
        } else {
          this.errorMessage = 'Fichier introuvable ou erreur serveur.';
        }
        this.loading = false;
      }
    });
  }

  download(): void {
    if (this.token) {
      window.location.href = this.shareService.getDownloadUrl(this.token);
    }
  }
}
