import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, User } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact · AERT–UAM" },
      {
        name: "description",
        content:
          "Retrouvez les coordonnées du bureau de l'AERT–UAM : président, PCS, secrétaire général, trésorier et communication.",
      },
      { property: "og:title", content: "Contacter le bureau de l'AERT–UAM" },
      {
        property: "og:description",
        content:
          "Les numéros et e-mails des membres du bureau pour vous orienter rapidement.",
      },
    ],
  }),
  component: ContactPage,
});

type Contact = {
  role: string;
  name: string;
  phone: string;
  email: string;
};

const contacts: Contact[] = [
  {
    role: "Président",
    name: "Mamadou Baila DIALLO",
    phone: "+221 76 635 28 18",
    email: "diallo.baila@uam.edu.sn",
  },
  {
    role: "Vice-Présidente",
    name: "Sophie Daba FAYE",
    phone: "+221 70 303 13 66",
    email: "faye.daba@uam.edu.sn",
  },
  {
    role: "Secrétaire Général",
    name: "Kalidou TINE",
    phone: "+221 77 810 23 92 ",
    email: "tine.kalidou@uam.edu.sn",
  },
  {
    role: "Trésoriere Générale",
    name: "Mame Diarra NGOM",
    phone: "+221 77 104 29 86",
    email: "ngom.diarra@uam.edu.sn",
  },
  {
    role: "Président Commission Sociale (PCS)",
    name: "Abdou Aziz FAYE",
    phone: "+221 78 483 26 74",
    email: "faye.aziz@uam.edu.sn",
  },
  {
    role: "Chargée de la Communication",
    name: "Maimouna GUEYE",
    phone: "+221 78 204 10 06",
    email: "gueye.maimouna@uam.edu.sn",
  },
];

function ContactPage() {
  return (
    <>
      <section className="container-prose pt-20 md:pt-28 pb-10">
        <div className="gold-rule mb-5" />
        <h1 className="font-display text-5xl md:text-6xl text-primary max-w-3xl leading-[1.05]">
          Contactez le bureau.
        </h1>
        <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
          Retrouvez ci-dessous les coordonnées des membres du bureau exécutif.
          Chaque référent est disponible pour son domaine : caravanes, social,
          trésorerie, communication ou administration générale.
        </p>
      </section>

      <section className="container-prose pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <ContactCard key={contact.role} contact={contact} />
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-primary text-primary-foreground p-8">
          <div className="text-xs uppercase tracking-[0.2em] text-accent">Contact général</div>
          <h2 className="mt-2 font-display text-2xl">Vous ne savez pas qui contacter ?</h2>
          <p className="mt-2 text-sm text-primary-foreground/80 max-w-2xl">
            Envoyez un message à l'adresse générale et nous vous orienterons vers le bon référent.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <a
              href="mailto:contact@aert-uam.sn"
              className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 hover:bg-primary-foreground/20 transition"
            >
              <Mail size={16} />
              contact@aert-uam.sn
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-primary">
          <User size={20} />
        </span>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-accent font-semibold">
            {contact.role}
          </div>
          <div className="font-display text-lg text-primary">{contact.name}</div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <a
          href={`tel:${contact.phone.replace(/\s/g, "")}`}
          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-primary">
            <Phone size={14} />
          </span>
          {contact.phone}
        </a>
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-primary">
            <Mail size={14} />
          </span>
          {contact.email}
        </a>
      </div>
    </article>
  );
}
