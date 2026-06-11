# Esport PRO

![CI](https://github.com/Manon-pinto/esport-front/actions/workflows/ci.yml/badge.svg)
![Tests back](https://img.shields.io/badge/tests%20back-125%20passed-brightgreen)
![Tests front](https://img.shields.io/badge/tests%20front-21%20passed-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-72%25-yellow)
![Node](https://img.shields.io/badge/node-%3E%3D18-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

Application web de gestion de tournois e-sport avec système de paris. Elle permet de suivre les équipes, joueurs, coachs et matchs, de visualiser les classements en temps réel, et inclut un système de paris avec gestion des points par utilisateur.

Projet fil rouge CDA — My Digital School Bordeaux.

---

## Prérequis

- Node.js >= 18
- npm >= 9
- MongoDB (local ou Atlas)

---

## Installation

```bash
cd esport-back
npm ci
```

Crée un fichier `.env` à la racine de `esport-back/` :

```env
MONGODB_URI=mongodb://localhost:port/nom-bdd
JWT_SECRET=ton_secret_jwt
JWT_EXPIRES_IN=24h
PORT=3000
```

---

## Lancement

| Commande | Description |
|---|---|
| `npm run dev` | Démarre le serveur en développement avec rechargement automatique |
| `npm start` | Démarre le serveur en production |

Le serveur démarre sur `http://localhost:3000`.  
La documentation Swagger est disponible sur `http://localhost:3000/api-docs`.

---

## Tests

### Tests back-end — Jest + Supertest (125 tests)

Couvrent toutes les routes de l'API : authentification, paris, équipes, matchs, joueurs, coachs et tournois. Incluent les cas d'erreur (401, 403, 404, 400) et les tests de sécurité (XSS, token invalide).

```bash
cd esport-back
npm test                # Lance les 125 tests
npm run test:coverage   # Avec rapport de couverture (72%)
npm run test:watch      # Mode watch
```

### Tests front-end — Vitest + Testing Library (21 tests)

Couvrent les composants React métier : formulaire de pari, carte de match, carte de tournoi. Incluent la validation des règles métier (mise min/max, gain potentiel), les états d'interface (badge LIVE, bouton désactivé) et les liens de navigation.

```bash
cd esport-front
npm test                # Lance les 21 tests
npm run test:coverage   # Avec rapport de couverture
```

---

## Pipeline CI/CD

Un pipeline GitHub Actions se déclenche automatiquement à chaque push sur n'importe quelle branche. Les deux jobs (back et front) tournent en parallèle.

```
push / pull request
        ↓
  ┌─────────────┐    ┌──────────────────┐
  │  job: test  │    │  job: test-front │
  │  (back-end) │    │  (front-end)     │
  │  Jest       │    │  Vitest          │
  │  125 tests  │    │  21 tests        │
  └──────┬──────┘    └────────┬─────────┘
         └─────────┬──────────┘
                   ↓
       ✅ succès → merge autorisé
       ❌ échec  → push bloqué
```

---

## Structure du projet

```
esport/
├── esport-back/
│   ├── src/
│   │   ├── app.js                      # Point d'entrée Express
│   │   ├── controllers/
│   │   │   ├── authController.js       # Inscription, connexion, profil
│   │   │   ├── betsController.js       # Système de paris
│   │   │   ├── matchesController.js    # Gestion des matchs
│   │   │   ├── teamsController.js      # Gestion des équipes
│   │   │   ├── playersController.js    # Gestion des joueurs
│   │   │   ├── coachesController.js    # Gestion des coachs
│   │   │   ├── tournamentsController.js
│   │   │   └── standingsController.js  # Classements
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js       # Vérification JWT
│   │   │   └── roleMiddleware.js       # Contrôle des rôles (admin)
│   │   ├── models/                     # Schémas Mongoose
│   │   ├── routes/                     # Déclaration des routes API
│   │   ├── tests/                      # Tests Jest + Supertest
│   │   │   ├── auth.test.js
│   │   │   ├── bet.test.js
│   │   │   ├── coaches.test.js
│   │   │   ├── matches.test.js
│   │   │   ├── players.test.js
│   │   │   ├── teams.test.js
│   │   │   └── tournaments.test.js
│   │   └── utils/
│   │       └── jwt.js                  # Génération et vérification des tokens
│   └── swagger.json                    # Documentation API
├── esport-front/                       # Interface React
└── .github/
    └── workflows/
        └── ci.yml                      # Pipeline CI/CD
```

---

## Routes API

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Inscription |
| POST | `/api/auth/login` | — | Connexion |
| GET | `/api/auth/leaderboard` | — | Classement des joueurs |
| GET | `/api/auth/me` | JWT | Profil utilisateur |
| GET | `/api/pari` | JWT | Mes paris |
| POST | `/api/pari` | JWT | Placer un pari |
| DELETE | `/api/pari/:id` | JWT | Annuler un pari |
| GET | `/api/teams` | — | Liste des équipes |
| POST | `/api/teams` | Admin | Créer une équipe |
| GET | `/api/matches` | — | Liste des matchs |
| PUT | `/api/matches/:id` | Admin | Modifier un match (résout les paris) |
| GET | `/api/tournois` | — | Liste des tournois |
| GET | `/api/players` | — | Liste des joueurs |
| GET | `/api/coach` | — | Liste des coachs |

---

My Digital School Bordeaux · CDA · Qualité logicielle & tests
