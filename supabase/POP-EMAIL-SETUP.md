# AfriGadgets POP + Order Email Setup

## 1. Run the database/storage migration

Open Supabase SQL Editor and run:

`supabase/pop-and-email-migration.sql`

This creates the private `order-pop` Storage bucket, Storage policies, adds the POP path and email-status columns, and updates `create_order()` to save the POP path.

## 2. Deploy the email Edge Function

From the project root:

```bash
supabase functions deploy send-order-confirmation
```

The function is located at:

`supabase/functions/send-order-confirmation/index.ts`

## 3. Add email provider secrets

This implementation uses Resend. Create/verify the sender domain in Resend, then set:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
supabase secrets set FROM_EMAIL=orders@your-verified-domain.co.za
supabase secrets set FROM_NAME=AfriGadgets
```

Do **not** put the Resend API key or Supabase service-role key in the website JavaScript.

## 4. What customers get

After a successful order:

- POP is uploaded to the private Supabase Storage bucket.
- The order stores the POP path.
- The customer receives an email containing the order reference, products, quantities, prices, subtotal, delivery, total, delivery address and installment details when applicable.
- If email delivery temporarily fails, the order is still saved and the checkout page tells the customer that the order was received but the email could not be sent.

## 5. What Admin gets

In Admin → Orders:

- The invoice/file icon opens the customer's POP using a short-lived signed URL.
- The envelope icon resends the order confirmation email.

The POP bucket remains private; there is no public POP URL.

## Inbox placement note

The checkout email function sends both HTML and plain-text versions and sets `reply_to` to the verified AfriGadgets sender. These are deliverability improvements, but no application can force Outlook, Gmail, or another recipient provider to place a message in the Inbox. The recipient mailbox provider makes the final spam decision.

For best inbox placement, keep the Resend sending domain fully authenticated with SPF/DKIM and publish a sensible DMARC record. Keep the sending domain consistent with the links and branding in the email, and monitor bounce/complaint activity in Resend.
