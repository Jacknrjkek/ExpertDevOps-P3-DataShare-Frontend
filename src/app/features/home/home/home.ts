import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUpload } from '../../dashboard/file-upload/file-upload';
import { HeaderComponent } from '../../../layout/header/header';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FileUpload, HeaderComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private storageService = inject(StorageService);
  private authService = inject(AuthService);
  private router = inject(Router);

  get isLoggedIn(): boolean {
    return this.storageService.isLoggedIn();
  }

  goToSpace(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/files']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.storageService.clean();
    this.router.navigate(['/login']);
  }
}
