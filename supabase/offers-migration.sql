-- AfriGadgets Offers Migration
-- Run this once in Supabase SQL Editor.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_on_offer boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS original_price numeric(12,2);

-- Keep original_price valid when supplied.
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_original_price_check;
ALTER TABLE public.products
  ADD CONSTRAINT products_original_price_check
  CHECK (original_price IS NULL OR original_price >= 0);

-- Optional index for the Offers page.
CREATE INDEX IF NOT EXISTS products_is_on_offer_idx
  ON public.products (is_on_offer)
  WHERE is_on_offer = true;

-- Existing products remain normal products until you enable an offer in Admin.
