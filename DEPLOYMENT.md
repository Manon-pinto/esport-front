# Déploiement

> **État actuel :** le projet n'a plus de serveur (VPS) actif — ce document décrit la procédure
> de déploiement telle qu'elle est prévue par le `docker-compose.yml` du dépôt, à exécuter sur un
> serveur cible quand il y en aura un. Rien ici ne suppose qu'un environnement de production
> tourne en ce moment.

## Ce que la CI fait déjà (et ce qu'elle ne fait pas)

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

## Architecture de déploiement prévue

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

## Variables d'environnement

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

## Procédure de déploiement type

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

## Développement local (sans Docker)

Voir la section [Installation](README.md#installation) du README — `npm run dev` dans
`esport-back/` et `esport-front/` séparément, avec MongoDB en local ou Atlas.

## Pour aller plus loin

Si un serveur cible redevient disponible, la suite logique est d'ajouter un job `deploy` à la
CI : build + push des images vers un registre (GitHub Container Registry, pas de compte tiers à
créer), puis connexion SSH au serveur pour `docker compose pull && docker compose up -d`,
déclenché uniquement sur push vers `main`. Non fait pour l'instant faute de serveur à cibler.
