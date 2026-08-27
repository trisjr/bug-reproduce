#!/bin/sh
# ---------------------------------------------------------------------------
# repro spike P0-B — B2 : CONTROL PROBE for canary_coverage clause (i).
#
# run-plan §1.1 / security E1:
#   "Một `curl <host-cũ>` ĐỐI CHỨNG, chạy từ trong container replay, NGOÀI mọi
#    test, PHẢI xuất hiện trong canary log."
#
# WHY A CONTROL PROBE AT ALL:
#   escaped_side_effects = 0 has two possible causes — nothing escaped, or the
#   canary was not actually holding the address and saw nothing. Those two
#   readings are indistinguishable from the metric alone. This probe is the
#   positive control that separates them: a KNOWN request to the old address
#   that MUST appear in the canary log. If it does not appear, the canary is
#   not covering that address, and the run's zero is uninterpretable.
#
# This probe is deliberately OUTSIDE the 12-test matrix. It is not a test; it
# is the calibration that makes the tests readable.
#
# Every emitted request carries the marker header/param below so the coverage
# evaluator can find it without ambiguity and so it is never mistaken for an
# actual escaped side effect.
# ---------------------------------------------------------------------------
set -eu

RUN_ID="${SPIKE_RUN_ID:-unknown-run}"
MARKER="${CANARY_CONTROL_MARKER:-repro-canary-control-${RUN_ID}}"

echo "control-probe run_id=${RUN_ID} marker=${MARKER}"

# --- HTTP addresses (CT-3 DNS names that no longer exist as services) -------
for target in \
  "http://spike-httpstub:${SPIKE_STUB_PORT:-8081}/__canary_control__" \
  "http://spike-app:${SPIKE_APP_PORT:-8080}/__canary_control__"
do
  echo "-- curl ${target}"
  curl -sS -m 5 \
    -H "X-Repro-Canary-Control: ${MARKER}" \
    -H "X-Repro-Run-Id: ${RUN_ID}" \
    "${target}?repro_canary_control=${MARKER}" \
    || echo "   (curl failed for ${target} — clause (i) will read as NOT satisfied)"
  echo
done

# --- DB address (spike-postgres) --------------------------------------------
# NOT a raw TCP connect. A raw connect proves only that something accepts on
# that address; it produces no statement line, so canary-db's own log can never
# attest to anything and clause (iv) can never see the DB sink at all (that was
# WARNING-1: `missing_aliases: ["spike-postgres"]` on every run, forever).
#
# A REAL psql handshake with the destroyed environment's credentials produces,
# in canary-db's OWN statement log:
#
#   ... app=<marker> client=10.83.0.x LOG:  statement: SELECT 'repro-canary-db-control alias=spike-postgres marker=<marker>' ...
#
# which simultaneously proves four things the coverage evaluator would otherwise
# have to assume: the alias resolved; it resolved to a real Postgres; that
# Postgres accepts the OLD credentials (so a leaked write would not be silently
# rejected before logging); and log_statement=all is actually on. The statement
# text names the alias it dialed, so the evaluator reads the covered alias out
# of the DB's log rather than out of a hardcoded list.
#
# The marker rides in `application_name` AND in the statement text, so the same
# line is also unambiguously excludable from escaped_side_effects.
DB_ALIAS="spike-postgres"
DB_CONTROL_STATEMENT="SELECT 'repro-canary-db-control alias=${DB_ALIAS} marker=${MARKER}' AS canary_db_control"
echo "-- psql ${DB_ALIAS}:${SPIKE_PG_PORT:-5432} app=${MARKER}"
if PGAPPNAME="${MARKER}" PGPASSWORD="${SPIKE_PG_PASSWORD:-}" \
   psql -h "${DB_ALIAS}" -p "${SPIKE_PG_PORT:-5432}" \
        -U "${SPIKE_PG_USER:-spike}" -d "${SPIKE_PG_DATABASE:-spikedb}" \
        -v ON_ERROR_STOP=1 -At -c "${DB_CONTROL_STATEMENT}"
then
  echo "   db control OK"
else
  echo "   (psql failed for ${DB_ALIAS} — clause (i)/(iv) DB half will read as NOT satisfied)"
fi

# --- raw TCP address (redis old name) ---------------------------------------
# curl cannot speak RESP; a raw connect that writes the marker is enough,
# because the canary logs the ACCEPT and the bytes.
node -e '
var net = require("node:net");
var marker = process.argv[1];
var targets = [
  ["spike-redis", Number(process.env.SPIKE_REDIS_PORT || 6379)],
  ["127.0.0.1", Number(process.env.HOST_REDIS_PORT || 16379)]
];
var pending = targets.length;
targets.forEach(function (t) {
  var s = net.connect({ host: t[0], port: t[1] });
  s.setTimeout(5000);
  s.on("connect", function () {
    console.log("-- tcp connected " + t[0] + ":" + t[1]);
    s.write("PING " + marker + "\r\n");
    setTimeout(function () { s.end(); }, 300);
  });
  s.on("error", function (e) {
    console.log("-- tcp FAILED " + t[0] + ":" + t[1] + " -> " + e.message);
  });
  s.on("close", function () { if (--pending === 0) process.exit(0); });
  s.on("timeout", function () { s.destroy(); });
});
setTimeout(function () { process.exit(0); }, 8000);
' "${MARKER}"

echo "control-probe done"
