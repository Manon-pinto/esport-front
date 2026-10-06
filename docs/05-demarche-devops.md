# Démarche DevOps (CI/CD)

> Documentation complémentaire au Dossier de projet — Partie 3, « Contribuer à la mise en
> production dans une démarche DevOps ».

## 1. Objectif

Automatiser au maximum le chemin entre l'écriture du code et sa mise en production, pour réduire
les erreurs humaines et garantir qu'aucune version non testée n'est mise en ligne. Implémenté avec
GitHub Actions, décrit dans [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## 2. Le pipeline

```
push sur main
   │
   ├─────────────┐
   ▼             ▼
 test         test-front        (Jest / Vitest, en parallèle)
   │             │
   └──────┬──────┘
          ▼
        build                    (build des images Docker back + front)
          ▼
        deploy                   (uniquement si test + test-front + build ont réussi)
          │
   ┌──────┴──────┐
   ▼             ▼
Vercel back   Vercel front
```

- **`test`** : dans `esport-back/`, `npm ci` puis exécution de la suite Jest + Supertest (127
  tests).
- **`test-front`** : dans `esport-front/`, exécution de la suite Vitest + Testing Library (21
  tests).
- **`build`** : construction des images Docker back et front, ce qui vérifie aussi que les
  Dockerfiles et le build Next.js (TypeScript compris) fonctionnent.
- **`deploy`** : déclare `needs: [test, test-front, build]` — il ne démarre que si les trois jobs
  précédents ont réussi, et uniquement sur un push vers `main`.

## 3. Le déploiement est explicitement gardé, pas seulement parallèle

Le point vérifié en conditions réelles : un test en échec bloque bien la mise en production, la
version en ligne reste alors la précédente (qui fonctionnait). Ce n'est pas une supposition mais
un comportement observé — un commit qui casse un test ne déclenche aucun déploiement.

## 4. Mécanique du déploiement : Deploy Hooks plutôt que le CLI Vercel

Un **Deploy Hook** Vercel est une URL fournie par Vercel pour chaque projet, stockée comme secret
GitHub (`VERCEL_DEPLOY_HOOK_BACK`, `VERCEL_DEPLOY_HOOK_FRONT`). Le job `deploy` appelle simplement
`curl -X POST` sur ces URLs — pas de token Vercel à gérer côté GitHub Actions.

## 5. Pourquoi `git.deploymentEnabled` plutôt que « Ignored Build Step »

Sans configuration supplémentaire, Vercel redéploierait automatiquement à chaque push (en plus du
déploiement déclenché par le Deploy Hook après la CI), ce qui produirait deux déploiements par
push. Deux options existaient pour désactiver le déploiement automatique sur push :

- **« Ignored Build Step »** : ce réglage agit au niveau du build, et la documentation Vercel ne
  garantit pas clairement qu'il ne bloque pas aussi les déploiements lancés par un Deploy
  Hook — risque de tout bloquer, hooks compris.
- **`git.deploymentEnabled` dans `vercel.json`** *(solution retenue)* : ne désactive que le
  déclenchement automatique par push et laisse les Deploy Hooks fonctionner normalement.

```json
{ "git": { "deploymentEnabled": { "main": false } } }
```

Présent dans `esport-back/vercel.json` et `esport-front/vercel.json`. Vérifié après mise en
place : exactement un déploiement par projet par push, déclenché par le Deploy Hook (icône
« hook » dans le tableau de bord Vercel plutôt que « commit »), et le commit qui a ajouté cette
configuration n'a lui-même déclenché aucun déploiement automatique.

## 6. Sécurisation du pipeline

- Aucune clé ni variable sensible dans le code source : secrets GitHub Actions côté CI, variables
  d'environnement Vercel côté production.
- Le déploiement est conditionné au succès de tous les tests et du build.
- Les environnements de développement, de test (CI) et de production sont strictement séparés,
  avec des variables et des configurations distinctes (voir la documentation complémentaire
  « Installation et configuration de l'environnement »).

## 7. Pistes d'amélioration identifiées

- Ajouter une étape de lint (ESLint) dans le pipeline avant les tests.
- Ajouter des tests de bout en bout (end-to-end) sur l'environnement déployé.
- Mettre en place un suivi des erreurs en production (ex. Sentry).
