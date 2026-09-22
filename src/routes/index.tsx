import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-students.jpg";
import caravane from "@/assets/caravane.jpg";
import integration from "@/assets/integration.jpg";
import dons from "@/assets/dons.jpg";
import { ArrowRight, Bus, Users, Ticket, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AERT–UAM · Amicale des étudiants de Thiès à l'UAM" },
      {
        name: "description",
        content:
          "Solidarité, accompagnement et fraternité pour les étudiants ressortissants de Thiès à l'Université Amadou Mahtar Mbow.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={hero}
          alt="Étudiants de l'AERT–UAM devant l'Université Amadou Mahtar Mbow"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
          aria-hidden
        />
        <div className="container-prose relative py-28 md:py-40 text-primary-foreground">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/85 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Amicale officielle · Université Amadou Mahtar Mbow
          </div>
          <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] max-w-3xl">
            La fraternité <em className="text-accent not-italic">thiéssoise</em> au cœur de l'UAM.
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg text-white/85 leading-relaxed">
            L'Amicale des Étudiants Ressortissants de Thiès accompagne, transporte et soutient
            chaque étudiant venu de Thiès tout au long de son cursus à l'UAM.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/missions"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition"
            >
              Découvrir nos missions <ArrowRight size={16} />
            </Link>
            <Link
              to="/bureau"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition"
            >
              Le bureau exécutif
            </Link>
          </div>

          <dl className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl border-t border-white/15 pt-8">
            {[
              ["+200", "Étudiants membres"],
              ["12", "Caravanes / an"],
              ["8", "Années d'activité"],
              ["100%", "Bénévole"],
            ].map(([k, v]) => (
              <div key={v}>
                <dt className="font-display text-3xl text-accent">{k}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-white/70">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* MISSION HIGHLIGHTS */}
      <section className="container-prose py-24">
        <div className="max-w-2xl">
          <div className="gold-rule mb-5" />
          <h2 className="font-display text-4xl md:text-5xl text-primary">
            Une mission claire : aider chaque étudiant à réussir.
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            De l'arrivée à l'UAM jusqu'à l'obtention du diplôme, l'AERT met en place des actions
            concrètes pour faciliter la vie des étudiants ressortissants de Thiès.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <MissionCard
            icon={<Bus size={20} />}
            title="Caravanes"
            text="Voyages organisés et sécurisés entre l'UAM et Thiès, bagages inclus."
            image={caravane}
          />
          <MissionCard
            icon={<Users size={20} />}
            title="Intégration"
            text="Accueil des nouveaux bacheliers : matchs, dîners, parrainage."
            image={integration}
          />
          <MissionCard
            icon={<Ticket size={20} />}
            title="Dons de tickets"
            text="Tickets restaurant et solidarité quotidienne entre membres."
            image={dons}
          />
        </div>
      </section>

      {/* CTA BAND */}
      <section className="bg-card border-y border-border">
        <div className="container-prose py-20 grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <div className="gold-rule mb-5" />
            <h3 className="font-display text-3xl md:text-4xl text-primary">
              Rejoignez une communauté qui prend soin des siens.
            </h3>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Que vous soyez nouveau bachelier ou étudiant en fin de cycle, l'AERT–UAM est votre
              famille à Diamniadio. Inscrivez-vous, participez aux caravanes, contribuez aux
              événements.
            </p>
            <Link
              to="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <HeartHandshake size={16} /> Devenir membre
            </Link>
          </div>
          <blockquote className="border-l-2 border-accent pl-6 italic font-display text-xl text-primary/90 leading-relaxed">
            « Être loin de chez soi, c'est dur. L'Amicale a transformé l'UAM en un second Thiès,
            chaleureux et solidaire. »
            <footer className="mt-4 not-italic font-sans text-sm text-muted-foreground">
              — Un étudiant en L3, promo 2024
            </footer>
          </blockquote>
        </div>
      </section>
    </>
  );
}

function MissionCard({
  icon,
  title,
  text,
  image,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  image: string;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)] border border-border/60 transition hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt=""
          width={1200}
          height={800}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent-foreground">
          <span className="text-primary">{icon}</span>
        </div>
        <h3 className="mt-4 font-display text-xl text-primary">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </article>
  );
}
