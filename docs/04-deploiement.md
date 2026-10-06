# Déploiement

> Documentation complémentaire au Dossier de projet — Partie 3, « Préparer et documenter le
> déploiement d'une application ». Reprend et détaille [`DEPLOYMENT.md`](../DEPLOYMENT.md), à la
> racine du dépôt.

## 1. État actuel

E-SportPro est en ligne :

- Frontend : <https://esport-front.vercel.app>
- Backend (API) : <https://esport-back.vercel.app>

Deux projets Vercel séparés (front et back sont deux applications indépendantes), plus un cluster
MongoDB Atlas gratuit pour la base.

## 2. Pourquoi Vercel + MongoDB Atlas

Une première version de l'application avait été déployée sur un VPS (serveur privé virtuel) avec
Docker Compose et un reverse proxy Caddy, mis à jour manuellement par SSH. Cette solution a été
abandonnée (plus de serveur disponible) au profit de Vercel + MongoDB Atlas :

- Gratuits, sans carte bancaire requise (contrairement à la plupart des alternatives VPS
  « gratuites »).
- Plus de serveur à administrer (mises à jour système, pare-feu, certificats).
- HTTPS automatique.
- Intégration directe avec GitHub.
- Déploiement pilotable par le pipeline CI/CD plutôt que fait à la main (voir la documentation
  complémentaire « Démarche DevOps »).

La contrepartie : un contrôle moindre sur l'infrastructure, une dépendance à des fournisseurs
tiers, et les contraintes propres au serverless (pas de processus permanent). Le caractère
stateless de l'authentification JWT rend l'API bien adaptée à ce modèle.

## 3. Base de données — MongoDB Atlas

1. Cluster gratuit (tier **M0**, 512 Mo, gratuit à vie).
2. *Network Access* : autoriser `0.0.0.0/0` (Vercel n'a pas d'IP fixe ; sans cette autorisation les
   connexions depuis les fonctions serverless sont bloquées).
3. Utilisateur de base de données dédié, chaîne de connexion
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<nom-bdd>`.

## 4. Backend — adaptation au serverless

Une app Express classique ne peut pas « écouter » un port en environnement serverless. Le dépôt
contient donc :

- `esport-back/api/index.js` : point d'entrée qui exporte directement l'app Express (compatible
  tel quel avec le runtime Node de Vercel).
- `esport-back/vercel.json` : redirige toutes les routes vers cette fonction.
- `src/app.js` : `app.listen()` n'est appelé que hors environnement Vercel (variable `VERCEL`
  positionnée automatiquement par la plateforme).

Variables d'environnement de production (saisies dans les paramètres du projet Vercel, jamais
dans le code) :

```env
MONGODB_URI=<chaîne de connexion Atlas>
JWT_SECRET=un_secret_long_et_aleatoire
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
FRONTEND_URL=https://esport-front.vercel.app   # optionnel, c'est la valeur par défaut
```

**CORS** : l'API n'accepte les appels navigateur que depuis les origines listées dans
`FRONTEND_URL` (séparées par des virgules). Sans cette variable, la liste par défaut est
`https://esport-front.vercel.app` et `http://localhost:3001`. Une autre origine ne reçoit pas
l'en-tête `Access-Control-Allow-Origin` et le navigateur bloque la réponse. Si le front change de
domaine, il faut mettre à jour cette variable puis redéployer le back.

## 5. Frontend

Second projet Vercel, Next.js détecté automatiquement. Variable d'environnement :

```env
NEXT_PUBLIC_API_URL=https://esport-back.vercel.app
```

Les variables `NEXT_PUBLIC_*` de Next.js sont figées au build : tout changement nécessite un
redéploiement du projet front pour être pris en compte.

## 6. Déploiement gardé par la CI

Le déploiement n'est **pas** déclenché par l'intégration Git automatique de Vercel : il est gardé
par le job `deploy` du pipeline GitHub Actions, qui ne se lance que si les jobs `test`,
`test-front` et `build` réussissent (`needs: [test, test-front, build]`), et seulement sur un
push vers `main`. Détails complets dans la documentation complémentaire « Démarche DevOps ».

## 7. Données de démo et premier compte admin

```bash
npm run seed                                   # équipes, joueurs, coachs, tournois, matchs de démo
npm run promote-admin -- email@exemple.com     # passe un compte inscrit en administrateur
```

L'inscription publique crée toujours un compte `role: user` : il n'y a volontairement pas de moyen
de s'auto-promouvoir admin depuis l'interface (risque de sécurité). Le premier admin se crée donc
par inscription normale puis exécution du script.

## 8. Revenir à une version précédente (rollback)

Deux méthodes, selon l'urgence :

1. **Méthode normale : `git revert`.** On annule le commit fautif par un nouveau commit, puis on
   pousse sur `main`. Le pipeline repasse les tests et redéploie : le retour arrière suit le même
   chemin contrôlé que n'importe quelle mise en production, et l'historique Git reste fidèle à ce
   qui tourne en ligne.

   ```bash
   git revert <sha-du-commit-fautif>
   git push origin main
   ```

2. **Urgence : Instant Rollback Vercel.** Dans le tableau de bord du projet (back ou front) :
   *Deployments* → choisir le dernier déploiement sain → *Instant Rollback* (ou en ligne de
   commande : `vercel rollback <url-du-deploiement>`). Effet immédiat, sans rebuild, car Vercel
   conserve chaque déploiement. Après un Instant Rollback, Vercel ne promeut plus automatiquement
   les nouveaux déploiements en production : une fois le correctif poussé, il faut le promouvoir
   manuellement (*Promote*), puis corriger le code avec la méthode 1.

Front et back étant deux projets séparés, on ne revient en arrière que sur celui qui pose
problème. Point d'attention : un rollback ne touche pas aux données de MongoDB Atlas.

## 9. Limite connue

Le tier gratuit Vercel met les fonctions en veille après une période d'inactivité : le premier
appel après une pause peut prendre quelques secondes (cold start), sans impact sur le
fonctionnement.

## 10. Alternative documentée : Docker Compose sur un serveur

Si un serveur cible redevient disponible, le dépôt reste prêt pour un déploiement auto-hébergé
complet via `docker-compose.yml` (6 services : backend, frontend, mongodb, et des outils
d'exploitation). Procédure complète dans [`DEPLOYMENT.md`](../DEPLOYMENT.md).
