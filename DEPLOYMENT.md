# Déploiement

> **État actuel :** sans VPS, le déploiement retenu est **Vercel (front + back) + MongoDB
> Atlas (base)**, entièrement gratuit et sans carte bancaire requise. La procédure Docker
> Compose plus bas reste valide et documentée pour un déploiement sur un vrai serveur si
> l'occasion se présente, mais n'est pas ce qui tourne actuellement.

## Déploiement actuel : Vercel + MongoDB Atlas

Deux projets Vercel séparés (front et back sont deux applications indépendantes, voir
[ARCHITECTURE.md](ARCHITECTURE.md)), plus un cluster MongoDB Atlas gratuit pour la base.

### 1. Base de données — MongoDB Atlas

1. Créer un compte sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) et un
   cluster gratuit (tier **M0**, 512 Mo, gratuit à vie).
2. Dans *Network Access*, autoriser `0.0.0.0/0` (Vercel n'a pas d'IP fixe, sans ça les
   connexions depuis les fonctions serverless sont bloquées).
3. Créer un utilisateur de base de données, récupérer la chaîne de connexion
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<nom-bdd>`.

### 2. Backend — Vercel

Le backend est une app Express classique ; pour tourner comme fonction serverless Vercel, le
dépôt contient :
- [`esport-back/api/index.js`](esport-back/api/index.js) : point d'entrée qui exporte l'app
  Express directement (un handler Express est compatible tel quel avec le runtime Node de
  Vercel).
- [`esport-back/vercel.json`](esport-back/vercel.json) : redirige toutes les routes vers cette
  fonction.
- `src/app.js` n'appelle `app.listen()` que hors environnement Vercel (variable `VERCEL`
  positionnée automatiquement par la plateforme) — une fonction serverless ne doit pas écouter
  de port.

Sur [vercel.com](https://vercel.com) : *Add New → Project*, importer le repo GitHub
`Manon-pinto/esport-front`, choisir **`esport-back`** comme *Root Directory*, puis définir les
variables d'environnement :

```env
MONGODB_URI=<chaîne de connexion Atlas>
JWT_SECRET=un_secret_long_et_aleatoire
JWT_EXPIRES_IN=24h
```

Vercel donne une URL du type `https://esport-back-xxxx.vercel.app`.

### 3. Frontend — Vercel

Même principe, second projet Vercel : *Add New → Project*, même repo, **`esport-front`** comme
*Root Directory*. Next.js est détecté automatiquement, aucune config supplémentaire nécessaire.
Variable d'environnement à définir :

```env
NEXT_PUBLIC_API_URL=<url du projet backend ci-dessus>
```

Les variables `NEXT_PUBLIC_*` sont figées au build : après un changement de cette valeur, il
faut redéployer (*Redeploy*) le projet front pour qu'elle soit prise en compte.

### Mise à jour

Vercel redéploie automatiquement les deux projets à chaque push sur `main` (déploiement continu
intégré, pas besoin d'un job CI dédié). Un push qui casse le build est visible dans l'onglet
*Deployments* de chaque projet Vercel.

### Limite connue

Le tier gratuit Vercel met les fonctions en veille après une période d'inactivité — le premier
appel après une pause peut prendre quelques secondes (cold start). Sans impact sur le
fonctionnement, juste sur la latence de la toute première requête.

---

## Alternative : Docker Compose sur un serveur (VPS)

Si un serveur (VPS, Oracle Cloud Always Free...) redevient disponible, le dépôt reste prêt pour
un déploiement auto-hébergé complet.

### Ce que la CI fait déjà (et ce qu'elle ne fait pas)

Le pipeline [`.github/workflows/ci.yml`](.github/workflows/ci.yml) se déclenche à chaque push et
enchaîne deux jobs de tests (`test` pour le back, `test-front` pour le front) puis un job
`build` qui construit les deux images Docker (`esport-back:ci`, `esport-front:ci`) si les tests
passent. C'est une vérification de non-régression, **pas** un déploiement automatique : il n'y a
volontairement pas de job `deploy` tant qu'aucun serveur cible n'est disponible pour le recevoir.

```
push / pull request
        │
   ┌────┴────┐
   ▼         ▼
 test    test-front        (Jest / Vitest, en parallèle)
   │         │
   └────┬────┘
        ▼
      build                (docker build back + front, seulement si les tests passent)
```

### Architecture de déploiement prévue

Le [`docker-compose.yml`](docker-compose.yml) à la racine décrit 6 services :

| Service | Rôle | Port exposé |
|---|---|---|
| `backend` | API Express | 3000 |
| `frontend` | Interface Next.js | 8080 → 3000 en interne |
| `mongodb` | Base de données (volume persistant) | interne uniquement |
| `mongo-express` | Interface d'administration MongoDB | 8081 |
| `dozzle` | Visualisation des logs des conteneurs en temps réel | 8888 |
| `portainer` | Gestion visuelle des conteneurs Docker | 9000 |

`backend` et `frontend` sont buildés à partir de leur `Dockerfile` respectif
([`esport-back/Dockerfile`](esport-back/Dockerfile),
[`esport-front/Dockerfile`](esport-front/Dockerfile)) ; les autres utilisent des images
publiques toutes faites. `mongo-express`, `dozzle` et `portainer` sont des outils d'exploitation,
pas des dépendances du produit — ils peuvent être retirés du compose pour un déploiement minimal.

### Variables d'environnement

Un fichier `.env` à la racine (à côté de `docker-compose.yml`, jamais commité) doit définir :

```env
VPS_IP=xxx.xxx.xxx.xxx              # IP ou domaine du serveur, utilisé comme NEXT_PUBLIC_API_URL au build du front
JWT_SECRET=un_secret_long_et_aleatoire
MONGO_EXPRESS_USER=admin
MONGO_EXPRESS_PASSWORD=un_mot_de_passe
```

Voir [`.env.example`](.env.example) pour le modèle. `VPS_IP` est passé comme `--build-arg
NEXT_PUBLIC_API_URL` au build de l'image front (les variables `NEXT_PUBLIC_*` de Next.js sont
figées au build, pas lues au runtime — le front doit donc être rebuildé si l'adresse de l'API
change).

### Procédure de déploiement type

Sur le serveur cible (Docker et Docker Compose installés) :

```bash
git clone <url-du-depot>
cd esport
cp .env.example .env
# éditer .env avec les vraies valeurs (VPS_IP, JWT_SECRET, ...)

docker compose up -d --build
```

Ça construit les images back/front et démarre les 6 services. Pour mettre à jour après un
nouveau push :

```bash
git pull
docker compose up -d --build
```

Pour arrêter :

```bash
docker compose down          # garde les données MongoDB (volume nommé)
docker compose down -v       # supprime aussi les données
```

### Développement local (sans Docker)

Voir la section [Installation](README.md#installation) du README — `npm run dev` dans
`esport-back/` et `esport-front/` séparément, avec MongoDB en local ou Atlas.

### Pour aller plus loin

Si un serveur cible redevient disponible, la suite logique est d'ajouter un job `deploy` à la
CI : build + push des images vers un registre (GitHub Container Registry, pas de compte tiers à
créer), puis connexion SSH au serveur pour `docker compose pull && docker compose up -d`,
déclenché uniquement sur push vers `main`. Non fait pour l'instant faute de serveur à cibler.
