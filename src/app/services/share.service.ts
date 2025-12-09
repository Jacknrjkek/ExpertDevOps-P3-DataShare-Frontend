import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ShareService {
    private apiUrl = 'http://localhost:8080/api';
    private http = inject(HttpClient);

    getShareMetadata(token: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/share/${token}`);
    }

    // Helper to get download URL directly
    getDownloadUrl(token: string): string {
        return `${this.apiUrl}/download/${token}`;
    }
}
