/**
 * Test E2E : Flux d'Authentification complet.
 * Scénario : Inscription -> Connexion -> Accès Espace Membre.
 */
describe('Auth Flow', () => {
    // Génération d'email unique pour éviter les conflits
    const uniqueId = Date.now();
    const email = `cypress${uniqueId}@test.com`;
    const password = 'password123';

    it('should register and login successfully', () => {
        // 1. Visite de la page de Login et navigation vers Inscription
        cy.visit('/login');
        cy.contains('Créer un compte').click();
        cy.url().should('include', '/register');

        // 2. Remplissage du formulaire d'inscription
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button[type="submit"]').click();

        // 3. Vérification de la redirection post-inscription (Landing Page)
        cy.url().should('include', '/home');

        // 4. Navigation vers la page de Connexion
        cy.contains('Se connecter').click();
        cy.url().should('include', '/login');

        // 5. Remplissage du formulaire de connexion
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button[type="submit"]').click();

        // 6. Vérification de la redirection post-connexion
        cy.url().should('include', '/files');

        // 7. Accès au Tableau de bord (Espace membre)
        // 7. Accès au Tableau de bord (Espace membre)
        // Déjà sur le dashboard suite à la redirection
        cy.contains('Mes fichiers').should('exist');
    });
});
