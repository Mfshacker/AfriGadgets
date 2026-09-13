-- AfriGadgets POP storage + order email migration
-- Run once in Supabase SQL Editor.
-- After this, deploy the send-order-confirmation Edge Function.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pop_file_path text DEFAULT '';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS confirmation_email_error text DEFAULT '';

CREATE INDEX IF NOT EXISTS orders_pop_file_path_idx
  ON public.orders(pop_file_path)
  WHERE pop_file_path <> '';

-- Private bucket: customers upload their own POP; admins can read any POP.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-pop',
  'order-pop',
  false,
  10485760,
  ARRAY['application/pdf','image/jpeg','image/png','image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf','image/jpeg','image/png','image/webp']::text[];

DROP POLICY IF EXISTS "order_pop_customer_insert" ON storage.objects;
CREATE POLICY "order_pop_customer_insert"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'order-pop'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "order_pop_customer_or_admin_read" ON storage.objects;
CREATE POLICY "order_pop_customer_or_admin_read"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'order-pop'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin()
  )
);

DROP POLICY IF EXISTS "order_pop_customer_delete" ON storage.objects;
CREATE POLICY "order_pop_customer_delete"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'order-pop'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin()
  )
);

-- Replace the old 5-argument RPC with a 6-argument version that records
-- the private Storage path as well as the original filename.
DROP FUNCTION IF EXISTS public.create_order(text, jsonb, jsonb, jsonb, text);

CREATE OR REPLACE FUNCTION public.create_order(
  p_reference text,
  p_customer jsonb,
  p_delivery jsonb,
  p_items jsonb,
  p_pop_file_name text DEFAULT '',
  p_pop_file_path text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_order_id bigint;
  v_subtotal numeric(12,2) := 0;
  v_delivery_fee numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_first_name text := coalesce(p_customer->>'firstName', '');
  v_last_name text := coalesce(p_customer->>'lastName', '');
  v_email text := coalesce(p_customer->>'email', '');
  v_phone text := coalesce(p_customer->>'phone', '');
  v_installment jsonb := p_customer->'installment';
  v_term integer;
  v_deposit numeric(12,2);
  v_monthly numeric(12,2);
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_item_total numeric(12,2);
  v_settings public.store_settings%rowtype;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to place an order.';
  END IF;

  IF p_reference IS NULL OR trim(p_reference) = '' THEN
    RAISE EXCEPTION 'A payment reference is required.';
  END IF;

  IF p_items IS NULL
     OR jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty.';
  END IF;

  IF p_pop_file_path IS NULL OR trim(p_pop_file_path) = '' THEN
    RAISE EXCEPTION 'Proof of payment is required.';
  END IF;

  -- The uploaded file must belong to the signed-in customer.
  IF split_part(trim(p_pop_file_path), '/', 1) <> v_user_id::text THEN
    RAISE EXCEPTION 'Invalid proof of payment path.';
  END IF;

  SELECT * INTO v_settings
  FROM public.store_settings
  WHERE id = true
  LIMIT 1;

  v_delivery_fee := CASE WHEN found THEN coalesce(v_settings.delivery_fee, 99) ELSE 99 END;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    IF NOT (v_item ? 'product_id') THEN
      RAISE EXCEPTION 'Invalid cart item.';
    END IF;

    v_qty := greatest(coalesce((v_item->>'quantity')::integer, 1), 1);

    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::bigint;

    IF NOT found THEN
      RAISE EXCEPTION 'A product in your cart no longer exists.';
    END IF;

    IF NOT v_product.in_stock OR v_product.stock < v_qty THEN
      RAISE EXCEPTION 'Not enough stock for product: %', v_product.name;
    END IF;

    v_item_total := round(v_product.price * v_qty, 2);
    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  v_total := round(v_subtotal + v_delivery_fee, 2);

  IF v_installment IS NOT NULL AND jsonb_typeof(v_installment) = 'object' THEN
    v_term := (v_installment->>'term')::integer;
    v_deposit := (v_installment->>'deposit')::numeric;
    v_monthly := (v_installment->>'monthly')::numeric;

    IF v_term NOT IN (6, 12, 18, 24) THEN
      RAISE EXCEPTION 'Invalid installment term.';
    END IF;
    IF v_subtotal < 2000 THEN
      RAISE EXCEPTION 'Installments require a minimum product price of R2,000.';
    END IF;
    IF v_deposit <> 2000 THEN
      RAISE EXCEPTION 'Installment deposit must be R2,000.';
    END IF;
    v_monthly := round((v_subtotal - 2000) / v_term, 2);
  ELSE
    v_term := null;
    v_deposit := null;
    v_monthly := null;
  END IF;

  INSERT INTO public.orders (
    reference, user_id,
    customer_first_name, customer_last_name, customer_email, customer_phone,
    customer, delivery, subtotal, delivery_fee, total,
    status, payment_status, pop_file_name, pop_file_path,
    installment_term, installment_deposit, installment_monthly
  )
  VALUES (
    trim(p_reference), v_user_id,
    v_first_name, v_last_name, v_email, v_phone,
    coalesce(p_customer, '{}'::jsonb), coalesce(p_delivery, '{}'::jsonb),
    v_subtotal, v_delivery_fee, v_total,
    'Pending Payment Verification', 'Pending',
    coalesce(p_pop_file_name, ''), coalesce(p_pop_file_path, ''),
    v_term, v_deposit, v_monthly
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := greatest(coalesce((v_item->>'quantity')::integer, 1), 1);
    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::bigint;

    INSERT INTO public.order_items (order_id, product_id, name, price, quantity)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.price, v_qty);
  END LOOP;

  RETURN (
    SELECT to_jsonb(o)
    FROM public.orders o
    WHERE o.id = v_order_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order(text, jsonb, jsonb, jsonb, text, text) TO authenticated;
