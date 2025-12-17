import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { StorageService } from '../../../services/storage.service';

/**
 * Composant de la page de Connexion.
 * Gère le formulaire d'authentification et la redirection post-login.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  // Modèle de formulaire pour le Template-Driven Form
  form: any = {
    email: null,
    password: null
  };

  // États de l'authentification pour l'affichage conditionnel
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  private authService = inject(AuthService);
  private storageService = inject(StorageService); // Injection du service de stockage
  private router = inject(Router);

  constructor() { }

  ngOnInit(): void {
    // Si déjà connecté, redirection immédiate vers les fichiers
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.roles = this.storageService.getUser().roles;
      this.router.navigate(['/files']);
    }
  }

  /**
   * Soumission du formulaire de connexion.
   */
  onSubmit(): void {
    const { email, password } = this.form;

    this.authService.login(email, password).subscribe({
      next: data => {
        // Sauvegarde du Token JWT et de l'User dans le LocalStorage
        this.storageService.saveToken(data.accessToken);
        this.storageService.saveUser(data);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.storageService.getUser().roles;

        // Redirection vers l'espace membre
        this.router.navigate(['/files']);
      },
      error: err => {
        console.error('Login Error:', err);
        // Affichage du message d'erreur (Backend ou par défaut)
        this.errorMessage = err.error?.message || err.message || 'Erreur de connexion';
        this.isLoginFailed = true;
      }
    });
  }

  reloadPage(): void {
    window.location.reload();
  }
}
