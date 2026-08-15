#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# repro spike P0-B — B2 : thin launcher for the INDEPENDENT verifier.
#
#   ./verify/verify.sh --phase post-destroy-1 [--run-id <id>]
#
# This wrapper only turns shell variables into CLI ARGUMENTS. It carries no
# verification logic. verify.js imports nothing from destroy.sh or
# lib/common.sh, and re-derives its label scope from the arguments it is given
# — parameters are data, not a shared code path.
# ---------------------------------------------------------------------------
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/lib/common.sh"

PHASE="unspecified"
RUN_ID=""
# Fail-closed default, same as verify.js's own default. `establish` is passed by
# cycle.sh for the pre-destroy phase, where the environment is still alive and
# the label scope is supposed to select it.
SCOPE_PROOF="require"
while [ $# -gt 0 ]; do
  case "$1" in
    --phase)       PHASE="${2:-}"; shift ;;
    --run-id)      RUN_ID="${2:-}"; shift ;;
    --scope-proof) SCOPE_PROOF="${2:-}"; shift ;;
    *) die "unknown arg: $1" ;;
  esac
  shift
done

if [ -z "${RUN_ID}" ]; then
  load_run_env
  RUN_ID="${SPIKE_RUN_ID:?}"
fi

SOCK="$(docker_socket_path)"
[ -S "${SOCK}" ] || die "docker socket not found at '${SOCK}'"

FOREIGN_CSV="$(echo "${FOREIGN_CONTAINERS}" | tr ' ' ',')"
PORTS_CSV="${HOST_APP_PORT},${HOST_STUB_PORT},${HOST_PG_PORT},${HOST_REDIS_PORT}"

exec node "${INFRA_DIR}/verify/verify.js" \
  --run-id "${RUN_ID}" \
  --phase "${PHASE}" \
  --socket "${SOCK}" \
  --network "${SPIKE_NETWORK}" \
  --label-key "${LABEL_ENV_KEY}" \
  --ports "${PORTS_CSV}" \
  --foreign "${FOREIGN_CSV}" \
  --scope-proof "${SCOPE_PROOF}" \
  --out-dir "${EVIDENCE_DIR}"
