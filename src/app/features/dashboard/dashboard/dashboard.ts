import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUpload } from '../file-upload/file-upload';
import { FileList } from '../file-list/file-list';
import { AuthService } from '../../../services/auth.service';
import { StorageService } from '../../../services/storage.service';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../layout/header/header';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FileList, HeaderComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private storageService = inject(StorageService);
  private authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.storageService.clean();
    this.router.navigate(['/login']);
  }
}
