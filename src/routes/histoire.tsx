import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/histoire")({
  head: () => ({
    meta: [
      { title: "Notre Histoire · AERT–UAM" },
      {
        name: "description",
        content:
          "Découvrez l'histoire de l'Amicale des Étudiants Ressortissants de Thiès à l'UAM, ses origines et ses étapes marquantes.",
      },
      { property: "og:title", content: "L'histoire de l'AERT–UAM" },
      {
        property: "og:description",
        content:
          "De quelques étudiants à toute une famille thiéssoise à l'Université Amadou Mahtar Mbow.",
      },
    ],
  }),
  component: HistoirePage,
});

const milestones = [
  {
    year: "2017",
    title: "La naissance",
    body:
      "Quelques étudiants thiéssois, fraîchement débarqués à l'UAM, décident de se regrouper pour s'entraider face aux défis du quotidien : logement, transport, intégration.",
  },
  {
    year: "2018",
    title: "Première caravane officielle",
    body:
      "Organisation du premier transport collectif Thiès ↔ UAM avec gestion des bagages, modèle qui deviendra la marque de fabrique de l'amicale.",
  },
  {
    year: "2020",
    title: "Élargissement des missions",
    body:
      "Création de la commission sociale : dons de tickets restaurant, assistance aux étudiants en difficulté, accompagnement administratif.",
  },
  {
    year: "2022",
    title: "Reconnaissance institutionnelle",
    body:
      "L'AERT est officiellement reconnue par l'administration de l'UAM et devient un interlocuteur clé pour l'accueil des nouveaux bacheliers de Thiès.",
  },
  {
    year: "2025",
    title: "Le tournant numérique",
    body:
      "Lancement de la plateforme web pour gérer les caravanes, archiver la mémoire de l'amicale et rapprocher tous ses membres.",
  },
];

function HistoirePage() {
  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="container-prose py-24 md:py-32">
          <div className="text-xs uppercase tracking-[0.22em] text-accent">Notre récit</div>
          <h1 className="mt-4 font-display text-5xl md:text-6xl max-w-3xl leading-[1.05]">
            Une histoire de fraternité, écrite par les étudiants de Thiès.
          </h1>
          <p className="mt-6 max-w-2xl text-white/80 leading-relaxed">
            L'AERT–UAM n'est pas née dans un bureau. Elle est née dans les couloirs, les chambres
            partagées et les longs trajets entre Thiès et Diamniadio. Voici comment elle s'est
            construite, année après année.
          </p>
        </div>
      </section>

      <section className="container-prose py-24">
        <ol className="relative border-l-2 border-accent/40 pl-8 md:pl-12 space-y-14">
          {milestones.map((m) => (
            <li key={m.year} className="relative">
              <span className="absolute -left-[42px] md:-left-[54px] flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-display text-sm font-bold shadow-[var(--shadow-card)]">
                {m.year.slice(2)}
              </span>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {m.year}
              </div>
              <h2 className="mt-2 font-display text-3xl text-primary">{m.title}</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">{m.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-card border-t border-border">
        <div className="container-prose py-20 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="gold-rule mb-5" />
            <h2 className="font-display text-3xl md:text-4xl text-primary">Nos valeurs</h2>
          </div>
          <div className="space-y-6">
            {[
              ["Solidarité", "Personne ne reste seul face aux difficultés du parcours universitaire."],
              ["Excellence", "L'entraide au service de la réussite académique de chacun."],
              ["Fraternité", "Thiès est plus qu'une origine, c'est un lien."],
              ["Bénévolat", "100% du travail est réalisé par des étudiants engagés."],
            ].map(([t, d]) => (
              <div key={t} className="border-l-2 border-accent pl-5">
                <h3 className="font-display text-xl text-primary">{t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
