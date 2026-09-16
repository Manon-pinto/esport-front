export const metadata = {
  title: "Conditions générales d'utilisation — ESPORT PRO",
  description: "Conditions générales d'utilisation de la plateforme ESPORT PRO.",
}

export default function CguPage() {
  return (
    <div className="main-content">
      <div className="tournois-section">
        <div className="static-page">
          <h1 className="section-title" style={{ fontSize: "2rem" }}>Conditions générales d&apos;utilisation</h1>
          <p className="static-page-updated">Dernière mise à jour : juin 2026</p>

          <section className="static-section">
            <h2>1. Objet</h2>
            <p>
              Les présentes conditions générales d&apos;utilisation (CGU) encadrent
              l&apos;accès et l&apos;usage de la plateforme ESPORT PRO : consultation des
              tournois, matchs et classements, et participation au système de paris en
              points virtuels. L&apos;utilisation du site implique l&apos;acceptation pleine
              et entière de ces CGU.
            </p>
          </section>

          <section className="static-section">
            <h2>2. Création de compte</h2>
            <p>
              La consultation des tournois, matchs et classements est accessible sans compte.
              La participation au système de paris nécessite la création d&apos;un compte
              (nom d&apos;utilisateur, email, mot de passe). Vous vous engagez à fournir des
              informations exactes et à garder vos identifiants confidentiels.
            </p>
          </section>

          <section className="static-section">
            <h2>3. Système de points et de paris</h2>
            <ul>
              <li>Chaque nouveau compte reçoit un capital de points virtuels de départ.</li>
              <li>Les points peuvent être misés sur l&apos;issue de matchs à venir ou en cours, dans les limites de mise indiquées sur chaque pari.</li>
              <li>Un pari gagnant rapporte des points selon la cote affichée au moment de la mise ; un pari perdant fait perdre la mise engagée.</li>
              <li>Un pari peut être annulé tant que le match concerné n&apos;a pas commencé.</li>
            </ul>
            <div className="static-callout">
              Les points n&apos;ont aucune valeur monétaire. Ils ne peuvent être ni achetés,
              ni vendus, ni échangés contre de l&apos;argent réel ou tout autre bien.
            </div>
          </section>

          <section className="static-section">
            <h2>4. Comportement des utilisateurs</h2>
            <p>
              Chaque utilisateur s&apos;engage à ne pas créer de comptes multiples pour
              contourner les limites de mise, à ne pas tenter d&apos;accéder aux comptes
              d&apos;autres utilisateurs, et à ne pas perturber le fonctionnement du service.
              ESPORT PRO se réserve le droit de suspendre un compte en cas de manquement à ces
              règles.
            </p>
          </section>

          <section className="static-section">
            <h2>5. Propriété intellectuelle</h2>
            <p>
              L&apos;interface, le code source et les contenus originaux d&apos;ESPORT PRO
              sont protégés. Toute reproduction non autorisée en dehors d&apos;un usage
              pédagogique est interdite.
            </p>
          </section>

          <section className="static-section">
            <h2>6. Responsabilité</h2>
            <p>
              ESPORT PRO met tout en œuvre pour assurer la disponibilité et l&apos;exactitude
              des données affichées (résultats, classements), sans garantie de continuité de
              service. Les décisions relatives aux résultats de matchs et au règlement des
              paris sont prises par l&apos;équipe d&apos;administration de la plateforme.
            </p>
          </section>

          <section className="static-section">
            <h2>7. Modification des CGU</h2>
            <p>
              Ces CGU peuvent être modifiées à tout moment. La version en vigueur est celle
              publiée sur cette page, avec sa date de mise à jour.
            </p>
          </section>

          <section className="static-section">
            <h2>8. Droit applicable</h2>
            <p>
              Les présentes CGU sont soumises au droit français.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
