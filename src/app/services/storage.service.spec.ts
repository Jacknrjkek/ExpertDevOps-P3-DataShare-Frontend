import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

/**
 * Tests Unitaires pour StorageService.
 * Vérifie la persistance des données dans le LocalStorage du navigateur.
 */
describe('StorageService', () => {
    let service: StorageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [StorageService]
        });
        service = TestBed.inject(StorageService);

        // Nettoyage impératif du LS avant chaque test
        window.localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    /**
     * Vérifie la sauvegarde et récupération du Token.
     */
    it('should save and get token', () => {
        service.saveToken('test-token');
        expect(service.getToken()).toBe('test-token');
    });

    /**
     * Vérifie la sauvegarde et récupération de l'Objet User.
     */
    it('should save and get user', () => {
        const user = { id: 1, email: 'test@test.com' };
        service.saveUser(user);
        expect(service.getUser()).toEqual(user);
    });

    /**
     * Vérifie la détection de l'état connecté.
     */
    it('should check if logged in', () => {
        expect(service.isLoggedIn()).toBeFalsy();

        service.saveUser({ id: 1 });
        service.saveToken('token');
        expect(service.isLoggedIn()).toBeTruthy();
    });

    /**
     * Vérifie le nettoyage complet lors de la déconnexion.
     */
    it('should logout/clean', () => {
        service.saveToken('token');
        service.saveUser({ id: 1 });

        service.clean();

        expect(service.getToken()).toBeNull();
        expect(service.isLoggedIn()).toBeFalsy();
    });
});
