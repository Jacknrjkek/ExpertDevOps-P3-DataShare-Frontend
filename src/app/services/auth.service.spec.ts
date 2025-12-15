import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AuthService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send login request', () => {
        const dummyResponse = { token: 'xyz' };
        const email = 'test@test.com';
        const password = 'password';

        service.login(email, password).subscribe(res => {
            expect(res).toEqual(dummyResponse);
        });

        const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ email, password });
        req.flush(dummyResponse);
    });

    it('should send register request', () => {
        const dummyResponse = { message: 'User registered' };
        const email = 'new@test.com';
        const password = 'password';

        service.register(email, password).subscribe(res => {
            expect(res).toEqual(dummyResponse);
        });

        const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ email, password });
        req.flush(dummyResponse);
    });
});
