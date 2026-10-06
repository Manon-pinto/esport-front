# Base de données

> Documentation complémentaire au Dossier de projet — Partie 2, « Concevoir et mettre en place la
> base de données » et « Développer les composants d'accès aux données ».

## 1. Choix de MongoDB pour E-SportPro

MongoDB (NoSQL orienté documents) a été retenu plutôt qu'une base relationnelle pour plusieurs
raisons directement liées aux besoins du projet :

- **Modèle qui évolue sans migration** : le schéma est défini côté application (Mongoose), pas
  dans la base. Ajouter un champ (`avatarUrl`, `bestOf` pour le format BO1/BO3/BO5 d'un match...)
  ne demande ni script de migration ni modification de table : les documents existants restent
  valides.
- **Relations peu profondes** : un pari référence un match, un match référence deux équipes et un
  tournoi — des relations one-to-few, résolues simplement avec `.populate()` de Mongoose, sans
  jointures multi-tables complexes.
- **Cohérence de langage** : les documents sont du JSON, le format que l'API renvoie déjà au
  frontend : pas de conversion ligne/objet entre la base et le code JavaScript.
- **Hébergement** : MongoDB Atlas propose un cluster managé gratuit, compatible avec le
  déploiement serverless sur Vercel.
- **Compromis assumé** : MongoDB sait faire des transactions multi-documents (depuis la 4.0), mais
  elles n'étaient pas nécessaires ici. Le débit du solde lors d'un pari est sécurisé par une mise à
  jour atomique conditionnelle sur un seul document (voir §5), plus simple qu'une transaction, et
  suffisante puisqu'un seul document (`User`) doit rester cohérent.

*(Sur le projet WeCare, à l'inverse, une base relationnelle — MySQL/Doctrine — a été retenue :
relations strictes obligatoires entre entités, contraintes d'intégrité critiques et obligations
RGPD de traçabilité, mieux gérées nativement par un SGBD relationnel.)*

## 2. Modélisation

Une phase de modélisation a précédé l'implémentation malgré l'usage d'une base NoSQL, à l'image
de la méthode Merise utilisée pour les bases relationnelles : identification des entités, de
leurs attributs et de leurs relations (MCD/MLD, voir Annexe I du Dossier de projet), pour détecter
les problèmes de structure en amont plutôt qu'en cours de développement.

## 3. Collections

| Collection | Champs principaux | Rôle |
|---|---|---|
8 collections, chacune décrite par un modèle dans `esport-back/src/models/` :

| Collection | Champs principaux | Références | Rôle |
|---|---|---|---|
| `User` | `username`, `email` (uniques), `passwordHash` (bcrypt), `role` (`user`/`admin`), `points` | — | Comptes, authentification, solde de points |
| `Team` | `name`, `tag` (uniques), `country`, `foundedYear`, `isActive` | — | Équipes |
| `Player` | `nickname` (unique), `realName`, `nationality`, `birthDate` | `Team` | Joueurs d'une équipe |
| `Coach` | `name`, `nationality`, `experience` | `Team` | Entraîneurs d'une équipe |
| `Tournament` | `name` (unique), `game` (liste fermée), `prizePool`, dates, `status` (`upcoming`/`ongoing`/`completed`/`cancelled`) | — | Cycle de vie des tournois |
| `Match` | `scheduledAt`, `status` (`scheduled`/`live`/`completed`/`cancelled`), scores, `bestOf` (1/3/5) | `Tournament`, `Team` ×3 (équipes 1 et 2, vainqueur) | Rencontres et résultats |
| `Bet` | `amount`, `odds`, `potentialWin`, `status` (`pending`/`won`/`lost`/`cancelled`) | `User`, `Match`, `Team` (équipe pariée) | Paris placés et leur résolution |
| `Standing` | victoires, défaites, nuls, points, différence, rang | `Tournament`, `Team` | Classement d'une équipe dans un tournoi |

Chaque schéma Mongoose définit les types, champs obligatoires, valeurs autorisées (`enum`) et
valeurs par défaut : aucune écriture n'atteint la base sans passer par cette validation.

Les **index** complètent la modélisation : index sur les champs filtrés fréquemment (`status`,
`tournamentId`, `matchId`...) et deux **index uniques composés** qui portent des règles métier
directement dans la base :

- `Bet { userId, matchId }` : un joueur ne peut parier qu'une fois sur un même match, même si deux
  requêtes arrivent en même temps ;
- `Standing { tournamentId, teamId }` : une équipe n'a qu'une ligne de classement par tournoi.

## 4. Accès aux données : couche service

L'accès aux modèles Mongoose est centralisé dans la couche service
(`betsService.js`, `matchesService.js`) plutôt que dispersé dans les contrôleurs : le contrôleur
reçoit la requête HTTP et délègue, le service appelle directement les modèles et porte les règles
métier. Pas de couche Repository supplémentaire : Mongoose fournit déjà une API d'accès aux
données de haut niveau, une abstraction de plus aurait alourdi le code sans bénéfice réel à
l'échelle du projet.

## 5. Le cas critique : le débit de points lors d'un pari

```js
User.findOneAndUpdate(
  { _id: userId, points: { $gte: amount } },  // condition : solde suffisant
  { $inc: { points: -amount } }               // débit
)
```

Le filtre et la modification sont appliqués par MongoDB en une seule opération atomique. Si le
solde est insuffisant, aucun document ne correspond au filtre : rien n'est modifié et l'API
renvoie HTTP 400. Si le solde suffit, le débit est effectué ; même si deux paris sont envoyés au
même instant, le second ne peut pas « voir » l'ancien solde — le solde ne peut donc jamais devenir
négatif. Si la création du pari échoue ensuite (doublon détecté par un index unique), le débit
déjà effectué est remboursé automatiquement.

Ce choix est volontairement plus léger qu'une transaction MongoDB (pas de session à ouvrir, pas
de gestion de commit/rollback) : il suffit ici car la contrainte critique porte sur un seul
document. Si le besoin évoluait vers des opérations touchant plusieurs documents devant réussir
ou échouer ensemble, une transaction (`startSession`/`withTransaction`, supportée par MongoDB
Atlas) serait l'évolution naturelle.

## 6. Sécurité et intégrité

- Toutes les entrées sont validées par les schémas Mongoose avant toute écriture, ce qui limite
  les risques d'injection NoSQL.
- Gestion des erreurs cohérente dans toute l'API : HTTP 404 pour une ressource inexistante,
  HTTP 400 pour des données invalides ou un conflit (email déjà utilisé, pari déjà placé).
- En production, la base est hébergée sur MongoDB Atlas (cluster managé, réplication et
  sauvegardes gérées par le fournisseur) — voir la documentation complémentaire « Déploiement ».
