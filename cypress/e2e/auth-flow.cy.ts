describe('Auth Flow', () => {
    const uniqueId = Date.now();
    const email = `cypress${uniqueId}@test.com`;
    const password = 'password123';

    it('should register and login successfully', () => {
        // 1. Visit Register Page (via Login)
        cy.visit('/login');
        cy.contains('Créer un compte').click();
        cy.url().should('include', '/register');

        // 2. Fill Register Form
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button[type="submit"]').click();

        // 3. Verify Redirect to Home (Landing Page)
        cy.url().should('include', '/home');

        // 4. Navigate to Login Page
        cy.contains('Se connecter').click();
        cy.url().should('include', '/login');

        // 5. Fill Login Form
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button[type="submit"]').click();

        // 6. Verify Redirect to Home after Login
        cy.url().should('include', '/home');

        // 7. Click 'Mon espace' to go to Dashboard
        cy.contains('Mon espace').click();

        // 8. Verify Dashboard
        cy.url().should('include', '/files');
        // Assuming there is some welcome message or file list
        cy.contains('Mes fichiers');
    });
});
