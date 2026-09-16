export const metadata = {
  title: "Mentions légales — ESPORT PRO",
  description: "Informations légales relatives au site ESPORT PRO.",
}

export default function MentionsLegalesPage() {
  return (
    <div className="main-content">
      <div className="tournois-section">
        <div className="static-page">
          <h1 className="section-title" style={{ fontSize: "2rem" }}>Mentions légales</h1>
          <p className="static-page-updated">Dernière mise à jour : juin 2026</p>

          <section className="static-section">
            <h2>Éditeur du site</h2>
            <p>
              ESPORT PRO est un site édité dans le cadre d&apos;un projet de formation
              (titre professionnel Concepteur Développeur d&apos;Applications, My Digital
              School Bordeaux). Il n&apos;a pas de vocation commerciale.
            </p>
            <p>
              Directrice de publication : Manon Pinto.<br />
              Contact : <a href="mailto:contact@esport-pro.example">contact@esport-pro.example</a>
            </p>
          </section>

          <section className="static-section">
            <h2>Hébergement</h2>
            <p>
              Selon l&apos;environnement de déploiement, le site est hébergé sur un
              fournisseur cloud ou un serveur dédié (conteneurs Docker : API Node.js/Express,
              interface Next.js, base de données MongoDB).
            </p>
          </section>

          <section className="static-section">
            <h2>Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus du site (textes, interface, code source) est la
              propriété de son auteur, sauf mention contraire. Les noms d&apos;équipes, de
              joueurs et de tournois affichés à titre d&apos;exemple appartiennent à leurs
              titulaires respectifs et sont utilisés dans un cadre strictement pédagogique.
            </p>
          </section>

          <section className="static-section">
            <h2>Données personnelles</h2>
            <p>
              La création d&apos;un compte nécessite un nom d&apos;utilisateur, une adresse
              email et un mot de passe. Le mot de passe est stocké de façon chiffrée
              (hashage) et n&apos;est jamais accessible en clair. Ces données sont utilisées
              uniquement pour le fonctionnement du compte (authentification, historique de
              paris, classement) et ne sont ni vendues, ni transmises à des tiers.
            </p>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous
              disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos
              données. Pour l&apos;exercer, contactez-nous à l&apos;adresse indiquée
              ci-dessus.
            </p>
          </section>

          <section className="static-section">
            <h2>Cookies</h2>
            <p>
              ESPORT PRO utilise le stockage local du navigateur (localStorage) pour
              conserver votre session de connexion. Aucun cookie de suivi publicitaire ou
              d&apos;analyse tiers n&apos;est utilisé.
            </p>
          </section>

          <section className="static-section">
            <h2>Points virtuels et responsabilité</h2>
            <p>
              Les points utilisés dans le système de paris sont purement virtuels, fournis
              gratuitement à l&apos;inscription, sans valeur monétaire et non convertibles en
              argent réel. ESPORT PRO ne peut être tenu responsable d&apos;une interruption de
              service ou d&apos;une erreur d&apos;affichage des données de compétition,
              fournies à titre indicatif.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
