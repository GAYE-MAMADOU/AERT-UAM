
ALTER TABLE public.inscriptions
  ADD COLUMN IF NOT EXISTS payment_token TEXT,
  ADD COLUMN IF NOT EXISTS payment_url TEXT;

CREATE INDEX IF NOT EXISTS inscriptions_payment_token_idx ON public.inscriptions(payment_token);
