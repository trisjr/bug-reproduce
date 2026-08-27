#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# repro spike P0-B — B2 shared constants
# THROWAWAY CODE (Spec-Spike-Protocol §0.3). Not a V0.1 artifact.
#
# Sourced by: up.sh, destroy.sh, canary-up.sh, canary-down.sh
# NOT sourced by: verify/verify.js, coverage/coverage.js  <-- deliberate.
#   The verifier must not share a code path with destroy. It re-derives the
#   label scope from its own CLI arguments. Parameters are data, not shared code.
# ---------------------------------------------------------------------------
set -euo pipefail

INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "${INFRA_DIR}/../../.." && pwd)"

# --- label namespace -------------------------------------------------------
# THREE disjoint namespaces. Conflating them breaks the phase:
#   env        -> destroy's ONLY target filter
#   persistent -> the long-lived external network; destroy NEVER matches it
#   canary     -> the post-destroy observer; destroy NEVER matches it
LABEL_ENV_KEY="repro.spike.env"
LABEL_NONCE_KEY="repro.spike.nonce"
LABEL_ROLE_KEY="repro.spike.role"
LABEL_PERSISTENT_KEY="repro.spike.persistent"
LABEL_CANARY_KEY="repro.spike.canary"

# --- topology --------------------------------------------------------------
SPIKE_NETWORK="${SPIKE_NETWORK:-repro-spike-net}"
SPIKE_NETWORK_SUBNET="${SPIKE_NETWORK_SUBNET:-10.83.0.0/24}"
SPIKE_INTERNAL_NETWORK="${SPIKE_INTERNAL_NETWORK:-repro-spike-internal-net}"
SPIKE_INTERNAL_SUBNET="${SPIKE_INTERNAL_SUBNET:-10.83.1.0/24}"
COMPOSE_PROJECT_ENV="${COMPOSE_PROJECT_ENV:-repro-spike-env}"
COMPOSE_PROJECT_CANARY="${COMPOSE_PROJECT_CANARY:-repro-spike-canary}"
# --- container-side ports (CT-3 DNS names resolve to these) ----------------
SPIKE_APP_PORT="${SPIKE_APP_PORT:-8080}"
SPIKE_STUB_PORT="${SPIKE_STUB_PORT:-8081}"
SPIKE_PG_PORT="${SPIKE_PG_PORT:-5432}"
SPIKE_REDIS_PORT="${SPIKE_REDIS_PORT:-6379}"

# --- host-side published ports (bind 127.0.0.1 only) -----------------------
# Chosen to avoid ports held by the FOREIGN project on this daemon:
#   tnm_postgres 5433 · tnm_redis 6379 · tnm_minio 9000-9001 · tnm_video_preprocessor 8100
# and to avoid host listeners observed via lsof (3000, 4322, 5000, 7000, 30000, 30001, 63342...).
HOST_APP_PORT="${HOST_APP_PORT:-18080}"
HOST_STUB_PORT="${HOST_STUB_PORT:-18081}"
HOST_PG_PORT="${HOST_PG_PORT:-15432}"
HOST_REDIS_PORT="${HOST_REDIS_PORT:-16379}"
HOST_BIND_ADDR="${HOST_BIND_ADDR:-127.0.0.1}"

# --- foreign assets that MUST survive every operation ----------------------
# destroy.sh must never match these; verify.js asserts they are still running.
FOREIGN_CONTAINERS="tnm_postgres tnm_redis tnm_minio tnm_video_preprocessor"
FOREIGN_PREFIX="tnm_"

# --- runtime state (gitignored via src/spike/**/artifacts/) ----------------
ARTIFACT_DIR="${INFRA_DIR}/artifacts"
RUN_ENV_FILE="${ARTIFACT_DIR}/run.env"
CANARY_LOG_DIR="${INFRA_DIR}/canary-log"       # gitignored: raw runtime data
EVIDENCE_DIR="${REPO_ROOT}/docs/035-QA/Evidence"  # NOT gitignored: sealed evidence

# --- docker socket for the ACTIVE context ----------------------------------
docker_socket_path() {
  docker context inspect --format '{{.Endpoints.docker.Host}}' 2>/dev/null \
    | sed -e 's#^unix://##'
}

log()  { printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >&2; }
die()  { printf '[%s] FATAL %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Guard: refuse to operate if the invocation could touch foreign assets.
# ---------------------------------------------------------------------------
assert_no_foreign_match() {
  # $@ = list of resource names about to be acted upon
  local n
  for n in "$@"; do
    case "$n" in
      ${FOREIGN_PREFIX}*)
        die "REFUSING: '${n}' carries the foreign-project prefix '${FOREIGN_PREFIX}'. \
Label scope leaked. No action taken."
        ;;
    esac
  done
}

load_run_env() {
  [ -f "${RUN_ENV_FILE}" ] || die "no run env at ${RUN_ENV_FILE} — run up.sh first"
  # shellcheck disable=SC1090
  set -a; . "${RUN_ENV_FILE}"; set +a
}
