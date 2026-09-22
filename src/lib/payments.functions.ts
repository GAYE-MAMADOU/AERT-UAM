import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

export const createPaytechPayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ inscription_id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["PAYTECH_API_KEY"];
    const apiSecret = process.env["PAYTECH_API_SECRET"];
    if (!apiKey || !apiSecret) {
      return { error: "Paiement mobile non configuré." as string, url: null };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: insc, error } = await supabaseAdmin
      .from("inscriptions")
      .select(
        "id, reference, nom_complet, telephone, email, montant, statut, caravanes(titre, trajet)",
      )
      .eq("id", data.inscription_id)
      .maybeSingle();

    if (error || !insc) return { error: "Inscription introuvable.", url: null };
    if (insc.statut === "valide") return { error: "Inscription déjà validée.", url: null };

    const caravane = insc.caravanes as unknown as { titre: string; trajet: string } | null;

    const referer = getRequestHeader("referer");
    const requestOrigin = getRequestHeader("origin") ?? (referer ? new URL(referer).origin : "");
    // PAYTECH_PUBLIC_BASE_URL doit être l'URL publique (https) de ton site :
    // - en local avec un tunnel (ngrok/cloudflared) : l'URL du tunnel
    // - sur Vercel/Netlify preview ou prod : l'URL de ce déploiement
    // On ne devine plus une URL Lovable : sans cette variable, on refuse plutôt que
    // d'envoyer PayTech vers une URL qui n'existe plus.
    const configuredBase = process.env["PAYTECH_PUBLIC_BASE_URL"];
    const webhookBase =
      configuredBase ?? (requestOrigin.startsWith("https://") ? requestOrigin : null);

    if (!webhookBase) {
      return {
        error:
          "PAYTECH_PUBLIC_BASE_URL n'est pas configurée et l'origine de la requête n'est pas en https. " +
          "Impossible de générer une IPN URL fiable (obligatoire même en mode test).",
        url: null,
      };
    }
    const returnBase = requestOrigin.startsWith("https://") ? requestOrigin : webhookBase;

    const refCommand = `${insc.reference}-${Date.now()}`;

    // Sécurité : par défaut on force le mode "test" tant que PAYTECH_ENV n'est pas
    // explicitement mis à "prod". Avant, l'absence de cette variable envoyait en
    // PROD par défaut (risque de vrais paiements pendant les tests).
    const paytechEnv = process.env["PAYTECH_ENV"] === "prod" ? "prod" : "test";

    const payload = {
      item_name: `Caravane ${caravane?.titre ?? ""} — ${caravane?.trajet ?? ""}`.trim(),
      item_price: insc.montant,
      currency: "XOF",
      ref_command: refCommand,
      command_name: `Inscription caravane AERT-UAM (${insc.reference})`,
      env: paytechEnv,
      target_payment: "Orange Money, Wave, Free Money, Wizall, Carte Bancaire",
      ipn_url: `${webhookBase}/api/public/paytech-ipn`,
      success_url: `${returnBase}/caravanes?payment=${encodeURIComponent(insc.id)}`,
      cancel_url: `${returnBase}/caravanes?cancelled=${encodeURIComponent(insc.reference)}`,
      custom_field: JSON.stringify({ inscription_id: insc.id, reference: insc.reference }),
    };

    const res = await fetch("https://paytech.sn/api/payment/request-payment", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        API_KEY: apiKey,
        API_SECRET: apiSecret,
      },
      body: JSON.stringify(payload),
    });

    const json = (await res.json()) as {
      success?: number;
      token?: string;
      redirect_url?: string;
      redirectUrl?: string;
      message?: string;
      error?: unknown;
    };

    const url = json.redirect_url ?? json.redirectUrl ?? null;
    if (!res.ok || json.success !== 1 || !url) {
      console.error("PayTech request-payment error", json);
      return {
        error:
          json.message ?? (Array.isArray(json.error) ? String(json.error[0]) : "Erreur PayTech."),
        url: null,
      };
    }

    await supabaseAdmin
      .from("inscriptions")
      .update({
        payment_token: json.token ?? refCommand,
        payment_url: url,
        moyen_paiement: "paytech",
      })
      .eq("id", insc.id);

    return { error: null, url };
  });

export const reconcilePaytechPayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ inscription_id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["PAYTECH_API_KEY"];
    const apiSecret = process.env["PAYTECH_API_SECRET"];
    if (!apiKey || !apiSecret) return { status: "error" as const, reference: null };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inscription } = await supabaseAdmin
      .from("inscriptions")
      .select("id, reference, montant, statut, payment_token")
      .eq("id", data.inscription_id)
      .maybeSingle();

    if (!inscription?.payment_token)
      return { status: "pending" as const, reference: inscription?.reference ?? null };
    if (inscription.statut === "valide")
      return { status: "validated" as const, reference: inscription.reference };

    const response = await fetch(
      `https://paytech.sn/api/payment/get-status?token_payment=${encodeURIComponent(inscription.payment_token)}`,
      { headers: { Accept: "application/json", API_KEY: apiKey, API_SECRET: apiSecret } },
    );
    if (!response.ok) return { status: "pending" as const, reference: inscription.reference };

    const result = (await response.json()) as {
      success?: number;
      payment?: {
        state?: string;
        ref_command?: string;
        item_price?: number | string;
        token?: string;
      };
    };
    const payment = result.payment;
    const amountMatches = Number(payment?.item_price) === inscription.montant;
    const referenceMatches = payment?.ref_command?.startsWith(`${inscription.reference}-`) === true;

    if (result.success === 1 && payment?.state === "success" && amountMatches && referenceMatches) {
      const { assignBusAndValidate } = await import("@/lib/inscriptions.server");
      await assignBusAndValidate(inscription.id, payment.token ?? inscription.payment_token);
      return { status: "validated" as const, reference: inscription.reference };
    }

    return { status: "pending" as const, reference: inscription.reference };
  });
