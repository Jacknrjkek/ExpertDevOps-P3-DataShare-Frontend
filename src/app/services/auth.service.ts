import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const AUTH_API = 'http://localhost:8080/api/auth/';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);

    login(email: string, password: string): Observable<any> {
        return this.http.post(
            AUTH_API + 'login',
            {
                email,
                password
            },
            httpOptions
        );
    }

    register(email: string, password: string): Observable<any> {
        return this.http.post(
            AUTH_API + 'register',
            {
                email,
                password
            },
            httpOptions
        );
    }

    logout(): void {
        // Backend logout if needed, otherwise just client side cleanup (handled in component)
    }
}
