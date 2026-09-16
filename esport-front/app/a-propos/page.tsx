export const metadata = {
  title: "À propos — ESPORT PRO",
  description: "La mission d'ESPORT PRO : suivre les tournois esport, comparer les équipes et jouer avec des points virtuels.",
}

export default function AProposPage() {
  return (
    <div className="main-content">
      <div className="tournois-section">
        <div className="static-page">
          <h1 className="section-title" style={{ fontSize: "2rem" }}>À propos d&apos;ESPORT PRO</h1>
          <p className="static-page-lead">
            ESPORT PRO est une plateforme de suivi de tournois esport : classements en temps réel,
            fiches équipes et joueurs, calendrier des matchs, et un système de paris en points
            virtuels pour suivre la compétition autrement.
          </p>

          <section className="static-section">
            <h2>Notre mission</h2>
            <p>
              Rendre le suivi de la compétition esport aussi simple et lisible que possible :
              une seule plateforme pour voir où en sont les équipes, quand a lieu le prochain
              match, et qui domine le classement — sans jongler entre dix sites différents.
            </p>
          </section>

          <section className="static-section">
            <h2>Comment ça marche</h2>
            <p>
              Chaque tournoi suivi sur ESPORT PRO regroupe ses équipes, son calendrier de matchs
              et son classement, mis à jour au fil des résultats. Les utilisateurs inscrits
              reçoivent un capital de points virtuels et peuvent les miser sur l&apos;issue des
              matchs à venir pour grimper au classement des parieurs.
            </p>
            <div className="static-callout">
              Les points utilisés sur ESPORT PRO sont purement virtuels : ils ne représentent
              aucune valeur monétaire et ne peuvent ni être achetés, ni être convertis en argent réel.
            </div>
          </section>

          <section className="static-section">
            <h2>Un projet pédagogique</h2>
            <p>
              ESPORT PRO est développé dans le cadre du titre professionnel Concepteur
              Développeur d&apos;Applications (CDA) à My Digital School Bordeaux. C&apos;est un
              projet fil rouge : l&apos;occasion de construire une application complète, de
              l&apos;API jusqu&apos;à l&apos;interface, avec une vraie exigence de qualité et de
              sécurité.
            </p>
          </section>

          <section className="static-section">
            <h2>Nos valeurs</h2>
            <ul>
              <li><strong>Fair-play</strong> — la compétition avant tout, dans le respect des équipes et des joueurs.</li>
              <li><strong>Transparence</strong> — des classements et des règles de paris clairs, sans surprise.</li>
              <li><strong>Simplicité</strong> — une interface pensée pour trouver l&apos;information en quelques secondes.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
