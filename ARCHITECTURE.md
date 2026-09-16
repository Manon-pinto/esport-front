# Architecture

Ce document explique comment le projet est organisé et pourquoi, pour ceux qui reprennent le
code (ou pour l'oral de certification). Pour l'installation et le lancement, voir le
[README](README.md).

## Vue d'ensemble

```
┌─────────────────┐        HTTP/JSON         ┌──────────────────┐        Mongoose        ┌───────────┐
│   esport-front   │ ───────────────────────▶ │    esport-back    │ ──────────────────────▶ │  MongoDB  │
│   Next.js (App   │ ◀─────────────────────── │  Express (routes  │ ◀────────────────────── │           │
│   Router), React │                           │  → controllers →  │                          └───────────┘
│                   │                           │  services → models)│
└─────────────────┘                           └──────────────────┘
```

Deux applications séparées, déployables indépendamment (voir [DEPLOYMENT.md](DEPLOYMENT.md)) :
un front Next.js qui ne parle qu'à l'API via `fetch`, et une API Express/MongoDB qui ne sait
rien du front.

## Backend : les couches et pourquoi elles existent

```
requête HTTP
     │
     ▼
  routes/            déclare "quelle URL va vers quelle fonction de contrôleur" — aucune logique
     │
     ▼
  middlewares/        authMiddleware (vérifie le JWT), roleMiddleware (vérifie le rôle admin)
     │
     ▼
  controllers/         traduit HTTP ↔ métier : lit req.body/req.params, appelle un service,
     │                 transforme le résultat (ou l'erreur) en res.status(...).json(...)
     ▼
  services/            la logique métier elle-même, sans rien connaître d'Express
     │                 (pas de req/res) — donc testable et réutilisable indépendamment de l'API
     ▼
  models/               schémas Mongoose : validation des données, hooks, index
     │
     ▼
   MongoDB
```

Chaque flèche est une frontière volontaire : un contrôleur ne touche jamais directement un
modèle métier complexe, un service ne construit jamais de réponse HTTP. Ça permet de tester la
logique de paris sans monter un serveur Express, et de changer le framework HTTP sans toucher
aux règles métier.

**Où en est cette séparation aujourd'hui :** le domaine `bets` (paris) suit ce schéma
complètement — voir [`src/services/betsService.js`](esport-back/src/services/betsService.js) et
[`src/controllers/betsController.js`](esport-back/src/controllers/betsController.js). Les autres
contrôleurs (teams, matches, players...) appellent encore directement leurs modèles Mongoose ;
c'est le prochain candidat identifié pour la même extraction, en particulier
`matchesController.updateMatch` qui contient une logique métier non triviale (résolution
automatique des paris quand un match se termine, remboursement s'il est annulé) mélangée à la
mise à jour du match.

### Exemple concret : `POST /api/pari` (placer un pari)

```
routes/betsRoutes.js
  → authMiddleware            vérifie le JWT, peuple req.user
  → betsController.createBet   lit req.body, appelle le service, renvoie 201 ou une erreur
      → betsService.createBet
          1. Match.findById            le match existe-t-il, est-il encore ouvert aux paris ?
          2. vérifie que l'équipe pariée participe bien au match
          3. Bet.findOne                 un pari existe-t-il déjà sur ce match pour cet utilisateur ?
          4. User.findOneAndUpdate       débit atomique des points (condition points >= mise
                                          dans la requête elle-même, pas de lecture puis écriture
                                          séparées — évite une perte de mise à jour si deux
                                          requêtes concurrentes débitent le même compte)
          5. Bet.save                   création du pari ; en cas d'échec (doublon détecté par
                                          l'index unique), remboursement du débit déjà effectué
      → si le service lève une erreur métier (AppError), le contrôleur la traduit en
        {status, error, message} JSON ; sinon 201 + le pari créé
```

`AppError` ([`src/utils/AppError.js`](esport-back/src/utils/AppError.js)) est une petite classe
(`statusCode`, `error`, `details`) : le service lève une erreur métier normale (`throw new
AppError(400, 'Points insuffisants', { message: '...' })`), le contrôleur la catch et la
transforme en réponse HTTP. C'est le mécanisme de communication entre les couches — le service
ne connaît jamais `res`.

## Pourquoi MongoDB / Mongoose plutôt qu'une base relationnelle

- **Relations peu profondes** : un pari référence un match, un match référence deux équipes et
  un tournoi — des relations one-to-few, résolues avec `.populate()`. Pas besoin de jointures
  complexes multi-tables.
- **Schéma qui bouge encore pendant le développement** : ajouter un champ à un document Mongoose
  ne demande pas de migration SQL.
- **Cohérence de langage** : un seul langage (JavaScript/JSON) du front jusqu'à la base, pas de
  couche ORM supplémentaire à apprendre pour ce projet.
- **Compromis assumé** : pas de transactions multi-documents. Le débit de points est fait avec
  un seul `findOneAndUpdate` atomique sur le document `User` (voir plus haut) plutôt qu'une
  transaction Mongo, ce qui suffit ici parce qu'un seul document est modifié à la fois pour
  garantir la cohérence du solde.

## Frontend

- **Next.js App Router** : les pages qui listent des données publiques (tournois, matchs) sont
  des Server Components qui `fetch` l'API au rendu ; les pages avec interaction (formulaire de
  pari, dashboard admin) sont des Client Components (`"use client"`).
- **`AuthContext`** ([`context/AuthContext.tsx`](esport-front/context/AuthContext.tsx)) : état
  d'authentification partagé (token en `localStorage`, utilisateur courant), consommé par le
  Header et les pages protégées.
- **`components/ui/button.tsx`** : composant `Button` unique basé sur `cva` (variants
  `gradient/outline/ghost/quiet/destructive`, tailles `sm/default/lg/chip/pill/pill-lg`) qui
  remplace ce qui était avant 13 classes CSS de boutons dupliquées à travers le site.

## Sécurité

- Mots de passe hashés avec `bcrypt`, jamais stockés ni renvoyés en clair.
- Authentification par JWT (`Authorization: Bearer <token>`), vérifié par `authMiddleware` sur
  chaque route protégée.
- Autorisation par rôle (`roleMiddleware`) sur les routes de gestion (admin uniquement).
- Aucune valeur monétaire réelle dans le système de paris (voir les
  [CGU](esport-front/app/cgu/page.tsx)) : les points sont virtuels, ce qui simplifie
  volontairement la surface de risque du projet.
