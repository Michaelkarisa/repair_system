-- Inferno Repair Database Schema v2
-- Production-ready multi-tenant schema for Supabase/Postgres
-- ============================================
-- RESET DATABASE OBJECTS
-- ============================================

-- Drop triggers first
DROP TRIGGER IF EXISTS trg_shops_updated_at ON shops;
DROP TRIGGER IF EXISTS trg_team_members_updated_at ON team_members;
DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS trg_devices_updated_at ON devices;
DROP TRIGGER IF EXISTS trg_tickets_updated_at ON tickets;
DROP TRIGGER IF EXISTS trg_log_ticket_status_change ON tickets;
DROP TRIGGER IF EXISTS trg_invoices_updated_at ON invoices;
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;

DROP TRIGGER IF EXISTS trg_sync_invoice_amount_paid_after_insert ON payments;
DROP TRIGGER IF EXISTS trg_sync_invoice_amount_paid_after_update ON payments;
DROP TRIGGER IF EXISTS trg_sync_invoice_amount_paid_after_delete ON payments;

DROP TRIGGER IF EXISTS trg_sync_customer_repair_stats_after_insert ON tickets;
DROP TRIGGER IF EXISTS trg_sync_customer_repair_stats_after_update ON tickets;
DROP TRIGGER IF EXISTS trg_sync_customer_repair_stats_after_delete ON tickets;

-- Drop tables (reverse dependency order)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS ticket_status_history CASCADE;
DROP TABLE IF EXISTS ticket_notes CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS shops CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS set_updated_at CASCADE;
DROP FUNCTION IF EXISTS log_ticket_status_change CASCADE;
DROP FUNCTION IF EXISTS sync_invoice_amount_paid CASCADE;
DROP FUNCTION IF EXISTS sync_customer_repair_stats CASCADE;
-- Extensions
-- Inferno Repair Database Schema v2
-- Production-ready multi-tenant schema for Supabase/Postgres

-- Inferno Repair Database Schema v2
-- Production-ready multi-tenant schema for Supabase/Postgres

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS citext;

-- =========================================================
-- HELPERS
-- =========================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- SHOPS
-- =========================================================

CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  support_email CITEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended')),
  country TEXT,
  currency_code TEXT DEFAULT 'KES',
  timezone TEXT DEFAULT 'Africa/Nairobi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_shops_updated_at
BEFORE UPDATE ON shops
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- TEAM MEMBERS
-- =========================================================

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email CITEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'technician'
    CHECK (role IN (
      'owner',
      'admin',
      'manager',
      'technician',
      'partsspecialist',
      'customersupport',
      'frontdesk'
    )),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'inactive')),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, email)
);

CREATE INDEX IF NOT EXISTS idx_team_members_shop_id
  ON team_members(shop_id);

CREATE INDEX IF NOT EXISTS idx_team_members_shop_status
  ON team_members(shop_id, status);

CREATE INDEX IF NOT EXISTS idx_team_members_user_id
  ON team_members(user_id);

CREATE TRIGGER trg_team_members_updated_at
BEFORE UPDATE ON team_members
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- CUSTOMERS
-- =========================================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email CITEXT,
  phone TEXT,
  repair_count INTEGER NOT NULL DEFAULT 0 CHECK (repair_count >= 0),
  last_repair_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shop_id, email),
  UNIQUE(shop_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_customers_shop_id
  ON customers(shop_id);

CREATE INDEX IF NOT EXISTS idx_customers_shop_name
  ON customers(shop_id, name);

CREATE INDEX IF NOT EXISTS idx_customers_email
  ON customers(email);

CREATE TRIGGER trg_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Needed for composite FK from devices/tickets
ALTER TABLE customers
  ADD CONSTRAINT customers_id_shop_unique UNIQUE (id, shop_id);

-- =========================================================
-- DEVICES
-- =========================================================

CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  device_type TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT,
  imei TEXT,
  color TEXT,
  accessories TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_devices_customer_shop
    FOREIGN KEY (customer_id, shop_id)
    REFERENCES customers(id, shop_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_devices_shop_id
  ON devices(shop_id);

CREATE INDEX IF NOT EXISTS idx_devices_customer_id
  ON devices(customer_id);

CREATE INDEX IF NOT EXISTS idx_devices_imei
  ON devices(imei);

CREATE INDEX IF NOT EXISTS idx_devices_serial_number
  ON devices(serial_number);

CREATE TRIGGER trg_devices_updated_at
BEFORE UPDATE ON devices
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE devices
  ADD CONSTRAINT devices_id_shop_unique UNIQUE (id, shop_id);

-- =========================================================
-- TICKETS
-- =========================================================

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  device_id UUID,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,

  code TEXT NOT NULL,

  issue_description TEXT NOT NULL,
  diagnosis TEXT,

  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN (
      'open',
      'diagnosed',
      'in_progress',
      'waiting_parts',
      'awaiting_approval',
      'ready_for_pickup',
      'completed',
      'cancelled'
    )),

  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  cost_estimate NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cost_estimate >= 0),
  cost_final NUMERIC(10,2) CHECK (cost_final >= 0),

  deposit_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),

  warranty_days INTEGER CHECK (warranty_days >= 0),
  warranty_expires_at TIMESTAMPTZ,

  lock_code TEXT,
  intake_condition TEXT,
  internal_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  CONSTRAINT fk_tickets_customer_shop
    FOREIGN KEY (customer_id, shop_id)
    REFERENCES customers(id, shop_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_tickets_device_shop
    FOREIGN KEY (device_id, shop_id)
    REFERENCES devices(id, shop_id)
    ON DELETE SET NULL,

  UNIQUE(shop_id, code)
);

CREATE INDEX IF NOT EXISTS idx_tickets_shop_id
  ON tickets(shop_id);

CREATE INDEX IF NOT EXISTS idx_tickets_customer_id
  ON tickets(customer_id);

CREATE INDEX IF NOT EXISTS idx_tickets_device_id
  ON tickets(device_id);

CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to
  ON tickets(assigned_to);

CREATE INDEX IF NOT EXISTS idx_tickets_status
  ON tickets(status);

CREATE INDEX IF NOT EXISTS idx_tickets_shop_status
  ON tickets(shop_id, status);

CREATE INDEX IF NOT EXISTS idx_tickets_shop_created_at
  ON tickets(shop_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tickets_shop_priority
  ON tickets(shop_id, priority);

CREATE TRIGGER trg_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE tickets
  ADD CONSTRAINT tickets_id_shop_unique UNIQUE (id, shop_id);

-- =========================================================
-- TICKET NOTES
-- =========================================================

CREATE TABLE IF NOT EXISTS ticket_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_notes_ticket_id
  ON ticket_notes(ticket_id);

-- =========================================================
-- TICKET STATUS HISTORY
-- =========================================================

CREATE TABLE IF NOT EXISTS ticket_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  changed_by_team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_ticket_status_history_ticket_id
  ON ticket_status_history(ticket_id);

-- Optional automatic history tracking
CREATE OR REPLACE FUNCTION log_ticket_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO ticket_status_history (
      ticket_id,
      changed_by_team_member_id,
      old_status,
      new_status,
      changed_at
    )
    VALUES (
      NEW.id,
      NULL,
      OLD.status,
      NEW.status,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_ticket_status_change
AFTER UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION log_ticket_status_change();

-- =========================================================
-- INVOICES
-- =========================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled')),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_invoices_ticket_shop
    FOREIGN KEY (ticket_id, shop_id)
    REFERENCES tickets(id, shop_id)
    ON DELETE CASCADE,

  UNIQUE(shop_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_invoices_shop_id
  ON invoices(shop_id);

CREATE INDEX IF NOT EXISTS idx_invoices_ticket_id
  ON invoices(ticket_id);

CREATE INDEX IF NOT EXISTS idx_invoices_status
  ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_invoices_shop_due_date
  ON invoices(shop_id, due_date);

CREATE TRIGGER trg_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- PAYMENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL
    CHECK (payment_method IN ('paystack', 'cash', 'transfer', 'mpesa', 'card')),
  reference TEXT,
  external_reference TEXT,
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id
  ON payments(invoice_id);

CREATE INDEX IF NOT EXISTS idx_payments_shop_id
  ON payments(shop_id);

-- =========================================================
-- SUBSCRIPTIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL UNIQUE REFERENCES shops(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('trialing', 'active', 'paused', 'cancelled', 'past_due')),
  billing_cycle TEXT DEFAULT 'monthly'
    CHECK (billing_cycle IN ('monthly', 'yearly')),
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  paystack_reference TEXT,
  paystack_customer_code TEXT,
  cancelled_at TIMESTAMPTZ,
  downgrade_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_shop_id
  ON subscriptions(shop_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON subscriptions(status);

CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- PAYMENT TOTAL SYNC
-- =========================================================

CREATE OR REPLACE FUNCTION sync_invoice_amount_paid()
RETURNS TRIGGER AS $$
DECLARE
  target_invoice_id UUID;
  paid_sum NUMERIC;
BEGIN
  target_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

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

CREATE TRIGGER trg_sync_invoice_amount_paid_after_insert
AFTER INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION sync_invoice_amount_paid();

CREATE TRIGGER trg_sync_invoice_amount_paid_after_update
AFTER UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION sync_invoice_amount_paid();

CREATE TRIGGER trg_sync_invoice_amount_paid_after_delete
AFTER DELETE ON payments
FOR EACH ROW
EXECUTE FUNCTION sync_invoice_amount_paid();

-- =========================================================
-- OPTIONAL: KEEP CUSTOMER REPAIR STATS UPDATED
-- =========================================================

CREATE OR REPLACE FUNCTION sync_customer_repair_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers c
  SET
    repair_count = (
      SELECT COUNT(*)
      FROM tickets t
      WHERE t.customer_id = c.id
    ),
    last_repair_date = (
      SELECT MAX(t.created_at)
      FROM tickets t
      WHERE t.customer_id = c.id
    ),
    updated_at = NOW()
  WHERE c.id = COALESCE(NEW.customer_id, OLD.customer_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_customer_repair_stats_after_insert
AFTER INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION sync_customer_repair_stats();

CREATE TRIGGER trg_sync_customer_repair_stats_after_update
AFTER UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION sync_customer_repair_stats();

CREATE TRIGGER trg_sync_customer_repair_stats_after_delete
AFTER DELETE ON tickets
FOR EACH ROW
EXECUTE FUNCTION sync_customer_repair_stats();

-- =========================================================
-- RLS
-- =========================================================

ALTER TABLE shops                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices                ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets                ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_notes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_status_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices               ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions          ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- MEMBERSHIP HELPER FUNCTIONS (SECURITY DEFINER)
--
-- These functions run as the DB owner and bypass RLS entirely,
-- breaking the infinite-recursion cycle that occurs when a
-- team_members policy queries team_members to authorise itself.
--
-- All RLS policies on every table call these functions instead
-- of querying team_members directly.
-- =========================================================

-- Returns TRUE if the current auth user is an active member of the given shop.
CREATE OR REPLACE FUNCTION is_shop_member(p_shop_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   team_members
    WHERE  shop_id = p_shop_id
      AND  user_id = auth.uid()
      AND  status  = 'active'
  );
$$;

-- Returns TRUE if the current auth user is an active owner/admin/manager of the given shop.
CREATE OR REPLACE FUNCTION is_shop_manager(p_shop_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   team_members
    WHERE  shop_id = p_shop_id
      AND  user_id = auth.uid()
      AND  status  = 'active'
      AND  role    IN ('owner', 'admin', 'manager')
  );
$$;

-- =========================================================
-- SHOPS policies
-- =========================================================

-- Any active member may view their shop.
CREATE POLICY "shop members can view their shop"
ON shops FOR SELECT
USING ( is_shop_member(id) );

-- Owners / admins / managers may update their shop.
CREATE POLICY "shop owners admins managers can update their shop"
ON shops FOR UPDATE
USING ( is_shop_manager(id) );

-- During registration the new user inserts their shop row before any
-- team_member row exists, so we allow any authenticated user to insert
-- exactly one shop row where they will become the owner.
CREATE POLICY "authenticated users can insert a shop"
ON shops FOR INSERT
WITH CHECK ( auth.uid() IS NOT NULL );

-- =========================================================
-- TEAM MEMBERS policies
--
-- The SELECT policy still uses the helper so it never recurses.
-- The INSERT policy has two permissive branches (OR):
--   1. Owner self-registration: the row being inserted references the
--      caller's own auth.uid() and is being set to role='owner'.
--      This fires during sign-up when no team_member row yet exists.
--   2. Normal management: an existing owner/admin/manager adds staff.
-- =========================================================

CREATE POLICY "active shop members can view team members"
ON team_members FOR SELECT
USING ( is_shop_member(shop_id) );

CREATE POLICY "insert team members"
ON team_members FOR INSERT
WITH CHECK (
  -- Branch 1: owner self-registration (bootstrapping)
  ( user_id = auth.uid() AND role = 'owner' )
  OR
  -- Branch 2: existing manager adding a new member
  is_shop_manager(shop_id)
);

CREATE POLICY "owners admins managers can update team members"
ON team_members FOR UPDATE
USING ( is_shop_manager(shop_id) );

-- =========================================================
-- CUSTOMERS policies
-- =========================================================

CREATE POLICY "active shop members can view customers"
ON customers FOR SELECT
USING ( is_shop_member(shop_id) );

CREATE POLICY "active shop members can insert customers"
ON customers FOR INSERT
WITH CHECK ( is_shop_member(shop_id) );

CREATE POLICY "active shop members can update customers"
ON customers FOR UPDATE
USING ( is_shop_member(shop_id) );

CREATE POLICY "owners admins managers can delete customers"
ON customers FOR DELETE
USING ( is_shop_manager(shop_id) );

-- =========================================================
-- DEVICES policies
-- =========================================================

CREATE POLICY "active shop members can view devices"
ON devices FOR SELECT
USING ( is_shop_member(shop_id) );

CREATE POLICY "active shop members can insert devices"
ON devices FOR INSERT
WITH CHECK ( is_shop_member(shop_id) );

CREATE POLICY "active shop members can update devices"
ON devices FOR UPDATE
USING ( is_shop_member(shop_id) );

CREATE POLICY "owners admins managers can delete devices"
ON devices FOR DELETE
USING ( is_shop_manager(shop_id) );

-- =========================================================
-- TICKETS policies
-- =========================================================

CREATE POLICY "active shop members can view tickets"
ON tickets FOR SELECT
USING ( is_shop_member(shop_id) );

CREATE POLICY "active shop members can insert tickets"
ON tickets FOR INSERT
WITH CHECK ( is_shop_member(shop_id) );

CREATE POLICY "active shop members can update tickets"
ON tickets FOR UPDATE
USING ( is_shop_member(shop_id) );

CREATE POLICY "owners admins managers can delete tickets"
ON tickets FOR DELETE
USING ( is_shop_manager(shop_id) );

-- =========================================================
-- TICKET NOTES policies
-- =========================================================

CREATE POLICY "active shop members can view ticket notes"
ON ticket_notes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE  t.id = ticket_notes.ticket_id
      AND  is_shop_member(t.shop_id)
  )
);

CREATE POLICY "active shop members can insert ticket notes"
ON ticket_notes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE  t.id = ticket_notes.ticket_id
      AND  is_shop_member(t.shop_id)
  )
);

-- =========================================================
-- TICKET STATUS HISTORY policies
-- =========================================================

CREATE POLICY "active shop members can view ticket status history"
ON ticket_status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE  t.id = ticket_status_history.ticket_id
      AND  is_shop_member(t.shop_id)
  )
);

CREATE POLICY "system or active shop members can insert ticket status history"
ON ticket_status_history FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE  t.id = ticket_status_history.ticket_id
      AND  is_shop_member(t.shop_id)
  )
);

-- =========================================================
-- INVOICES policies
-- =========================================================

CREATE POLICY "active shop members can view invoices"
ON invoices FOR SELECT
USING ( is_shop_member(shop_id) );

CREATE POLICY "active shop members can insert invoices"
ON invoices FOR INSERT
WITH CHECK ( is_shop_member(shop_id) );

CREATE POLICY "active shop members can update invoices"
ON invoices FOR UPDATE
USING ( is_shop_member(shop_id) );

CREATE POLICY "owners admins managers can delete invoices"
ON invoices FOR DELETE
USING ( is_shop_manager(shop_id) );

-- =========================================================
-- PAYMENTS policies
-- =========================================================

CREATE POLICY "active shop members can view payments"
ON payments FOR SELECT
USING ( is_shop_member(shop_id) );

CREATE POLICY "active shop members can insert payments"
ON payments FOR INSERT
WITH CHECK ( is_shop_member(shop_id) );

CREATE POLICY "owners admins managers can update payments"
ON payments FOR UPDATE
USING ( is_shop_manager(shop_id) );

-- =========================================================
-- SUBSCRIPTIONS policies
-- =========================================================

CREATE POLICY "owners admins managers can view subscriptions"
ON subscriptions FOR SELECT
USING ( is_shop_manager(shop_id) );

CREATE POLICY "owners admins managers can manage subscriptions"
ON subscriptions FOR ALL
USING      ( is_shop_manager(shop_id) )
WITH CHECK ( is_shop_manager(shop_id) );

-- =========================================================
-- REGISTRATION BOOTSTRAP FUNCTION
--
-- Called via supabase.rpc('register_shop', {...}) immediately
-- after auth.signUp(). Runs as SECURITY DEFINER (DB owner) so
-- it bypasses RLS — needed because the new user's session may
-- not be fully active yet (e.g. email confirmation pending).
--
-- Inserts one shop row + one owner team_member row atomically.
-- Returns the new shop_id on success, raises an exception on failure.
-- =========================================================

CREATE OR REPLACE FUNCTION register_shop(
  p_user_id      UUID,
  p_shop_name    TEXT,
  p_owner_name   TEXT,
  p_email        TEXT,
  p_currency     TEXT DEFAULT 'KES',
  p_timezone     TEXT DEFAULT 'Africa/Nairobi'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shop_id UUID;
BEGIN
  -- Validate the caller is who they claim to be
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'user_id mismatch: caller is not the authenticated user';
  END IF;

  -- Insert the shop
  INSERT INTO shops (name, owner_name, email, currency_code, timezone)
  VALUES (p_shop_name, p_owner_name, p_email, p_currency, p_timezone)
  RETURNING id INTO v_shop_id;

  -- Insert the owner team_member, linked to the auth user
  INSERT INTO team_members (shop_id, user_id, name, email, role, status, accepted_at)
  VALUES (v_shop_id, p_user_id, p_owner_name, p_email, 'owner', 'active', NOW());

  RETURN v_shop_id;
END;
$$;

-- Revoke public execute so only authenticated users can call it
REVOKE EXECUTE ON FUNCTION register_shop FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION register_shop TO authenticated;