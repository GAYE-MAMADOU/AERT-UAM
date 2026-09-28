import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité · AERT–UAM" },
      {
        name: "description",
        content:
          "Comment l'AERT–UAM collecte, utilise et protège les données personnelles des étudiants qui s'inscrivent aux caravanes.",
      },
      { property: "og:title", content: "Politique de confidentialité · AERT–UAM" },
    ],
  }),
  component: ConfidentialitePage,
});

function ConfidentialitePage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      intro="Cette page explique quelles données personnelles l'AERT–UAM collecte lorsque tu utilises ce site (notamment pour t'inscrire à une caravane), pourquoi, et quels sont tes droits."
    >
      <LegalSection title="1. Qui est responsable de tes données ?">
        <p>
          Le responsable du traitement est l'Amicale des Étudiants Ressortissants de Thiès à
          l'Université Amadou Mahtar Mbow (AERT–UAM), Diamniadio, Sénégal. Pour toute question :{" "}
          <a href="mailto:contact@aert-uam.sn">contact@aert-uam.sn</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Quelles données collectons-nous ?">
        <p>Lors d'une inscription à une caravane :</p>
        <ul>
          <li>ton nom complet et ton numéro de téléphone ;</li>
          <li>ton adresse e-mail (si tu la renseignes) ;</li>
          <li>le nombre de bagages déclarés ;</li>
          <li>
            les informations liées à ton inscription : caravane choisie, référence d'inscription,
            montant, moyen et référence de paiement, statut (en attente, validée, refusée), bus
            attribué ;
          </li>
          <li>
            ton embarquement : lorsque ton billet est scanné, nous enregistrons que tu es monté
            dans le bus, ainsi que la date, l'heure et le membre du bureau qui a scanné.
          </li>
        </ul>
        <p>
          Pour les membres du bureau qui se connectent à l'espace de gestion : adresse e-mail,
          mot de passe (stocké de façon chiffrée par notre prestataire d'authentification) et rôle
          attribué.
        </p>
        <p>
          Nous ne collectons pas ton numéro de carte bancaire, ni ton code secret Wave ou Orange
          Money : le paiement se fait sur la page sécurisée de notre prestataire de paiement.
        </p>
      </LegalSection>

      <LegalSection title="3. Pourquoi utilisons-nous ces données ?">
        <ul>
          <li>enregistrer et valider ton inscription à une caravane ;</li>
          <li>t'attribuer une place dans un bus et gérer la capacité des bus ;</li>
          <li>confirmer ton paiement et générer ton billet avec QR code ;</li>
          <li>contrôler l'embarquement le jour du départ ;</li>
          <li>te retrouver si tu as un problème avec ton inscription (vérification par référence et téléphone) ;</li>
          <li>tenir les comptes de l'association.</li>
        </ul>
        <p>
          Nous n'utilisons pas tes données à des fins publicitaires et nous ne les vendons pas.
        </p>
      </LegalSection>

      <LegalSection title="4. Qui a accès à tes données ?">
        <ul>
          <li>
            <strong>Les membres du bureau</strong> autorisés (rôles « bureau » et « admin »)
            peuvent consulter les inscriptions pour gérer les caravanes.
          </li>
          <li>
            <strong>PayTech</strong>, notre prestataire de paiement, traite ton paiement (Orange
            Money, Wave, Free Money, Wizall, carte bancaire). Nous lui transmettons le libellé de
            la caravane, le montant et ta référence d'inscription ; tu saisis tes informations de
            paiement directement chez lui. Ses propres règles de confidentialité s'appliquent.
          </li>
          <li>
            <strong>Nos prestataires techniques</strong> : Supabase (base de données et
            authentification) et Netlify (hébergement du site). Ils stockent et font fonctionner
            le service pour notre compte. Leurs serveurs peuvent se trouver en dehors du Sénégal.
          </li>
        </ul>
        <p>Nous ne transmettons pas tes données à d'autres tiers, sauf obligation légale.</p>
      </LegalSection>

      <LegalSection title="5. Ton billet et ton lien personnel">
        <p>
          Ton billet est accessible via un lien unique. Toute personne qui possède ce lien peut
          voir ton billet (nom, référence, caravane, bus). Ne le partage donc pas publiquement.
          La page « Caravanes » permet aussi de retrouver une inscription avec la référence
          <em> et</em> le numéro de téléphone utilisés à l'inscription.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies et traceurs">
        <p>
          Ce site n'utilise ni cookies publicitaires ni outil de mesure d'audience. Pour les
          membres du bureau connectés, le navigateur conserve une session de connexion afin de
          rester identifié ; elle disparaît quand tu te déconnectes.
        </p>
      </LegalSection>

      <LegalSection title="7. Combien de temps gardons-nous tes données ?">
        <p>
          Nous conservons les données d'inscription le temps nécessaire à l'organisation de la
          caravane, à la gestion d'éventuelles réclamations et à la tenue des comptes de
          l'association. Ensuite, elles sont supprimées ou anonymisées. Tu peux aussi demander
          leur suppression avant (voir ci-dessous).
        </p>
      </LegalSection>

      <LegalSection title="8. Sécurité">
        <p>
          Les échanges avec le site sont chiffrés (HTTPS). L'accès aux données d'inscription est
          réservé aux membres autorisés du bureau et protégé par des règles d'accès au niveau de
          la base de données. Aucun système n'est infaillible, mais nous limitons l'accès au
          strict nécessaire.
        </p>
      </LegalSection>

      <LegalSection title="9. Tes droits">
        <p>
          Conformément à la loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des
          données à caractère personnel, tu peux demander l'accès à tes données, leur
          rectification, leur suppression, ou t'opposer à leur traitement pour un motif légitime.
          Écris-nous à <a href="mailto:contact@aert-uam.sn">contact@aert-uam.sn</a> en indiquant
          ta référence d'inscription et ton numéro de téléphone pour que nous puissions te
          retrouver. Si tu estimes que tes droits ne sont pas respectés, tu peux saisir la
          Commission de Protection des Données Personnelles (CDP) du Sénégal.
        </p>
      </LegalSection>

      <LegalSection title="10. Modifications">
        <p>
          Nous pouvons mettre à jour cette politique, par exemple si une nouvelle fonctionnalité
          collecte de nouvelles données. La date de dernière mise à jour figure en haut de cette
          page. Consulte aussi nos{" "}
          <Link to="/conditions">conditions d'utilisation</Link>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
