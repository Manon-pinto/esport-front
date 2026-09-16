export const metadata = {
  title: "FAQ — ESPORT PRO",
  description: "Les réponses aux questions les plus fréquentes sur ESPORT PRO : compte, tournois, paris et points, sécurité.",
}

interface FaqEntry {
  question: string
  answer: string
}

const CATEGORIES: { title: string; items: FaqEntry[] }[] = [
  {
    title: "Compte & inscription",
    items: [
      {
        question: "Comment créer un compte ?",
        answer:
          "Rendez-vous sur la page Inscription, renseignez un nom d'utilisateur, un email et un mot de passe. Vous recevez immédiatement un capital de points virtuels pour commencer à parier.",
      },
      {
        question: "L'inscription est-elle payante ?",
        answer:
          "Non, l'inscription et l'utilisation d'ESPORT PRO sont entièrement gratuites.",
      },
      {
        question: "J'ai oublié mon mot de passe, que faire ?",
        answer:
          "La réinitialisation de mot de passe n'est pas encore disponible sur cette version du projet. Contactez l'équipe via la page À propos en attendant.",
      },
    ],
  },
  {
    title: "Tournois & matchs",
    items: [
      {
        question: "Comment suivre un tournoi ?",
        answer:
          "La page Tournois liste tous les tournois suivis, avec leur statut (à venir, en cours, terminé), leur prize pool et leurs équipes participantes. Cliquez sur un tournoi pour voir son détail et ses matchs.",
      },
      {
        question: "À quelle fréquence les résultats sont-ils mis à jour ?",
        answer:
          "Les scores, statuts de match et classements sont mis à jour par l'équipe d'administration au fil de la compétition.",
      },
      {
        question: "Puis-je proposer un tournoi ou une équipe à ajouter ?",
        answer:
          "Sur cette version du projet, l'ajout de contenu est réservé aux comptes administrateurs.",
      },
    ],
  },
  {
    title: "Paris & points",
    items: [
      {
        question: "Comment fonctionne le système de points ?",
        answer:
          "Chaque compte reçoit un capital de points virtuels à l'inscription. Vous pouvez en miser une partie sur l'équipe que vous pensez gagnante d'un match à venir. Si votre pronostic est correct, vous remportez des points supplémentaires selon la cote affichée au moment du pari.",
      },
      {
        question: "Les points ont-ils une valeur réelle ?",
        answer:
          "Non. Les points sont purement virtuels : ils ne peuvent pas être achetés, vendus ni convertis en argent réel.",
      },
      {
        question: "Puis-je annuler un pari ?",
        answer:
          "Oui, tant que le match concerné n'a pas commencé. Une fois le match lancé, le pari est définitif.",
      },
      {
        question: "Que se passe-t-il si je n'ai plus de points ?",
        answer:
          "Vous pouvez continuer à suivre les tournois, matchs et classements librement ; il ne sera simplement plus possible de placer de nouveaux paris tant que votre solde est insuffisant.",
      },
    ],
  },
  {
    title: "Sécurité & données",
    items: [
      {
        question: "Mes données sont-elles protégées ?",
        answer:
          "Votre mot de passe est stocké chiffré et n'est jamais accessible en clair. Vos informations ne sont ni vendues, ni partagées avec des tiers. Voir les Mentions légales pour le détail.",
      },
      {
        question: "Comment supprimer mon compte et mes données ?",
        answer:
          "Contactez l'équipe via l'adresse indiquée dans les Mentions légales pour toute demande de suppression de compte, conformément au RGPD.",
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <div className="main-content">
      <div className="tournois-section">
        <div className="static-page">
          <h1 className="section-title" style={{ fontSize: "2rem" }}>Questions fréquentes</h1>
          <p className="static-page-lead">
            Tout ce qu&apos;il faut savoir sur le fonctionnement d&apos;ESPORT PRO. Une autre
            question ? Consultez notre page <a href="/a-propos" style={{ color: "#a5b4fc" }}>À propos</a>.
          </p>

          {CATEGORIES.map((cat) => (
            <div key={cat.title} className="faq-category">
              <h2 className="faq-category-title">{cat.title}</h2>
              {cat.items.map((item) => (
                <details key={item.question} className="faq-item">
                  <summary>{item.question}</summary>
                  <p className="faq-item-body">{item.answer}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
