import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/bureau")({
  head: () => ({
    meta: [
      { title: "Le Bureau Exécutif · AERT–UAM" },
      {
        name: "description",
        content:
          "Rencontrez les membres du bureau exécutif de l'AERT–UAM : président, vice-président, PCS, trésorier et commissions.",
      },
      { property: "og:title", content: "Le bureau de l'AERT–UAM" },
      {
        property: "og:description",
        content:
          "Les étudiants engagés qui font vivre l'amicale au quotidien.",
      },
    ],
  }),
  component: BureauPage,
});

type Member = {
  role: string;
  name: string;
  filiere?: string;
  initials: string;
};

const executive: Member[] = [
  { role: "Président", name: "À confirmer", filiere: "Génie Informatique", initials: "PR" },
  { role: "Vice-Président", name: "À confirmer", filiere: "Sciences & Tech.", initials: "VP" },
  { role: "Secrétaire Général", name: "À confirmer", filiere: "Management", initials: "SG" },
  { role: "Trésorier Général", name: "À confirmer", filiere: "Économie", initials: "TG" },
  { role: "Président Commission Sociale (PCS)", name: "À confirmer", filiere: "Santé", initials: "CS" },
  { role: "Chargée de la Communication", name: "À confirmer", filiere: "Communication", initials: "CC" },
];

const commissions: Member[] = [
  { role: "Commission Caravanes", name: "À confirmer", initials: "CV" },
  { role: "Commission Événements", name: "À confirmer", initials: "EV" },
  { role: "Commission Tutorat", name: "À confirmer", initials: "TU" },
  { role: "Commission Relations Extérieures", name: "À confirmer", initials: "RE" },
];

function BureauPage() {
  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="container-prose py-24 md:py-32">
          <div className="text-xs uppercase tracking-[0.22em] text-accent">Mandat en cours</div>
          <h1 className="mt-4 font-display text-5xl md:text-6xl max-w-3xl leading-[1.05]">
            Le bureau exécutif <em className="not-italic text-accent">2024 – 2025</em>
          </h1>
          <p className="mt-6 max-w-2xl text-white/80 leading-relaxed">
            Ils consacrent une partie de leur temps universitaire pour faire vivre l'amicale.
            Voici l'équipe qui porte les valeurs de l'AERT–UAM cette année.
          </p>
        </div>
      </section>

      <section className="container-prose py-20">
        <div className="gold-rule mb-5" />
        <h2 className="font-display text-3xl md:text-4xl text-primary">Le bureau exécutif</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Six membres élus par l'assemblée générale des étudiants ressortissants de Thiès.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {executive.map((m) => (
            <MemberCard key={m.role} member={m} />
          ))}
        </div>
      </section>

      <section className="bg-card border-y border-border">
        <div className="container-prose py-20">
          <div className="gold-rule mb-5" />
          <h2 className="font-display text-3xl md:text-4xl text-primary">Les commissions</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Chaque commission est animée par un responsable et plusieurs membres engagés.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {commissions.map((m) => (
              <div
                key={m.role}
                className="rounded-2xl border border-border bg-background p-6 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground font-display text-xl font-bold">
                  {m.initials}
                </div>
                <h3 className="mt-4 font-display text-lg text-primary">{m.role}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{m.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-prose py-20 text-center max-w-2xl">
        <h2 className="font-display text-3xl text-primary">Vous souhaitez vous engager ?</h2>
        <p className="mt-3 text-muted-foreground">
          Les commissions sont ouvertes à tous les membres. Rejoignez celle qui correspond à votre
          envie de contribuer.
        </p>
      </section>
    </>
  );
}

function MemberCard({ member }: { member: Member }) {
  return (
    <article className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-[var(--shadow-elegant)] transition">
      <div className="aspect-[5/4] bg-gradient-to-br from-primary to-[oklch(0.3_0.06_255)] flex items-center justify-center relative">
        <div className="font-display text-6xl text-accent/90 font-semibold">{member.initials}</div>
        <div className="absolute top-3 right-3 text-[10px] uppercase tracking-widest text-white/50">
          AERT–UAM
        </div>
      </div>
      <div className="p-5 border-t border-border">
        <div className="text-[11px] uppercase tracking-[0.18em] text-accent font-semibold">
          {member.role}
        </div>
        <div className="mt-1 font-display text-xl text-primary">{member.name}</div>
        {member.filiere && (
          <div className="mt-1 text-xs text-muted-foreground">{member.filiere}</div>
        )}
      </div>
    </article>
  );
}
