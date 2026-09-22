import { createFileRoute } from "@tanstack/react-router";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { assignBusAndValidate } from "@/lib/inscriptions.server";

function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

type IpnPayload = {
  type_event?: string;
  item_price?: number | string;
  final_item_price?: number | string;
  ref_command?: string;
  token?: string;
  payment_method?: string;
  custom_field?: string;
  api_key_sha256?: string;
  api_secret_sha256?: string;
  hmac_compute?: string;
};

function verify(body: IpnPayload, apiKey: string, apiSecret: string) {
  if (body.hmac_compute) {
    const signedAmount = body.final_item_price ?? body.item_price;
    const message = `${signedAmount}|${body.ref_command}|${apiKey}`;
    const expected = createHmac("sha256", apiSecret).update(message).digest("hex");
    if (safeEqualHex(body.hmac_compute, expected)) return true;
  }
  if (body.api_key_sha256 && body.api_secret_sha256) {
    const k = createHash("sha256").update(apiKey).digest("hex");
    const s = createHash("sha256").update(apiSecret).digest("hex");
    return safeEqualHex(body.api_key_sha256, k) && safeEqualHex(body.api_secret_sha256, s);
  }
  return false;
}

function readCustomField(raw: string | undefined): { inscription_id?: string } {
  if (!raw) return {};
  const candidates = [raw];
  try {
    candidates.push(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    /* ignore */
  }
  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c) as { inscription_id?: string };
      if (parsed?.inscription_id) return parsed;
    } catch {
      /* ignore */
    }
  }
  return {};
}

export const Route = createFileRoute("/api/public/paytech-ipn")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["PAYTECH_API_KEY"];
        const apiSecret = process.env["PAYTECH_API_SECRET"];
        if (!apiKey || !apiSecret) return new Response("IPN not configured", { status: 500 });

        const contentType = request.headers.get("content-type") ?? "";
        let body: IpnPayload;
        if (contentType.includes("application/json")) {
          body = (await request.json()) as IpnPayload;
        } else {
          const form = await request.formData();
          body = Object.fromEntries(form.entries()) as IpnPayload;
        }

        if (!verify(body, apiKey, apiSecret)) {
          console.error("PayTech IPN signature rejected", {
            type_event: body.type_event,
            ref_command: body.ref_command,
            has_hmac: Boolean(body.hmac_compute),
            has_sha256: Boolean(body.api_key_sha256 && body.api_secret_sha256),
          });
          return new Response("Invalid signature", { status: 401 });
        }

        const customField = readCustomField(body.custom_field);
        let inscriptionId = customField.inscription_id;

        if (!inscriptionId && (body.token || body.ref_command)) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const identifiers = [body.token, body.ref_command].filter((value): value is string =>
            Boolean(value),
          );
          for (const identifier of identifiers) {
            const { data: inscription, error } = await supabaseAdmin
              .from("inscriptions")
              .select("id")
              .eq("payment_token", identifier)
              .maybeSingle();
            if (error) {
              console.error("PayTech IPN inscription lookup failed", error.message);
              return new Response("Lookup failed", { status: 500 });
            }
            if (inscription) {
              inscriptionId = inscription.id;
              break;
            }
          }
        }

        if (!inscriptionId) {
          console.error("PayTech IPN received without a matching inscription", {
            type_event: body.type_event,
            ref_command: body.ref_command,
            has_token: Boolean(body.token),
          });
          return new Response("Inscription not found", { status: 404 });
        }

        if (body.type_event === "sale_complete") {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: inscription, error } = await supabaseAdmin
            .from("inscriptions")
            .select("montant")
            .eq("id", inscriptionId)
            .maybeSingle();
          if (error || !inscription) return new Response("Inscription not found", { status: 404 });

          const paidAmount = Number(body.final_item_price ?? body.item_price);
          if (!Number.isFinite(paidAmount) || paidAmount !== inscription.montant) {
            console.error("PayTech IPN amount mismatch", {
              ref_command: body.ref_command,
              paid_amount: paidAmount,
              expected_amount: inscription.montant,
            });
            return new Response("Amount mismatch", { status: 400 });
          }

          const result = await assignBusAndValidate(
            inscriptionId,
            body.token ?? body.ref_command ?? null,
          );
          if (result === "not_found") return new Response("Inscription not found", { status: 404 });
        }

        if (body.type_event === "sale_canceled") {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin
            .from("inscriptions")
            .update({ statut: "refuse" })
            .eq("id", inscriptionId)
            .neq("statut", "valide");
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
