import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import QrScanner from "qr-scanner";
import { checkInInscription } from "@/lib/checkin.functions";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, ScanLine, CameraOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/scan")({
  component: AdminScan,
});

type ScanResult = Awaited<ReturnType<typeof checkInInscription>>;

function AdminScan() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const checkIn = useServerFn(checkInInscription);
  const busyRef = useRef(false);

  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      async (scanResult) => {
        if (busyRef.current) return;
        busyRef.current = true;
        try {
          const res = await checkIn({ data: { scanned: scanResult.data } });
          setResult(res);
        } catch (err) {
          setResult({ status: "invalid" } as ScanResult);
        }
        // Petite pause avant de réaccepter un nouveau scan, pour laisser le temps
        // de lire le résultat et éviter de re-scanner le même badge en boucle.
        setTimeout(() => {
          busyRef.current = false;
        }, 2000);
      },
      { highlightScanRegion: true, highlightCodeOutline: true, preferredCamera: "environment" },
    );
    scannerRef.current = scanner;
    scanner.start().catch(() => {
      setCameraError(
        "Impossible d'accéder à la caméra. Vérifie les permissions du navigateur (et que le site est bien en HTTPS).",
      );
    });

    return () => {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [checkIn]);

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-1">
        <ScanLine className="h-5 w-5 text-primary" />
        <h1 className="font-display text-2xl text-primary">Contrôle d'embarquement</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Scanne le QR code du billet de chaque passager pour l'enregistrer comme embarqué.
      </p>

      <div className="rounded-xl overflow-hidden border border-border bg-black aspect-square relative">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/90 text-white p-6 text-center">
            <CameraOff className="h-8 w-8" />
            <p className="text-sm">{cameraError}</p>
          </div>
        )}
      </div>

      {result && (
        <div
          className={`mt-5 rounded-xl border p-4 flex items-start gap-3 ${
            result.status === "ok"
              ? "border-emerald-500/40 bg-emerald-500/10"
              : result.status === "already"
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-destructive/40 bg-destructive/10"
          }`}
        >
          {result.status === "ok" && <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />}
          {result.status === "already" && (
            <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
          )}
          {(result.status === "invalid" ||
            result.status === "not_found" ||
            result.status === "not_paid") && <XCircle className="h-6 w-6 text-destructive shrink-0" />}

          <div className="text-sm">
            {result.status === "ok" && (
              <>
                <div className="font-medium text-emerald-700">Embarquement enregistré ✓</div>
                <div>{result.nom_complet}</div>
                <div className="text-muted-foreground">
                  {result.caravane_titre}
                  {result.bus_label ? ` — ${result.bus_label}` : ""}
                </div>
              </>
            )}
            {result.status === "already" && (
              <>
                <div className="font-medium text-amber-700">Déjà scanné</div>
                <div>{result.nom_complet}</div>
                <div className="text-muted-foreground">
                  {result.caravane_titre}
                  {result.bus_label ? ` — ${result.bus_label}` : ""}
                  {result.embarque_le
                    ? ` · à ${new Date(result.embarque_le).toLocaleTimeString("fr-FR")}`
                    : ""}
                </div>
              </>
            )}
            {result.status === "not_paid" && (
              <>
                <div className="font-medium text-destructive">Paiement non validé</div>
                <div>
                  {result.nom_complet} ({result.reference})
                </div>
              </>
            )}
            {result.status === "not_found" && (
              <div className="font-medium text-destructive">Billet introuvable</div>
            )}
            {result.status === "invalid" && (
              <div className="font-medium text-destructive">
                QR code non reconnu — réessaie.
              </div>
            )}
          </div>
        </div>
      )}

      <Button variant="outline" className="mt-4 w-full" onClick={() => setResult(null)}>
        Effacer et continuer à scanner
      </Button>
    </div>
  );
}
