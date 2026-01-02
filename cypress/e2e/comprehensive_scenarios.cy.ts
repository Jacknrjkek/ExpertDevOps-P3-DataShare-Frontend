/**
 * TEST E2E COMPLET - DataShare
 * Couvre les scénarios utilisateurs pour US07, US08, US09, US10
 */
describe('DataShare Comprehensive Scenarios', () => {

    beforeEach(() => {
        cy.clearLocalStorage();
    });

    // ============================================
    // SCÉNARIO 1 : UTILISATEUR ANONYME (US07, US10)
    // ============================================
    describe('Scenario 1: Anonymous User', () => {

        it('1.1 Should upload a simple file (No Password, Default Expiration)', () => {
            cy.visit('/home');
            cy.get('input[type="file"]').selectFile({
                contents: Cypress.Buffer.from('Hello Anonymous World'),
                fileName: 'anon_simple.txt',
                mimeType: 'text/plain',
            }, { force: true });

            cy.contains('button', 'Téléverser').click();

            cy.contains('Fichier téléversé avec succès').should('be.visible');
            cy.get('.share-link').should('contain', 'http');
            // Default expiration text check (7 days)
            cy.get('p.text-muted').should('contain', '7 jour(s)');
        });

        it('1.2 Should upload with Custom Expiration (US10)', () => {
            cy.visit('/home');
            cy.get('input[type="file"]').selectFile({
                contents: Cypress.Buffer.from('Short Lived File'),
                fileName: 'anon_short.txt',
                mimeType: 'text/plain',
            }, { force: true });

            // Select 1 day
            cy.get('select').select('1');

            cy.contains('button', 'Téléverser').click();

            cy.contains('Fichier téléversé avec succès').should('be.visible');
            cy.get('p.text-muted').should('contain', '1 jour(s)');
        });

        it('1.3 Should protect file with password (US09) and verify download', () => {
            const password = Cypress.env("TEST_FILE_PASSWORD");
            cy.visit('/home');

            cy.get('input[type="file"]').selectFile({
                contents: Cypress.Buffer.from('Top Secret Data'),
                fileName: 'anon_protected.txt',
                mimeType: 'text/plain',
            }, { force: true });

            // Activate Password
            cy.contains('Protéger par mot de passe').click();
            cy.get('input[type="password"]').type(password);

            cy.contains('button', 'Téléverser').click();

            // Get Link
            cy.window().then((win) => {
                cy.stub(win.navigator.clipboard, 'writeText').as('copy');
            });
            cy.contains('button', 'Copier').click();

            cy.get('@copy').should('have.been.calledOnce').then((stub: any) => {
                const url = stub.getCall(0).args[0];

                // Visit as recipient
                cy.visit(url);

                // Verify Prompt
                cy.contains('Fichier protégé').should('be.visible');

                // 1. Fail with wrong password
                cy.get('input[type="password"]').type('WrongPass');
                cy.contains('button', 'Télécharger').click();
                cy.contains('incorrect').should('be.visible');

                // 2. Success with correct password
                cy.get('input[type="password"]').clear().type(password);
                cy.intercept('POST', '**/download/**').as('dl');
                cy.contains('button', 'Télécharger').click();
                cy.wait('@dl').its('response.statusCode').should('eq', 200);
            });
        });
    });

    // ============================================
    // SCÉNARIO 2 : UTILISATEUR CONNECTÉ (US08, US09)
    // ============================================
    describe('Scenario 2: Authenticated User', () => {
        const email = `user_${Date.now()}@datashare.com`;
        const password = Cypress.env("TEST_USER_PASSWORD");

        it('2.1 Should Register and Login', () => {
            cy.visit('/login');
            cy.contains('Créer un compte').click();
            cy.get('input[name="email"]').type(email);
            cy.get('input[name="password"]').type(password);
            cy.get('button[type="submit"]').click();

            // Check redirect to login and success message
            cy.contains('Succès').should('be.visible');

            // Login
            cy.get('input[name="email"]').type(email);
            cy.get('input[name="password"]').type(password);
            cy.get('button[type="submit"]').click();

            cy.url().should('include', '/dashboard');
        });

        it('2.2 Should Upload File with Tags and Password', () => {
            // Login (Session checks or re-login)
            cy.visit('/login');
            cy.get('input[name="email"]').type(email);
            cy.get('input[name="password"]').type(password);
            cy.get('button[type="submit"]').click();

            // Upload
            cy.get('input[type="file"]').selectFile({
                contents: Cypress.Buffer.from('My Personal File'),
                fileName: 'my_doc.txt',
                mimeType: 'text/plain',
            }, { force: true });

            // Set Password
            cy.contains('Protéger par mot de passe').click();
            cy.get('input[type="password"]').type('MyDocPass');

            cy.contains('button', 'Téléverser').click();

            // Verify redirection to list
            cy.url().should('include', '/files');
            cy.contains('my_doc.txt').should('be.visible');

            // Add Tag via UI (US08)
            cy.contains('.file-row', 'my_doc.txt').within(() => {
                // Assuming Tag Input exists or button to add tag
                cy.get('input.tag-input').type('ProjectA{enter}');
            });

            // Verify Tag
            cy.contains('.tag', 'ProjectA').should('be.visible');
        });

        it('2.3 Should Verify Tag Persistence and Removal', () => {
            // Login
            cy.visit('/login');
            cy.get('input[name="email"]').type(email);
            cy.get('input[name="password"]').type(password);
            cy.get('button[type="submit"]').click();

            cy.visit('/files');
            cy.contains('my_doc.txt').should('be.visible');
            cy.contains('ProjectA').should('be.visible');

            // Remove Tag
            cy.contains('.file-row', 'my_doc.txt').within(() => {
                cy.get('.tag .remove').click();
            });
            cy.contains('ProjectA').should('not.exist');
        });
    });
});
