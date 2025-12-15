import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Register } from './register';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('Register Component', () => {
    let component: Register;
    let fixture: ComponentFixture<Register>;
    let authServiceMock: any;
    let router: Router;

    beforeEach(async () => {
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
        jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call authService.register and navigate on success', () => {
        const email = 'test@test.com';
        const password = 'password123';
        component.form.email = email;
        component.form.password = password;

        authServiceMock.register.mockReturnValue(of({ message: 'Success' }));

        component.onSubmit();

        expect(authServiceMock.register).toHaveBeenCalledWith(email, password);
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
        expect(component.isSignUpFailed).toBeFalsy();
    });

    it('should display error message on registration failure (validation error)', () => {
        const email = 'invalid-email';
        const password = '123';
        component.form = { email, password };

        // Mock backend validation error response (400 Bad Request structure)
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

        // Check if messages were parsed correctly based on the logic in register.ts
        expect(component.errorMessage).toContain('Email invalide');
        expect(component.errorMessage).toContain('Mot de passe trop court');
    });

    it('should display generic error message on server error', () => {
        component.form = { email: 'test@test.com', password: 'password' };

        authServiceMock.register.mockReturnValue(throwError(() => ({ status: 500, message: 'Server error' })));

        component.onSubmit();

        expect(component.isSignUpFailed).toBeTruthy();
        expect(component.errorMessage).toBe("Erreur d'inscription"); // Fallback
    });
});
