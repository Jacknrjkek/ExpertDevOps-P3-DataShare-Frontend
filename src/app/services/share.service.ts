import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Service pour la gestion des partages publics.
 * Permet de récupérer les informations d'un fichier via son lien de partage.
 * Accessible sans authentification (Endpoints publics).
 */
@Injectable({
    providedIn: 'root'
})
export class ShareService {
    private apiUrl = 'http://localhost:8080/api';
    private http = inject(HttpClient);

    /**
     * Récupère les métadonnées d'un fichier partagé via son token.
     * @param token Le token UUID unique du partage
     */
    getShareMetadata(token: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/share/${token}`);
    }

    /**
     * Génère l'URL directe de téléchargement.
     */
    getDownloadUrl(token: string): string {
        return `${this.apiUrl}/download/${token}`;
    }

    /**
     * Télécharge un fichier protégé par mot de passe.
     * @param token Le token UUID
     * @param password Le mot de passe
     */
    downloadProtected(token: string, password: string): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/download/${token}`, { password }, {
            responseType: 'blob'
        });
    }
}
