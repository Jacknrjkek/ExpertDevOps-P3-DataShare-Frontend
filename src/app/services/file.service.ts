import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
@Injectable({
    providedIn: 'root'
})
export class FileService {
    private baseUrl = 'http://localhost:8080/api/files';
    private http = inject(HttpClient);

    upload(file: File, expirationTime?: number): Observable<HttpEvent<any>> {
        const formData: FormData = new FormData();

        formData.append('file', file);
        if (expirationTime) {
            formData.append('expirationTime', expirationTime.toString());
        }

        const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
            reportProgress: true,
            responseType: 'json'
        });

        return this.http.request(req);
    }

    getFiles(): Observable<any> {
        return this.http.get(this.baseUrl);
    }

    private storageService = inject(StorageService);

    deleteFile(id: number): Observable<any> {
        const token = this.storageService.getToken();
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        // Using POST workaroud to bypass potential DELETE access issues
        return this.http.post(`${this.baseUrl}/delete/${id}`, {}, { headers });
    }
}
