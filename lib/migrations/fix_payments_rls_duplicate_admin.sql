-- Migration: Fix duplicate 'admin' role in payments UPDATE policy
-- Apply this in Supabase SQL editor

DROP POLICY IF EXISTS "owners admins managers can update payments" ON payments;

CREATE POLICY "owners admins managers can update payments"
ON payments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm.shop_id = payments.shop_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.role IN ('owner', 'admin', 'manager')
  )
);
