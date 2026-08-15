#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# repro spike P0-B — B2 : harvest the canary DB sink, then tear the canary down.
#
#   ./canary-down.sh [--run-id <id>] [--keep]
#
# The canary is torn down HERE and never by destroy.sh — different label
# namespace on purpose (see docker-compose.canary.yml header).
#
# Harvest order matters: the Postgres statement log lives in the container's
# stderr, so it must be captured BEFORE the container is removed.
# ---------------------------------------------------------------------------
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

RUN_ID=""
KEEP=0
while [ $# -gt 0 ]; do
  case "$1" in
    --run-id) RUN_ID="${2:-}"; shift ;;
    --keep)   KEEP=1 ;;
    *) die "unknown arg: $1" ;;
  esac
  shift
done

load_run_env
[ -n "${RUN_ID}" ] && SPIKE_RUN_ID="${RUN_ID}"
export SPIKE_RUN_ID
mkdir -p "${CANARY_LOG_DIR}"

DB_CT="canary-db-${SPIKE_RUN_ID}"

# --- 1. statement log (log_statement=all) ----------------------------------
if docker ps -a --format '{{.Names}}' | grep -qx "${DB_CT}"; then
  log "harvesting Postgres statement log from ${DB_CT}"
  docker logs "${DB_CT}" > "${CANARY_LOG_DIR}/canary-db-statements-${SPIKE_RUN_ID}.log" 2>&1 || true
else
  log "no ${DB_CT} container — nothing to harvest from the DB sink"
fi

# --- 2. append-only audit table -------------------------------------------
if docker ps --format '{{.Names}}' | grep -qx "${DB_CT}"; then
  log "harvesting canary_audit rows"
  docker exec -e PGPASSWORD="${SPIKE_PG_PASSWORD}" "${DB_CT}" \
    psql -U "${SPIKE_PG_USER}" -d "${SPIKE_PG_DATABASE}" -A -t \
    -c "SELECT coalesce(json_agg(row_to_json(a))::text,'[]') FROM canary_audit a" \
    > "${CANARY_LOG_DIR}/canary-db-audit-${SPIKE_RUN_ID}.json" 2>/dev/null \
    || echo '[]' > "${CANARY_LOG_DIR}/canary-db-audit-${SPIKE_RUN_ID}.json"
else
  log "DB sink not running; writing empty audit harvest MARKED as unharvested"
  printf '%s\n' '{"harvested":false,"reason":"canary-db not running at harvest time"}' \
    > "${CANARY_LOG_DIR}/canary-db-audit-${SPIKE_RUN_ID}.json"
fi

if [ "${KEEP}" -eq 1 ]; then
  log "--keep given: canary left running"
  exit 0
fi

log "tearing down canary stack (label ${LABEL_CANARY_KEY}=${SPIKE_RUN_ID})"
docker compose \
  --env-file "${RUN_ENV_FILE}" \
  -f "${INFRA_DIR}/docker-compose.canary.yml" \
  -p "${COMPOSE_PROJECT_CANARY}" \
  down -v --remove-orphans || true

# --- 3. the per-run canary IMAGE -------------------------------------------
# `compose down` never removes images. The canary image is built per run and
# tagged repro-spike-canary:<run_id>; destroy.sh must NOT match it (different
# label namespace, by design), so before build.labels was added it belonged to
# no scope at all and one image accumulated per run. Selection is BY LABEL, the
# same discipline destroy.sh uses — never by wildcard, never by prune.
CANARY_IMAGES="$(docker image ls -q --filter "label=${LABEL_CANARY_KEY}=${SPIKE_RUN_ID}" || true)"
if [ -z "${CANARY_IMAGES}" ]; then
  log "canary images  : none in scope (label ${LABEL_CANARY_KEY}=${SPIKE_RUN_ID})"
else
  CANARY_IMAGE_TAGS="$(docker inspect --format '{{range .RepoTags}}{{.}} {{end}}' ${CANARY_IMAGES} 2>/dev/null || true)"
  # shellcheck disable=SC2086
  assert_no_foreign_match ${CANARY_IMAGE_TAGS}
  log "canary images  : removing -> ${CANARY_IMAGE_TAGS}"
  # shellcheck disable=SC2086
  docker image rm -f ${CANARY_IMAGES} >/dev/null || true
fi

# The external network must still be here afterwards.
docker network inspect "${SPIKE_NETWORK}" >/dev/null 2>&1 \
  || die "REGRESSION: canary teardown removed the long-lived network ${SPIKE_NETWORK}"
log "canary down. long-lived network ${SPIKE_NETWORK} intact."
