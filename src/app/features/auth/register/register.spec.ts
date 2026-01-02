import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Register } from './register';
import { AuthService } from '../../../services/auth.service';
import { By } from '@angular/platform-browser';
import { TEST_CONSTANTS } from '../../../shared/test-constants';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

/**
 * Tests Unitaires pour le Composant Register.
 * Vérifie l'intégration avec AuthService, la navigation et l'affichage des erreurs.
 */
describe('Register Component', () => {
    let component: Register;
    let fixture: ComponentFixture<Register>;
    let authServiceMock: any;
    let router: Router;

    beforeEach(async () => {
        // Mock du service d'authentification
        authServiceMock = {
            register: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [Register, RouterTestingModule],
            providers: [
                { provide: AuthService, useValue: authServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(Register);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);

        // Empêche la navigation réelle
        jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    /**
     * Vérifie le succès : Appel service + Redirection vers Home.
     */
    it('should call authService.register and navigate on success', () => {
        const email = 'test@test.com';
        const password = TEST_CONSTANTS.USER_PASSWORD;
        component.form.email = email;
        component.form.password = password;

        authServiceMock.register.mockReturnValue(of({ message: 'Success' }));

        component.onSubmit();

        expect(authServiceMock.register).toHaveBeenCalledWith(email, password);
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
        expect(component.isSignUpFailed).toBeFalsy();
    });

    /**
     * Vérifie la gestion des erreurs de validation (400 Bad Request).
     * Doit parser l'objet d'erreur Spring Boot pour afficher un message lisible.
     */
    it('should display error message on registration failure (validation error)', () => {
        const email = 'test@test.com';
        const password = TEST_CONSTANTS.SHORT_PASSWORD;
        component.form = { email, password };

        // Mock d'une réponse d'erreur de validation Backend
        const errorResponse = {
            error: {
                errors: [
                    { field: 'email', defaultMessage: 'must be a well-formed email address' },
                    { field: 'password', defaultMessage: 'size must be between 8 and 40' }
                ]
            }
        };

        authServiceMock.register.mockReturnValue(throwError(() => errorResponse));

        component.onSubmit();

        expect(authServiceMock.register).toHaveBeenCalled();
        expect(component.isSignUpFailed).toBeTruthy();

        // Vérification du parsing des messages
        expect(component.errorMessage).toContain('Email invalide');
        expect(component.errorMessage).toContain('Mot de passe trop court');
    });

    /**
     * Vérifie le fallback sur un message d'erreur générique.
     */
    it('should display generic error message on server error', () => {
        component.form = { email: 'test@test.com', password: 'password' };

        authServiceMock.register.mockReturnValue(throwError(() => ({ status: 500, message: 'Server error' })));

        component.onSubmit();

        expect(component.isSignUpFailed).toBeTruthy();
        expect(component.errorMessage).toBe("Erreur d'inscription");
    });
});
