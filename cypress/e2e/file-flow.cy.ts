/**
 * Test E2E : Flux Gestion de Fichiers.
 * Scénario 1 : Upload -> Liste -> Suppression.
 * Scénario 2 : Upload -> Partage -> Téléchargement Anonyme.
 */
describe('File Flow', () => {
    const uniqueId = Date.now();
    const email = `cypress_file_${uniqueId}@test.com`;
    const password = 'password123';
    const fileName = 'test-file.txt';

    // Préparation : Inscription et Connexion avant chaque test
    beforeEach(() => {
        // --- Inscription ---
        cy.visit('/login');
        cy.contains('Créer un compte').click();
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button[type="submit"]').click();

        // --- Connexion ---
        cy.visit('/login');
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button[type="submit"]').click();

        // Vérification : On est bien sur la Home (Espace connecté)
        cy.url().should('include', '/files');
        cy.contains('Mes fichiers').should('exist');
    });

    /**
     * Teste le cycle de vie complet d'un fichier (CRUD).
     */
    it('should upload, list, and delete a file', () => {
        // --- 1. UPLOAD ---
        cy.visit('/home');

        // Sélection du fichier via l'input caché
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('This is a test file content'),
            fileName: fileName,
            mimeType: 'text/plain',
        }, { force: true });

        // Vérification de la modale de confirmation
        cy.contains('Ajouter un fichier').should('be.visible');
        cy.contains(fileName.substring(0, 10)).should('exist'); // Vérification partielle du nom

        // Click Upload
        cy.contains('button', 'Téléverser').click();

        // Vérification redirection vers la liste après succès
        cy.url({ timeout: 10000 }).should('include', '/files');

        // --- 2. VÉRIFICATION LISTE ---
        cy.contains('Mes fichiers').should('be.visible');
        cy.contains(fileName).should('be.visible');
        cy.contains('Nombre de téléchargements : 0').should('be.visible');

        // --- 3. SUPPRESSION ---
        // Clic sur le bouton supprimer de la ligne correspondante
        cy.contains('.file-row', fileName).find('button.delete').click();

        // Vérification Modale suppression
        cy.contains('Confirmer la suppression').should('be.visible');

        // Confirmation
        cy.contains('button', 'Oui, supprimer').click();

        // Vérification Disparition
        cy.contains(fileName).should('not.exist');
        cy.contains('Aucun fichier correspondant').should('be.visible');
    });

    /**
     * Teste le partage public et l'accès anonyme.
     */
    it('should share a file and allow anonymous access', () => {
        // Stub du presse-papier pour capturer le lien
        cy.visit('/home', {
            onBeforeLoad(win) {
                cy.stub(win.navigator.clipboard, 'writeText').as('copyToClipboard');
            }
        });

        // Upload d'un fichier dédié au partage
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('Share me content'),
            fileName: 'share-test.txt',
            mimeType: 'text/plain',
        }, { force: true });
        cy.contains('button', 'Téléverser').click();
        cy.url().should('include', '/files');

        // Clic sur le bouton Partager
        cy.contains('.file-row', 'share-test.txt').within(() => {
            cy.get('button.share').click();
        });

        // Capture du lien dans le presse-papier mocké
        cy.get('@copyToClipboard').should('have.been.calledOnce').then((stub: any) => {
            const clipboardText = stub.getCall(0).args[0];
            expect(clipboardText).to.contain('/share/');

            const shareUrl = clipboardText;

            // Simulation accès anonyme (Reset du LocalStorage)
            cy.clearLocalStorage();

            // Visite du lien de partage
            cy.visit(shareUrl);
        });

        // Vérification de la page publique de téléchargement
        cy.contains('Télécharger un fichier').should('be.visible');
        cy.contains('share-test.txt').should('be.visible');
        cy.contains('button', 'Télécharger le fichier').should('be.visible');
    });
});
