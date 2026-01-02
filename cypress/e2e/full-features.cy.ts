/// <reference types="cypress" />

describe('DataShare Core Features', () => {

    const testPassword = Cypress.env("TEST_FILE_PASSWORD");
    const testUserEmail = `testuser_${Date.now()}@test.com`; // Unique email for each run
    const testUserPassword = Cypress.env("TEST_USER_PASSWORD");

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.window().then((win: any) => {
            win.sessionStorage.clear();
        });
    });

    /**
     * 1. Upload Anonyme (Sans mot de passe)
     */
    it('1. Anonymous Upload - No Password', () => {
        cy.visit('/home');

        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('Anonymous content'),
            fileName: 'anon_no_pass.txt',
            mimeType: 'text/plain',
        }, { force: true });

        // Click Upload
        cy.contains('button', 'Téléverser').click();

        // Verify Success
        cy.contains('Fichier téléversé avec succès').should('be.visible');
        cy.get('input[readonly]').should('have.value', 'http', { matchCase: false });
    });

    /**
     * 2. Upload Anonyme (Avec mot de passe)
     */
    it('2. Anonymous Upload - With Password', () => {
        cy.visit('/home');

        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('Anonymous secured content'),
            fileName: 'anon_pass.txt',
            mimeType: 'text/plain',
        }, { force: true });

        // Enable password
        cy.contains('Protéger par mot de passe').click();
        cy.get('input[type="password"]').type(testPassword);

        cy.contains('button', 'Téléverser').click();

        cy.contains('Fichier téléversé avec succès').should('be.visible');
        cy.get('input[readonly]').should('have.value', 'http', { matchCase: false });
    });

    /**
     * 3. Upload Logger (Sans mot de passe)
     */
    it('3. Authenticated Upload - No Password', () => {
        // Register & Login
        cy.visit('/login');
        cy.contains('Créer un compte').click();
        cy.get('input[name="email"]').type(testUserEmail);
        cy.get('input[name="password"]').type(testUserPassword);
        cy.get('button[type="submit"]').click();

        // Auto-login or redirect to login (Assuming redirect to login here based on flow)
        cy.get('input[name="email"]').type(testUserEmail);
        cy.get('input[name="password"]').type(testUserPassword);
        cy.get('button[type="submit"]').click();

        // Should be on dashboard
        cy.url().should('include', '/files');

        // Go to upload (which is on Home) via the button
        cy.contains('button', 'Ajouter des fichiers').click();
        cy.url().should('include', '/home');

        // Confirm we are authenticated by checking dashboard link exists or similar?
        // Or simply trust that if we upload, backend sees it.

        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('Auth content'),
            fileName: 'auth_no_pass.txt',
            mimeType: 'text/plain',
        }, { force: true });

        cy.contains('button', 'Téléverser').click();

        // Verify success
        cy.contains('Fichier téléversé avec succès').should('be.visible');
        // Ideally verify ownership in backend or UI, but success message is enough for now.
    });

    /**
     * 4. Upload Logger (Avec mot de passe)
     */
    it('4. Authenticated Upload - With Password', () => {
        // Login with same user
        cy.visit('/login');
        cy.get('input[name="email"]').type(testUserEmail);
        cy.get('input[name="password"]').type(testUserPassword);
        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/files');
        cy.contains('button', 'Ajouter des fichiers').click();
        cy.url().should('include', '/home');

        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('Auth secured content'),
            fileName: 'auth_pass.txt',
            mimeType: 'text/plain',
        }, { force: true });

        cy.contains('Protéger par mot de passe').click();
        cy.get('input[type="password"]').type(testPassword);

        cy.contains('button', 'Téléverser').click();

        cy.contains('Fichier téléversé avec succès').should('be.visible');
    });

    /**
     * 5. Download (Sans mot de passe)
     */
    it('5. Download - No Password', () => {
        // Upload first to get a link (Anonymous setup is fine)
        cy.visit('/home');
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('Downloadable content'),
            fileName: 'download_me.txt',
            mimeType: 'text/plain',
        }, { force: true });

        cy.contains('button', 'Téléverser').click();
        cy.contains('Fichier téléversé avec succès').should('be.visible');

        // Extract link
        cy.get('input[readonly]').invoke('val').then((val: any) => {
            const shareUrl = val;
            cy.visit(shareUrl);

            cy.contains('download_me.txt').should('be.visible');
            cy.contains('Fichier protégé').should('not.exist');

            // Mock window.open to avoid new tab issues if any
            cy.window().then((win: any) => {
                cy.stub(win, 'open').as('windowOpen');
            });

            // Intercept download request
            cy.intercept('POST', '**/download/**').as('downloadCall');
            // If download uses GET (button might), try intercepting GET too or just verify click
            // ShareView usually does POST downloadFile(token) or GET?
            // ShareController has both, but frontend might use one.
            // Let's assume POST as per code.

            cy.contains('button', 'Télécharger').click();
            cy.wait('@downloadCall').its('response.statusCode').should('eq', 200);
        });
    });

    /**
     * 6. Download (Avec mot de passe)
     */
    it('6. Download - With Password', () => {
        cy.visit('/home');
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('Secret Downloadable content'),
            fileName: 'secret_download.txt',
            mimeType: 'text/plain',
        }, { force: true });

        cy.contains('Protéger par mot de passe').click();
        cy.get('input[type="password"]').type(testPassword);
        cy.contains('button', 'Téléverser').click();
        cy.contains('Fichier téléversé avec succès').should('be.visible');

        cy.get('input[readonly]').invoke('val').then((val: any) => {
            const shareUrl = val;
            cy.visit(shareUrl);

            cy.contains('Fichier protégé par mot de passe').should('be.visible');

            // Wrong password
            cy.get('input[type="password"]').type('wrongpassword');
            cy.contains('button', 'Télécharger').click();
            cy.contains('Mot de passe incorrect').should('be.visible');

            // Correct password
            cy.get('input[type="password"]').clear().type(testPassword);

            cy.intercept('POST', '**/download/**').as('downloadCall');
            cy.contains('button', 'Télécharger').click();
            cy.wait('@downloadCall').its('response.statusCode').should('eq', 200);
        });
    });

});
