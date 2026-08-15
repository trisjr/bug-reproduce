#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# repro spike P0-B — B2 : bring up the canary sink AFTER destroy.
#
#   ./canary-up.sh [--run-id <id>] [--control-probe]
#
# --control-probe also runs the clause (i) control curl from a container on the
# spike network, i.e. from where the replay container will later sit.
#
# ORDER MATTERS: destroy.sh must have run first. The canary can only claim the
# aliases spike-app / spike-httpstub / spike-redis / spike-postgres once the
# original containers no longer hold those names on the network.
# ---------------------------------------------------------------------------
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

RUN_ID=""
DO_PROBE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --run-id)        RUN_ID="${2:-}"; shift ;;
    --control-probe) DO_PROBE=1 ;;
    *) die "unknown arg: $1" ;;
  esac
  shift
done

load_run_env
[ -n "${RUN_ID}" ] && SPIKE_RUN_ID="${RUN_ID}"
export SPIKE_RUN_ID

mkdir -p "${CANARY_LOG_DIR}"

docker network inspect "${SPIKE_NETWORK}" >/dev/null 2>&1 \
  || die "long-lived network ${SPIKE_NETWORK} is missing. The canary cannot claim \
the CT-3 DNS names without it. Something removed it — see destroy.sh header."

# --- fail-closed on address contention -------------------------------------
# If any host port the canary must re-claim is held by someone else, we do NOT
# stop the holder and we do NOT continue. Continuing would produce a run whose
# escaped_side_effects is unreadable: leaks to that address would land in the
# OTHER service, not in the canary.
#
# On this host the known holders are the foreign project: tnm_redis 6379,
# tnm_postgres 5433, tnm_minio 9000-9001, tnm_video_preprocessor 8100. Our host
# ports are chosen to avoid them, but this check is what makes that a guarantee
# instead of an assumption.
CONTENDED=""
for p in "${HOST_APP_PORT}" "${HOST_STUB_PORT}" "${HOST_PG_PORT}" "${HOST_REDIS_PORT}"; do
  if lsof -nP -iTCP:"${p}" -sTCP:LISTEN >/dev/null 2>&1; then
    CONTENDED="${CONTENDED} ${p}"
  fi
done
if [ -n "${CONTENDED}" ]; then
  lsof -nP -iTCP -sTCP:LISTEN >&2 || true
  die "FAIL-CLOSED: host port(s)${CONTENDED} are already held. \
canary_coverage would be 'incomplete' and escaped_side_effects unreadable \
(Spec-Spike-Protocol §4.6). Not stopping any holder — foreign assets are off limits."
fi

log "starting canary sink for run ${SPIKE_RUN_ID}"
docker compose \
  --env-file "${RUN_ENV_FILE}" \
  -f "${INFRA_DIR}/docker-compose.canary.yml" \
  -p "${COMPOSE_PROJECT_CANARY}" \
  up -d --build --wait

log "canary up. aliases claimed:"
docker ps --filter "label=${LABEL_CANARY_KEY}=${SPIKE_RUN_ID}" \
  --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' >&2

if [ "${DO_PROBE}" -eq 1 ]; then
  log "running canary_coverage clause (i) control probe from inside the spike network"
  docker run --rm \
    --network "${SPIKE_NETWORK}" \
    --label "${LABEL_CANARY_KEY}=${SPIKE_RUN_ID}" \
    --label "${LABEL_ROLE_KEY}=control-probe" \
    -e SPIKE_RUN_ID="${SPIKE_RUN_ID}" \
    -e SPIKE_APP_PORT="${SPIKE_APP_PORT}" \
    -e SPIKE_STUB_PORT="${SPIKE_STUB_PORT}" \
    -e SPIKE_REDIS_PORT=6379 \
    -e SPIKE_PG_PORT=5432 \
    -e SPIKE_PG_USER="${SPIKE_PG_USER}" \
    -e SPIKE_PG_PASSWORD="${SPIKE_PG_PASSWORD}" \
    -e SPIKE_PG_DATABASE="${SPIKE_PG_DATABASE}" \
    --entrypoint /opt/canary/probe-control.sh \
    "repro-spike-canary:${SPIKE_RUN_ID}" || \
    log "control probe exited non-zero — clause (i) will read NOT satisfied"
fi
