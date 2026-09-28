import type { ReactNode } from "react";

export const LEGAL_LAST_UPDATE = "28 septembre 2026";

export function LegalLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <section className="container-prose pt-20 md:pt-28 pb-8">
        <div className="gold-rule mb-5" />
        <h1 className="font-display text-4xl md:text-5xl text-primary max-w-3xl leading-[1.05]">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">{intro}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Dernière mise à jour : {LEGAL_LAST_UPDATE}
        </p>
      </section>
      <section className="container-prose pb-24">
        <div className="max-w-3xl space-y-10">{children}</div>
      </section>
    </>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-primary mb-3">{title}</h2>
      <div className="space-y-3 text-sm md:text-base text-foreground/85 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-primary [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
