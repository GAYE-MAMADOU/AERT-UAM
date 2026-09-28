import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";

export const Route = createFileRoute("/conditions")({
  head: () => ({
    meta: [
      { title: "Conditions d'utilisation · AERT–UAM" },
      {
        name: "description",
        content:
          "Règles d'utilisation du site de l'AERT–UAM : inscription aux caravanes, paiement, billet QR code et contrôle d'embarquement.",
      },
      { property: "og:title", content: "Conditions d'utilisation · AERT–UAM" },
    ],
  }),
  component: ConditionsPage,
});

function ConditionsPage() {
  return (
    <LegalLayout
      title="Conditions d'utilisation"
      intro="En utilisant ce site et en t'inscrivant à une caravane, tu acceptes les règles ci-dessous. Elles sont volontairement simples : elles visent à ce que chacun voyage dans de bonnes conditions."
    >
      <LegalSection title="1. Objet du site">
        <p>
          Ce site est proposé par l'Amicale des Étudiants Ressortissants de Thiès à l'Université
          Amadou Mahtar Mbow (AERT–UAM). Il permet de découvrir l'association, de s'inscrire aux
          caravanes organisées entre Thiès et l'UAM, de payer sa place et de récupérer son billet.
        </p>
      </LegalSection>

      <LegalSection title="2. Inscription à une caravane">
        <ul>
          <li>
            Tu t'engages à fournir des informations exactes (nom complet, numéro de téléphone,
            nombre de bagages). Une information fausse peut entraîner le refus de l'inscription
            ou de l'embarquement.
          </li>
          <li>
            Les places sont limitées. Une inscription n'est définitive qu'une fois le paiement
            confirmé et l'inscription passée au statut « validée ».
          </li>
          <li>
            Une place est attribuée dans un bus disponible ; le bureau peut ouvrir ou fermer des
            bus en fonction de la demande.
          </li>
          <li>Une inscription concerne une seule personne.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Paiement">
        <p>
          Le paiement s'effectue en ligne via notre prestataire PayTech (Orange Money, Wave, Free
          Money, Wizall ou carte bancaire), en francs CFA (XOF). Dès que le paiement est confirmé,
          ton inscription est validée automatiquement et ton billet est disponible. Si ton
          paiement est débité mais que ton inscription reste en attente, contacte le bureau avec
          ta référence d'inscription et la preuve de paiement.
        </p>
        <p>
          Les conditions d'annulation et de remboursement sont fixées par le bureau pour chaque
          caravane. Pour toute demande, contacte-nous via la page{" "}
          <Link to="/contact">Contact</Link>.
        </p>
      </LegalSection>

      <LegalSection title="4. Billet et embarquement">
        <ul>
          <li>
            Ton billet contient un QR code personnel. Présente-le (à l'écran ou en capture
            d'écran) au membre du bureau chargé du contrôle avant de monter dans le bus.
          </li>
          <li>
            Le billet est scanné à l'embarquement : un billet déjà scanné est signalé au
            contrôleur. Ne partage pas ton billet et ne le publie pas, car une autre personne
            pourrait l'utiliser à ta place.
          </li>
          <li>
            Les membres du bureau peuvent refuser l'accès au bus en cas de billet invalide, de
            paiement non validé ou de comportement mettant en danger la sécurité du groupe.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Comportement et bagages">
        <p>
          Tu t'engages à respecter les consignes des organisateurs et du chauffeur, les horaires
          de départ et les autres voyageurs. Les bagages doivent correspondre à ce que tu as
          déclaré lors de l'inscription.
        </p>
      </LegalSection>

      <LegalSection title="6. Utilisation correcte du site">
        <p>
          Tu t'engages à ne pas tenter d'accéder à l'espace de gestion sans autorisation, à ne
          pas perturber le fonctionnement du site et à ne pas utiliser de fausses identités. L'accès
          à l'espace de gestion est réservé aux membres du bureau à qui un rôle a été attribué.
        </p>
      </LegalSection>

      <LegalSection title="7. Responsabilité">
        <p>
          L'AERT–UAM met tout en œuvre pour que le site soit disponible et exact, mais ne peut
          garantir l'absence d'interruption ou d'erreur. Les horaires et lieux de départ peuvent
          être modifiés pour des raisons d'organisation ; nous te prévenons dans la mesure du
          possible. L'association agit comme organisatrice de transport collectif entre
          étudiants et n'est pas responsable des objets non déclarés ou laissés sans surveillance.
        </p>
      </LegalSection>

      <LegalSection title="8. Données personnelles">
        <p>
          Le traitement de tes données est détaillé dans notre{" "}
          <Link to="/confidentialite">politique de confidentialité</Link>.
        </p>
      </LegalSection>

      <LegalSection title="9. Modification des conditions et droit applicable">
        <p>
          Nous pouvons modifier ces conditions ; la version en vigueur est celle publiée sur cette
          page, avec sa date de mise à jour. Elles sont régies par le droit sénégalais. Pour toute
          question : <a href="mailto:contact@aert-uam.sn">contact@aert-uam.sn</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
