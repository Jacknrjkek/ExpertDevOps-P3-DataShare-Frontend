import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUpload } from '../file-upload/file-upload';
import { FileList } from '../file-list/file-list';
import { AuthService } from '../../../services/auth.service';
import { StorageService } from '../../../services/storage.service';
import { Router } from '@angular/router';


/**
 * Composant conteneur pour le Tableau de bord.
 * Intègre la liste des fichiers et le Header.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FileList],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private storageService = inject(StorageService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (!this.storageService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  /**
   * Déconnecte l'utilisateur et redirige vers le login.
   */
  logout(): void {
    this.authService.logout();
    this.storageService.clean();
    this.router.navigate(['/home']);
  }

  goToUpload(): void {
    this.router.navigate(['/home']);
  }
}
