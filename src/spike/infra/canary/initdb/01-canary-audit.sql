-- ---------------------------------------------------------------------------
-- repro spike P0-B — B2 : CANARY SINK (database half)
--
-- MTP-Spike-Phase-0 §5.2 requires a "DB giả có bảng audit append-only —
-- mọi câu lệnh nhận được, ghi thêm-only để không thể bị xoá dấu vết".
--
-- Implementation choice (cheap on purpose, per the B2 estimate): vanilla
-- Postgres with log_statement=all + log_connections=on, plus a REAL audit table
-- that is INSERT-only. We do NOT write a PostgreSQL wire-protocol responder.
--
-- Two independent capture paths, deliberately:
--   1. log_statement=all — captures EVERY statement the leaking client sends,
--      even statements that error out, even DDL, even ones that never reach a
--      table. Harvested from `docker logs` by canary-down.sh.
--   2. canary_audit      — an append-only table any leaked INSERT lands in, and
--      the event trigger below stamps a row for DDL as well.
--
-- CREDENTIALS: canary-db is started with the SAME SPIKE_PG_USER / PASSWORD /
-- DATABASE as the destroyed environment. This is required, not incidental: a
-- leaked write that fails authentication never reaches statement logging, so a
-- canary with different credentials would silently under-count.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS canary_audit (
  id            bigserial PRIMARY KEY,
  observed_at   timestamptz NOT NULL DEFAULT now(),
  db_user       text        NOT NULL DEFAULT current_user,
  client_addr   inet,
  client_port   int,
  application   text,
  event_kind    text        NOT NULL,
  statement     text,
  payload       jsonb
);

COMMENT ON TABLE canary_audit IS
  'repro spike canary DB sink. Append-only. Any row here is a side effect that '
  'escaped the replay sandbox and reached the old spike-postgres address.';

-- Append-only enforcement. Two layers, because either one alone is bypassable
-- by the owner role.
REVOKE UPDATE, DELETE, TRUNCATE ON canary_audit FROM PUBLIC;

CREATE OR REPLACE FUNCTION canary_audit_append_only() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'canary_audit is append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS canary_audit_no_mutate ON canary_audit;
CREATE TRIGGER canary_audit_no_mutate
  BEFORE UPDATE OR DELETE OR TRUNCATE ON canary_audit
  FOR EACH STATEMENT EXECUTE FUNCTION canary_audit_append_only();

-- A landing table with a permissive shape, so a leaked INSERT from the replay
-- workload actually succeeds and is therefore RECORDED rather than rejected.
-- A rejected write still shows up in log_statement, but a successful one gives
-- us the payload too.
CREATE TABLE IF NOT EXISTS orders (
  id          bigserial PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  data        jsonb
);
CREATE TABLE IF NOT EXISTS payments (
  id          bigserial PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  data        jsonb
);

CREATE OR REPLACE FUNCTION canary_capture() RETURNS trigger AS $$
BEGIN
  INSERT INTO canary_audit (client_addr, client_port, application, event_kind, statement, payload)
  VALUES (
    inet_client_addr(),
    inet_client_port(),
    current_setting('application_name', true),
    'dml:' || TG_OP || ':' || TG_TABLE_NAME,
    current_query(),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS canary_capture_orders ON orders;
CREATE TRIGGER canary_capture_orders
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION canary_capture();

DROP TRIGGER IF EXISTS canary_capture_payments ON payments;
CREATE TRIGGER canary_capture_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION canary_capture();

-- DDL is a side effect too (CREATE/DROP from a leaked migration path).
CREATE OR REPLACE FUNCTION canary_capture_ddl() RETURNS event_trigger AS $$
BEGIN
  INSERT INTO canary_audit (client_addr, client_port, application, event_kind, statement)
  VALUES (inet_client_addr(), inet_client_port(),
          current_setting('application_name', true),
          'ddl:' || tg_tag, current_query());
END;
$$ LANGUAGE plpgsql;

DROP EVENT TRIGGER IF EXISTS canary_ddl_watch;
CREATE EVENT TRIGGER canary_ddl_watch ON ddl_command_end
  EXECUTE FUNCTION canary_capture_ddl();

-- Marker row so a harvest that finds an EMPTY table can be distinguished from
-- a harvest that failed to connect. Absence of evidence must not read as
-- evidence of absence — Spec-Spike-Protocol §4.6.
INSERT INTO canary_audit (event_kind, statement)
VALUES ('canary:initialised', 'canary DB sink ready; rows after this one are escaped side effects');
