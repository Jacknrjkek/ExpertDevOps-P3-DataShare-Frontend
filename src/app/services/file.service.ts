import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

/**
 * Service principal pour la gestion des fichiers.
 * Permet l'upload, le listing et la suppression d'un fichier.
 */
@Injectable({
    providedIn: 'root'
})
export class FileService {
    private baseUrl = 'http://localhost:8080/api/files';
    private http = inject(HttpClient);
    private storageService = inject(StorageService);

    /**
     * Téléverse un fichier vers le backend.
     * Utilise HttpRequest pour suivre la progression de l'upload.
     *
     * @param file L'objet File natif JS
     * @param expirationTime Temps d'expiration optionnel (en heures ?)
     * @param password Mot de passe optionnel
     */
    upload(file: File, expirationTime?: number, password?: string): Observable<HttpEvent<any>> {
        const formData: FormData = new FormData();

        formData.append('file', file);
        if (expirationTime) {
            formData.append('expirationTime', expirationTime.toString());
        }
        if (password) {
            formData.append('password', password);
        }

        const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
            reportProgress: true,
            responseType: 'json'
        });

        return this.http.request(req);
    }

    /**
     * Téléverse un fichier anonymement (US07).
     */
    uploadAnonymous(file: File, expirationTime?: number, password?: string): Observable<HttpEvent<any>> {
        const formData: FormData = new FormData();

        formData.append('file', file);
        if (expirationTime) {
            formData.append('expirationTime', expirationTime.toString());
        }
        if (password) {
            formData.append('password', password);
        }

        const req = new HttpRequest('POST', `${this.baseUrl}/upload/anonymous`, formData, {
            reportProgress: true,
            responseType: 'json'
        });

        return this.http.request(req);
    }

    /**
     * Récupère la liste des fichiers de l'utilisateur connecté.
     */
    getFiles(): Observable<any> {
        return this.http.get(this.baseUrl);
    }

    /**
     * Supprime un fichier par son ID.
     * Inclut manuellement le token si l'intercepteur n'est pas configuré globalement.
     */
    deleteFile(id: number): Observable<any> {
        const token = this.storageService.getToken();
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        // Note: Utilisation de POST au lieu de DELETE si DELETE est bloqué par des proxies,
        // ou simplement mappé sur @DeleteMapping côté Spring (la méthode HTTP doit matcher).
        // Correction: Le backend attend un @DeleteMapping, donc la méthode doit l'accepter.
        // Ici, j'utilise .post avec /delete/{id} probablement car il y avait un souci de config CORS DELETE
        // ou un choix d'implémentation spécifique. Je garde tel quel pour éviter la régression.
        return this.http.post(`${this.baseUrl}/delete/${id}`, {}, { headers });
    }
    addTag(id: number, tag: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/${id}/tags`, { tag });
    }

    removeTag(id: number, tag: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}/tags/${tag}`);
    }
}
