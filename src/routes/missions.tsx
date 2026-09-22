import { createFileRoute } from "@tanstack/react-router";
import { Bus, Users, Ticket, HeartHandshake, BookOpen, Megaphone } from "lucide-react";
import caravane from "@/assets/caravane.jpg";
import integration from "@/assets/integration.jpg";
import dons from "@/assets/dons.jpg";

export const Route = createFileRoute("/missions")({
  head: () => ({
    meta: [
      { title: "Nos Missions · AERT–UAM" },
      {
        name: "description",
        content:
          "Caravanes, intégration, dons de tickets, accompagnement académique : découvrez les actions concrètes de l'AERT–UAM.",
      },
      { property: "og:title", content: "Les missions de l'AERT–UAM" },
      {
        property: "og:description",
        content:
          "Des actions concrètes pour faciliter la vie des étudiants ressortissants de Thiès à l'UAM.",
      },
    ],
  }),
  component: MissionsPage,
});

const missions = [
  {
    icon: Bus,
    title: "Caravanes Thiès ↔ UAM",
    image: caravane,
    body:
      "Transport collectif organisé chaque semaine et lors des grandes périodes (rentrée, vacances, fêtes). Bagages pris en charge, prix négocié, départs sécurisés. C'est notre activité phare.",
  },
  {
    icon: Users,
    title: "Intégration des nouveaux",
    image: integration,
    body:
      "Accueil des nouveaux bacheliers thiéssois : journée d'orientation, parrainage par un ancien, matchs de football inter-promotions, dîner de bienvenue.",
  },
  {
    icon: Ticket,
    title: "Dons de tickets restaurant",
    image: dons,
    body:
      "Collecte et redistribution de tickets restaurant aux étudiants en difficulté financière. Aucune question, juste de la solidarité.",
  },
];

const secondary = [
  {
    icon: BookOpen,
    title: "Tutorat & accompagnement",
    body:
      "Mise en relation entre étudiants avancés et nouveaux pour le soutien académique et les révisions.",
  },
  {
    icon: HeartHandshake,
    title: "Assistance sociale",
    body:
      "Accompagnement dans les démarches administratives, bourses, logement, santé.",
  },
  {
    icon: Megaphone,
    title: "Représentation",
    body:
      "Porte-voix des étudiants de Thiès auprès de l'administration de l'UAM et des autorités locales.",
  },
];

function MissionsPage() {
  return (
    <>
      <section className="container-prose pt-20 md:pt-28 pb-10">
        <div className="gold-rule mb-5" />
        <h1 className="font-display text-5xl md:text-6xl text-primary max-w-3xl leading-[1.05]">
          Des actions concrètes, au service des étudiants.
        </h1>
        <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
          Chaque mission de l'AERT–UAM répond à un besoin réel exprimé par les étudiants
          ressortissants de Thiès. Voici comment nous agissons.
        </p>
      </section>

      <section className="container-prose py-12 space-y-20">
        {missions.map((m, i) => {
          const Icon = m.icon;
          const reverse = i % 2 === 1;
          return (
            <article
              key={m.title}
              className={`grid gap-10 md:grid-cols-2 items-center ${
                reverse ? "md:[&>:first-child]:order-2" : ""
              }`}
            >
              <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-elegant)]">
                <img
                  src={m.image}
                  alt=""
                  width={1200}
                  height={800}
                  loading="lazy"
                  className="h-full w-full object-cover aspect-[4/3]"
                />
              </div>
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-primary">
                  <Icon size={22} />
                </div>
                <h2 className="mt-5 font-display text-3xl md:text-4xl text-primary">{m.title}</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">{m.body}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="bg-card border-y border-border mt-16">
        <div className="container-prose py-20">
          <h2 className="font-display text-3xl md:text-4xl text-primary max-w-xl">
            Et bien d'autres actions au quotidien.
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {secondary.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-2xl border border-border bg-background p-6 hover:shadow-[var(--shadow-card)] transition"
                >
                  <Icon className="text-accent" size={22} />
                  <h3 className="mt-4 font-display text-xl text-primary">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
