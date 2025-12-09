import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  form: any = {
    email: null,
    password: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit(): void {
    const { email, password } = this.form;

    this.authService.register(email, password).subscribe({
      next: () => {
        this.isSignUpFailed = false;
        this.router.navigate(['/home']);
      },
      error: err => {
        console.error('Register Error:', err);
        this.errorMessage = err.error?.message || err.message || "Erreur d'inscription";
        this.isSignUpFailed = true;
      }
    });
  }
}
