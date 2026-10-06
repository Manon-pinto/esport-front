# Installation et configuration de l'environnement

> Documentation complémentaire au Dossier de projet — Partie 1, « Installer et configurer son
> environnement de travail ». Détaille pas à pas la mise en place de l'environnement de
> développement d'E-SportPro.

## 1. Outils installés sur le poste de travail

| Outil | Rôle |
|---|---|
| VS Code | Éditeur de code |
| Extension ESLint | Détection d'erreurs et de mauvaises pratiques JavaScript/TypeScript en temps réel |
| Extension Prettier | Formatage automatique du code à l'enregistrement |
| Extension GitLens | Visualisation de l'historique Git (blame, comparaison de branches) directement dans l'éditeur |
| Node.js (>= 18) et npm | Runtime JavaScript et gestionnaire de dépendances, pour le frontend et le backend |
| Docker et Docker Compose | Conteneurisation : exécute MongoDB (et, en développement complet, l'API et le front) dans des environnements isolés et reproductibles |
| MongoDB Compass | Interface graphique pour explorer et administrer la base MongoDB en local |
| Postman | Client HTTP pour tester manuellement les routes de l'API avant d'écrire les tests automatisés |
| Git + GitHub | Gestion de versions et hébergement du dépôt (`github.com/Manon-pinto/esport-front`) |

## 2. Pourquoi Docker malgré un développement possible « à la main »

MongoDB peut être installé directement sur la machine, mais cela crée une dépendance à la
configuration locale (version installée, port déjà utilisé par un autre projet, chemin de
données...). Docker Compose décrit dans un seul fichier (`docker-compose.yml`, à la racine du
dépôt) les services nécessaires — la base de données en développement — et les démarre dans des
conteneurs isolés, identiques d'une machine à l'autre. Le fichier compose complet (backend,
frontend, MongoDB, et des outils d'exploitation comme mongo-express et dozzle) sert aussi de
référence pour un déploiement auto-hébergé, documentée dans
[`DEPLOYMENT.md`](../DEPLOYMENT.md).

## 3. Étapes d'installation (reproductibles)

```bash
git clone https://github.com/Manon-pinto/esport-front.git
cd esport-front

# Backend
cd esport-back
npm ci
cp .env.example .env      # puis éditer avec les vraies valeurs (voir §4)
npm run dev                # démarre sur http://localhost:3000

# Frontend (dans un second terminal)
cd esport-front
npm ci
cp .env.example .env.local # NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev                # le port 3000 étant pris par l'API, Next.js démarre sur http://localhost:3001
```

Pour une base MongoDB locale sans l'installer directement sur la machine :

```bash
docker compose up -d mongodb
```

## 4. Variables d'environnement

Les secrets (chaîne de connexion MongoDB, secret JWT) ne sont **jamais** commités dans Git : ils
vivent dans des fichiers `.env` locaux, listés dans `.gitignore`. Chaque application a son
fichier `.env.example`, commité, qui documente les variables attendues sans leurs valeurs réelles.

Backend (`esport-back/.env.example`) :

```env
MONGODB_URI=mongodb://localhost:27017/esport   # base locale ou chaîne Atlas
JWT_SECRET=un_secret_long_et_aleatoire
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10                               # coût du hachage des mots de passe
PORT=3000                                      # ignoré sur Vercel
FRONTEND_URL=http://localhost:3001             # origines autorisées par CORS (séparées par des virgules)
```

Frontend (`esport-front/.env.example`, à copier en `.env.local`) :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

En production (Vercel), ces mêmes variables sont saisies directement dans les paramètres du
projet plutôt que dans un fichier — voir la documentation complémentaire « Déploiement ».

## 5. Vérification de l'environnement

- `npm test` (dans `esport-back/`) doit faire passer les 127 tests sans base de données réelle
  (les modèles Mongoose sont mockés — voir la documentation complémentaire « Tests »).
- `http://localhost:3000/api-docs` doit afficher la documentation Swagger de l'API.
- `http://localhost:3001` (frontend) doit afficher la page d'accueil avec les données de démo
  (après `npm run seed` côté backend).
