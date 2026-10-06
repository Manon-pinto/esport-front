# Tests : stratégie, exécution et résultats

> Documentation complémentaire au Dossier de projet — Partie 3, « Préparer et exécuter les plans
> de tests d'une application ».

## 1. Stratégie de test

L'application est testée à trois niveaux complémentaires, plutôt que de viser une couverture
uniforme partout :

1. **Tests unitaires frontend** (Vitest + Testing Library, 21 tests) — composants React isolés
   (formulaire de pari, carte de match, carte de tournoi) : affichage selon les données reçues,
   validation des règles métier (mise min/max, gain potentiel), interactions utilisateur.
2. **Tests d'intégration backend** (Jest + Supertest, 127 tests) — routes HTTP réelles simulées
   par Supertest, qui traversent toute la chaîne (middlewares → contrôleur → service → modèle).
   Les modèles Mongoose sont mockés, ce qui permet d'exécuter la suite sans base de données, y
   compris dans le pipeline CI.
3. **Scénarios de sécurité** (inclus dans la suite Supertest) — injections XSS, tokens JWT
   invalides/expirés, tentatives d'accès à des routes admin sans le rôle requis, données
   malformées, CORS (le frontend est autorisé, une origine inconnue ne l'est pas).

## 2. Commandes

```bash
# Backend (dans esport-back/)
npm test                # 127 tests
npm run test:coverage   # avec rapport de couverture
npm run test:watch      # mode watch en développement

# Frontend (dans esport-front/)
npm test                # 21 tests
npm run test:coverage
```

## 3. Résultats (dernière exécution)

```
Test Suites: 7 passed, 7 total
Tests:       127 passed, 127 total
Statements:  74.38% ( 639/859 )
Branches:    61.02% ( 202/331 )
Functions:   68%    ( 51/75 )
Lines:       77.91% ( 621/797 )
```

## 4. Ce qui est couvert en priorité

Toutes les routes HTTP exposées (auth, tournois, matchs, équipes, joueurs, coachs, paris) sont
testées : cas nominaux, cas d'erreur (400/401/403/404), règles métier (solde insuffisant, un seul
pari par match, résolution automatique des paris à la clôture d'un match) et cas de sécurité. La
couche service (`betsService`, `matchesService`), qui porte la logique métier la plus sensible,
est couverte à environ 90 % (lignes : 92 % pour `betsService`, 100 % pour `matchesService`).

## 5. Ce qui explique les ~26 % non couverts

- **`standingsController.js`** (~10 % couvert) : CRUD des classements (lecture, création,
  modification, suppression réservées à l'admin). Aucun fichier de test ne cible encore les routes
  `/api/classement` : c'est le principal axe d'amélioration pour dépasser 80 % de couverture.
- **Blocs `catch` des contrôleurs CRUD** (teams, players, coaches, tournaments : 70 à 80 %) :
  les réponses HTTP 500 en cas de panne de la base ne sont pas simulées. Ce sont des chemins
  d'erreur génériques, volontairement moins prioritaires que les règles métier.

## 6. Cinq risques OWASP Top 10 couverts par les tests de sécurité

| Risque | Mécanisme testé |
|---|---|
| A01 Broken Access Control | Middleware RBAC : accès à une route admin sans le rôle retourne HTTP 403 |
| A02 Cryptographic Failures | Mots de passe hachés avec bcrypt, jamais stockés en clair |
| A03 Injection | Validation et typage Mongoose ; tentative d'injection `<script>` rejetée ou échappée |
| A07 Identification and Authentication Failures | Token JWT invalide, expiré ou falsifié → HTTP 401 |
| A05 Security Misconfiguration | CORS limité aux origines du frontend : une origine inconnue ne reçoit pas l'en-tête `Access-Control-Allow-Origin` |

## 7. Maintenir les tests synchronisés avec le code

Lors de l'extraction de la logique des paris vers `betsService`, le débit des points est passé à
`User.findOneAndUpdate`. Les mocks Jest de `bet.test.js` ne simulaient pas cette méthode : six
tests ont échoué. Diagnostic : un `mockResolvedValueOnce` non consommé restait en file d'attente
et faussait le test suivant. Correction : mocks alignés sur la nouvelle signature, puis exécution
complète de la suite. C'est précisément le rôle d'une suite de tests : signaler qu'un refactoring a
changé un contrat.
