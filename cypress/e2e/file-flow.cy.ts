describe('File Flow', () => {
    const uniqueId = Date.now();
    const email = `cypress_file_${uniqueId}@test.com`;
    const password = 'password123';
    const fileName = 'test-file.txt';

    beforeEach(() => {
        // Registration
        cy.visit('/login');
        cy.contains('Créer un compte').click();
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button[type="submit"]').click();

        // After register, we are redirected to /home (Landing)
        // Login
        cy.visit('/login');

        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button[type="submit"]').click();

        // Go to Home (Upload Page) - Actually after login we are on /home but need to click Mon espace?
        // Wait, Login sends to /home.
        // Upload is ON home page. So we are good.
        cy.url().should('include', '/home');
        // If we are on home, we might not need to click Mon Espace if we just want to upload from Home
        // But verify we can see "Mon espace" (meaning logged in)
        cy.contains('Mon espace').should('exist');
    });

    it('should upload, list, and delete a file', () => {
        // --- 1. UPLOAD ---
        // Create a dummy file
        cy.visit('/home');

        // Select file (hidden input)
        // Force true because it might be hidden by custom UI
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('This is a test file content'),
            fileName: fileName,
            mimeType: 'text/plain',
        }, { force: true });

        // Verify Modal Appears
        cy.contains('Ajouter un fichier').should('be.visible');
        cy.contains(fileName.substring(0, 10)).should('exist'); // Partial check

        // Click Upload
        cy.contains('button', 'Téléverser').click();

        // Check Success Message or Redirect
        // The component redirects to /files after success
        cy.url({ timeout: 10000 }).should('include', '/files');

        // --- 2. VERIFY LIST ---
        cy.contains('Mes fichiers').should('be.visible');
        cy.contains(fileName).should('be.visible');
        cy.contains('Nombre de téléchargements : 0').should('be.visible');

        // --- 3. DELETE ---
        // Find the delete button for our file and click it
        cy.contains('.file-row', fileName).find('button.delete').click();

        // Verify Modal
        cy.contains('Confirmer la suppression').should('be.visible');

        // Confirm
        cy.contains('button', 'Oui, supprimer').click();

        // Verify Removal
        // Wait for list update
        cy.contains(fileName).should('not.exist');
        cy.contains('Aucun fichier correspondant').should('be.visible');
    });

    it('should share a file and allow anonymous access', () => {
        // Mock Clipboard
        cy.visit('/home', {
            onBeforeLoad(win) {
                cy.stub(win.navigator.clipboard, 'writeText').as('copyToClipboard');
            }
        });

        // Upload
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('Share me content'),
            fileName: 'share-test.txt',
            mimeType: 'text/plain',
        }, { force: true });
        cy.contains('button', 'Téléverser').click();
        cy.url().should('include', '/files');

        // Share
        cy.contains('.file-row', 'share-test.txt').within(() => {
            cy.get('button.share').click();
        });

        // Capture Token from Clipboard
        cy.get('@copyToClipboard').should('have.been.calledOnce').then((stub: any) => {
            const clipboardText = stub.getCall(0).args[0];
            // clipboardText should be something like "http://localhost:4200/share/..."
            expect(clipboardText).to.contain('/share/');

            const shareUrl = clipboardText;

            // LOgout to simulate anonymous user
            cy.contains('Déconnexion').click(); // Assuming Logout button exists in header if logged in
            // Or click profile -> logout
            // Actually Header has "Se déconnecter" or icon?
            // Checking Header...

            // ...Wait, let's just visit the URL. It should work regardless of login,
            // but to prove "public" access we should logout.

            // Let's force logout via clearing storage if UI is tricky
            cy.clearLocalStorage();

            // Visit Share Link
            cy.visit(shareUrl);
        });

        // Verify Share Page
        cy.contains('Télécharger un fichier').should('be.visible');
        cy.contains('share-test.txt').should('be.visible');
        cy.contains('button', 'Télécharger le fichier').should('be.visible');
    });
});
