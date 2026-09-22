# Guide de migration — sortir de Lovable Cloud

Ce document explique comment migrer ce projet vers ton propre Supabase, corriger
le mode test PayTech, et déployer sur Vercel.

## 0. Ce qui a été changé dans le code

- `.env` (contenait tes vraies clés Lovable) supprimé et remplacé par
  `.env.example` (sans secrets). `.env` est maintenant dans `.gitignore` —
  crée ton propre `.env` local à partir de `.env.example`, il ne sera jamais commité.
- `supabase/config.toml` : `project_id` mis à un placeholder, à remplacer par
  la référence de ton nouveau projet.
- `supabase/functions/create-payment` et `supabase/functions/paydunya-webhook` :
  supprimés. Ils étaient déjà désactivés (code mort, renvoyaient une 410) —
  le vrai flux de paiement passe par `src/routes/api/public/paytech-ipn.ts`.
- `src/lib/payments.functions.ts` :
  - Suppression de l'URL de preview Lovable codée en dur (`previewBase`).
    Le code exige maintenant une variable `PAYTECH_PUBLIC_BASE_URL` explicite
    (ou une origine `https://` valide) pour construire les URLs IPN/retour —
    sinon il refuse proprement plutôt que d'envoyer PayTech vers une URL morte.
  - `PAYTECH_ENV` : avant, l'absence de cette variable envoyait en **mode
    prod par défaut**. Maintenant, tout ce qui n'est pas explicitement
    `"prod"` est traité comme `"test"` — plus sûr pendant le développement.
- `vite.config.ts` + `vercel.json` : le preset Nitro par défaut de
  `@lovable.dev/vite-tanstack-config` cible **Cloudflare**, pas Vercel. Sans
  changement, le build déployé sur Vercel donne des 404 sur toutes les routes.
  J'ai ajouté un override `nitro: { preset: "vercel", ... }` + un `vercel.json`
  qui pointe vers la sortie prébuild (`.vercel/output`).

## 1. Créer le schéma sur ton nouveau projet Supabase

Le dossier `supabase/migrations/` contient déjà tout l'historique du schéma
(tables, RLS, fonctions, rôles) dans l'ordre chronologique — pas besoin de le
réécrire à la main.

```bash
npm install -g supabase   # si la CLI n'est pas déjà installée
cd aert-uam-connect-main
supabase login
supabase link --project-ref bjwhdjesyqikbbahmmga
supabase db push                            # applique toutes les migrations dans l'ordre
```

`supabase db push` exécute chaque fichier de `supabase/migrations/` dans
l'ordre de son timestamp, exactement comme Lovable Cloud l'a fait sur
l'ancien projet.

### Ce qui NE migre PAS automatiquement (à refaire à la main)

1. **Les comptes `auth.users` existants** (les membres du bureau qui se sont
   déjà inscrits sur `/auth`) — les migrations ne contiennent que le schéma,
   pas les données d'auth. Il faut recréer les comptes sur `/auth` du
   nouveau projet, puis repromouvoir le premier admin :
   ```sql
   insert into public.user_roles (user_id, role)
   values ('UUID_DE_L_UTILISATEUR', 'admin');
   ```
   (trouve l'UUID dans Dashboard Supabase > Authentication > Users)

2. **Le bucket Storage `archives`** — créé manuellement dans le dashboard
   Lovable à l'époque, jamais via une migration SQL. Dans ton nouveau projet :
   Dashboard > Storage > New bucket > nom `archives`. D'après les migrations,
   la lecture est réservée au staff (`is_staff()`), donc laisse le bucket en
   **privé** — les policies RLS de `supabase/migrations/20260816091322_*.sql`
   gèrent déjà les accès.

3. **Les données existantes** (caravanes, inscriptions déjà créées, médias
   déjà uploadés) — si tu as des données réelles côté Lovable que tu veux
   garder, dis-le moi et on fera un export/import (`pg_dump` /
   `supabase db dump`) en plus des migrations de schéma.

## 2. Variables d'environnement

Copie `.env.example` vers `.env` et remplis avec les valeurs de ton nouveau
projet (Dashboard > Project Settings > API) + tes clés PayTech.

```bash
cp .env.example .env
```

## 3. Diagnostiquer et tester le paiement PayTech en mode test

### Pourquoi ça ne marchait pas avant

Deux bugs cumulés dans l'ancien code :

1. `PAYTECH_ENV` n'était jamais forcé à `"test"` par défaut → si tu oubliais
   de la définir, tes essais étaient en fait envoyés en **mode production**
   à PayTech (avec les clés prod, si elles étaient configurées).
2. En local (`http://localhost:3000`), l'origine de la requête n'est pas en
   `https://`, donc le code retombait sur une **URL de preview Lovable en
   dur**. Résultat : PayTech redirigeait ton navigateur et envoyait l'IPN
   vers cette vieille URL Lovable, jamais vers ta machine — donc la
   validation automatique de l'inscription ne pouvait jamais se déclencher
   pendant un test local.

### Comment tester correctement maintenant

PayTech doit pouvoir **appeler ton serveur depuis Internet** (webhook IPN),
même en mode test. `localhost` seul ne suffit jamais — il te faut une URL
publique.

**Option A — test en local avec un tunnel (recommandé pendant le dev) :**
```bash
npm run dev                     # démarre sur http://localhost:3000
ngrok http 3000                 # ou `cloudflared tunnel --url http://localhost:3000`
```
Copie l'URL `https://xxxx.ngrok-free.app` donnée par ngrok dans
`PAYTECH_PUBLIC_BASE_URL` de ton `.env`, redémarre le serveur dev.

**Option B — test sur un déploiement Vercel preview :**
Mets `PAYTECH_PUBLIC_BASE_URL` à l'URL du déploiement preview dans les
variables d'environnement Vercel de cet environnement.

Dans les deux cas :
1. Vérifie que `PAYTECH_ENV` vaut bien `test` (ou est absent — c'est le
   défaut maintenant) et que `PAYTECH_API_KEY` / `PAYTECH_API_SECRET`
   sont bien les **clés du mode test** de ton dashboard PayTech (Intégration
   API > bascule "Mode test") — pas les clés prod.
2. Lance une inscription + paiement test. PayTech affiche une page de
   paiement simulée en mode test (pas de vrai débit).
3. Après le paiement simulé, tu reviens sur `/caravanes?payment=<id>` : le
   code appelle `reconcilePaytechPayment`, qui interroge directement l'API
   PayTech (`get-status`) — c'est un filet de sécurité qui fonctionne même
   si l'IPN a été manquée. Si le statut est validé, l'inscription passe en
   `valide` et un bus est assigné automatiquement (`assignBusAndValidate`).
4. Vérifie aussi que l'IPN est bien arrivée : Dashboard PayTech > Logs IPN
   (ou regarde les logs serveur — `console.error("PayTech IPN signature
   rejected", …)` s'affiche si la signature ne matche pas, ce qui indique
   presque toujours des clés test/prod mélangées).

## 4. Déployer sur Vercel

```bash
npm run build          # génère .vercel/output localement, pour vérifier
ls .vercel/output       # doit contenir functions/ et static/
```
Puis connecte le repo Git sur vercel.com, ou déploie via CLI (`vercel
deploy`). Le `vercel.json` déjà en place indique à Vercel d'utiliser la
sortie prébuild plutôt que de deviner un framework.

**Variables à définir dans Vercel (Project Settings > Environment
Variables)** — mêmes clés que `.env.example`, y compris
`SUPABASE_SERVICE_ROLE_KEY` (jamais exposée au client, seulement utilisée
côté serveur).

Si tu préfères Netlify : remplace `preset: "vercel"` par `preset: "netlify"`
dans `vite.config.ts` et retire `vercel.json` (Netlify a son propre système
de détection, un `netlify.toml` avec `command = "npm run build"` et
`publish = ".output/public"` suffit généralement — dis-moi si tu veux que je
prépare ce fichier).
