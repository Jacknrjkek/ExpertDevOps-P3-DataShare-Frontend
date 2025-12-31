import { Injectable } from '@angular/core';

const USER_STORAGE_KEY = 'datashare-user-storage';
const TOKEN_STORAGE_KEY = 'datashare-token-storage';

/**
 * Service utilitaire pour la gestion du LocalStorage.
 * Stocke le Token JWT et les infos de l'utilisateur de manière persistante.
 */
@Injectable({
    providedIn: 'root'
})
export class StorageService {
    constructor() { }

    /**
     * Nettoie le stockage (Déconnexion).
     */
    clean(): void {
        window.localStorage.clear();
    }

    /**
     * Sauvegarde les informations de l'utilisateur.
     */
    public saveUser(user: any): void {
        window.localStorage.removeItem(USER_STORAGE_KEY);
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }

    /**
     * Récupère l'utilisateur connecté.
     */
    public getUser(): any {
        const user = window.localStorage.getItem(USER_STORAGE_KEY);
        if (user) {
            return JSON.parse(user);
        }
        return null;
    }

    /**
     * Sauvegarde le Token JWT brut.
     */
    public saveToken(token: string): void {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }

    /**
     * Récupère le Token JWT.
     */
    public getToken(): string | null {
        return window.localStorage.getItem(TOKEN_STORAGE_KEY);
    }

    /**
     * Vérifie si l'utilisateur est connecté (présence de données).
     */
    public isLoggedIn(): boolean {
        const user = window.localStorage.getItem(USER_STORAGE_KEY);
        return !!user;
    }
}
