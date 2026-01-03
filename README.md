# DataShare - Frontend

Interface utilisateur de l'application **DataShare**, développée en **Angular 21**.
Ce projet fait partie de la solution logicielle de partage de fichiers sécurisée.

![Angular](https://img.shields.io/badge/Angular-21.0.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-30.2.0-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Cypress](https://img.shields.io/badge/Cypress-15.7.1-17202C?style=for-the-badge&logo=cypress&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)

## 🚀 Démarrage Rapide

### Prérequis
*   Node.js v20+
*   Backend DataShare (doit être lancé sur le port `8080`)

### Installation
Installez les dépendances du projet :
```bash
npm install
```

### Lancer le serveur de développement
Pour démarrer l'application en mode local :
```bash
npm start
```
L'application sera accessible sur `http://localhost:4200`.

---

## 🧪 Tests

### Tests Unitaires (Jest)
Lancez les tests unitaires des composants et services :
```bash
npm test
```
Ou avec couverture de code :
```bash
npm run test:coverage
```

### Tests E2E (Cypress)
Lancez les tests de bout en bout (nécessite le Backend lancé) :

**Mode Console (CLI) - Recommandé :**
```bash
npx cypress run --spec "cypress/e2e/user_journey.cy.ts"
```

**Mode Interactif (UI) :**
```bash
npx cypress open
```
*Sélectionnez "E2E Testing" puis `user_journey.cy.ts`.*

> **Note :** Les tests sont traduits en Français et couvrent 8 scénarios complets (Authentification, Upload Anonyme/Connecté, Téléchargement Protégé, etc.).

---

## 📚 Documentation Complète

Ce dépôt concerne uniquement la partie **Frontend** (Interface & Logique Client).

Pour consulter la **Documentation Technique Globale** du projet, veuillez vous référer au dépôt **Backend** qui centralise :
*   [User Stories & Fonctionnalités]
*   [Architecture & MLD]
*   [Rapport de Sécurité]
*   [Tests de Performance]
