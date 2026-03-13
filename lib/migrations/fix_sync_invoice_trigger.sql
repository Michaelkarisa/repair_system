-- Migration: Fix sync_invoice_amount_paid trigger to compute SUM once
-- Apply this in Supabase SQL editor

CREATE OR REPLACE FUNCTION sync_invoice_amount_paid()
RETURNS TRIGGER AS $$
DECLARE
  target_invoice_id UUID;
  paid_sum NUMERIC;
BEGIN
  target_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

  -- Compute once, reuse in the UPDATE below
  SELECT COALESCE(SUM(p.amount), 0)
  INTO paid_sum
  FROM payments p
  WHERE p.invoice_id = target_invoice_id
    AND p.status = 'completed';

  UPDATE invoices i
  SET
    amount_paid = paid_sum,
    status = CASE
      WHEN paid_sum <= 0 THEN
        CASE WHEN i.status = 'cancelled' THEN 'cancelled' ELSE 'sent' END
      WHEN paid_sum < i.amount THEN 'partially_paid'
      ELSE 'paid'
    END,
    paid_at = CASE
      WHEN paid_sum >= i.amount THEN NOW()
      ELSE i.paid_at
    END,
    updated_at = NOW()
  WHERE i.id = target_invoice_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
