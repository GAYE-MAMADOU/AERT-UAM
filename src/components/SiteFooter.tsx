import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container-prose py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="" width={40} height={40} className="h-10 w-10" />
            <div>
              <div className="font-display text-lg">AERT–UAM</div>
              <div className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
                Étudiants de Thiès · UAM
              </div>
            </div>
          </div>
          <p className="mt-5 text-sm text-primary-foreground/75 max-w-sm leading-relaxed">
            L'Amicale des Étudiants Ressortissants de Thiès à l'Université Amadou Mahtar Mbow.
            Solidarité, accompagnement et fraternité durant le cursus universitaire.
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-accent mb-4">Navigation</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/histoire" className="hover:text-accent">Notre histoire</Link></li>
            <li><Link to="/missions" className="hover:text-accent">Nos missions</Link></li>
            <li><Link to="/bureau" className="hover:text-accent">Le bureau</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-accent mb-4">Contact</div>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li>Université Amadou Mahtar Mbow</li>
            <li>Diamniadio, Sénégal</li>
            <li>contact@aert-uam.sn</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-prose py-5 text-xs text-primary-foreground/60 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} AERT–UAM. Tous droits réservés.</span>
          <span>Fait avec dévouement pour les étudiants de Thiès.</span>
        </div>
      </div>
    </footer>
  );
}
