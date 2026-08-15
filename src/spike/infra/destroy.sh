#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# repro spike P0-B — B2 : destroy the spike environment, BY LABEL, idempotently.
#
#   ./destroy.sh [--run-id <id>]
#
# Written for bash 3.2 (the only bash on this host) — no mapfile, no assoc arrays.
#
# =====================  READ THIS BEFORE EDITING  ==========================
#
# 1. `docker system prune` IS FORBIDDEN HERE IN EVERY FORM.
#    Not as a style rule. This daemon hosts a DIFFERENT project's assets:
#    tnm_postgres, tnm_redis, tnm_minio, tnm_video_preprocessor (up 7+ days,
#    10 volumes, 2 networks). One prune that sweeps tnm_postgres is
#    unrecoverable damage to data outside this spike's blast radius.
#    `docker system prune`, `docker volume prune`, `docker network prune`,
#    `docker image prune`, `docker rm $(docker ps -aq)` — all forbidden.
#
# 2. "The original environment" IS DEFINED BY LABEL, never by "everything on
#    the daemon". A loose scope has exactly two outcomes, both broken:
#      - the verifier reports tnm_* as residue (false positive every run), or
#      - destroy sweeps another project's assets.
#    The ONLY selector below is:  repro.spike.env=<run_id>
#
# 3. THREE THINGS THIS SCRIPT MUST NEVER TOUCH:
#      a. the long-lived external network (label repro.spike.persistent=true).
#         Deleting it deletes the DNS names spike-postgres / spike-redis /
#         spike-httpstub / spike-app — the very addresses the canary must
#         re-claim. That would collapse the evidence mechanism of the phase.
#      b. the canary (label repro.spike.canary=<run_id>). Destroy runs twice to
#         prove idempotency; killing the canary in between would destroy the
#         observer that the second evidence file depends on.
#      c. anything named tnm_* (foreign project).
#
# 4. IDEMPOTENT means: converge to absence. Run N>=1 times, the post-state is
#    identical. Proof procedure is in docs/070-Deployment/Deploy-Spike.md:
#    run twice, diff the `assertions` block of the two evidence JSON files.
#
# 5. This script produces NO evidence. Evidence is produced by verify/verify.js,
#    a separate package that imports nothing from here. A second call into the
#    same code path is not an independent verifier.
# ---------------------------------------------------------------------------
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

RUN_ID=""
while [ $# -gt 0 ]; do
  case "$1" in
    --run-id) RUN_ID="${2:-}"; shift ;;
    *) die "unknown arg: $1" ;;
  esac
  shift
done

if [ -z "${RUN_ID}" ]; then
  load_run_env
  RUN_ID="${SPIKE_RUN_ID:-}"
fi

SCOPE="${LABEL_ENV_KEY}=${RUN_ID}"

# --- Guard 0: the scope must be concrete -----------------------------------
case "${RUN_ID}" in
  ""|"*"|"all") die "refusing to run with run_id='${RUN_ID}' — scope must be concrete" ;;
esac
log "destroy scope = ${SCOPE}   (and NOTHING else)"

# --- Guard 1: no selected name may carry the foreign prefix ----------------
SELECTED_CONTAINER_IDS="$(docker ps -aq --filter "label=${SCOPE}" || true)"
SELECTED_CONTAINER_NAMES=""
if [ -n "${SELECTED_CONTAINER_IDS}" ]; then
  SELECTED_CONTAINER_NAMES="$(docker inspect --format '{{.Name}}' ${SELECTED_CONTAINER_IDS} \
    | sed 's#^/##' | tr '\n' ' ')"
  # shellcheck disable=SC2086
  assert_no_foreign_match ${SELECTED_CONTAINER_NAMES}
fi

# --- Step 1: containers ----------------------------------------------------
# `-v` also removes ANONYMOUS volumes attached to them. That is the belt-and-
# suspenders for images whose VOLUME directive would otherwise escape the label
# scope entirely (compose does not label anonymous volumes, so both destroy and
# the verifier would be blind to them).
if [ -z "${SELECTED_CONTAINER_IDS}" ]; then
  log "step 1/4 containers : none in scope (already absent)"
else
  log "step 1/4 containers : removing -> ${SELECTED_CONTAINER_NAMES}"
  # shellcheck disable=SC2086
  docker rm -f -v ${SELECTED_CONTAINER_IDS} >/dev/null
fi

# --- Step 2: named volumes in scope ---------------------------------------
SELECTED_VOLUMES="$(docker volume ls -q --filter "label=${SCOPE}" || true)"
if [ -z "${SELECTED_VOLUMES}" ]; then
  log "step 2/4 volumes    : none in scope (already absent)"
else
  # shellcheck disable=SC2086
  assert_no_foreign_match ${SELECTED_VOLUMES}
  log "step 2/4 volumes    : removing -> $(echo ${SELECTED_VOLUMES} | tr '\n' ' ')"
  # shellcheck disable=SC2086
  docker volume rm -f ${SELECTED_VOLUMES} >/dev/null
fi

# --- Step 3: networks in scope --------------------------------------------
# In the correct design this list is ALWAYS EMPTY: the spike network is external
# and labeled repro.spike.persistent=true, not repro.spike.env=<run_id>. The
# block exists so a regression that mislabels the persistent network surfaces as
# an explicit refusal instead of a silent deletion.
SELECTED_NETWORKS="$(docker network ls -q --filter "label=${SCOPE}" || true)"
KEPT_NET_ID="$(docker network inspect -f '{{.Id}}' "${SPIKE_NETWORK}" 2>/dev/null || true)"
if [ -z "${SELECTED_NETWORKS}" ]; then
  log "step 3/4 networks   : none in scope (expected — persistent network is out of scope)"
else
  for n in ${SELECTED_NETWORKS}; do
    if [ -n "${KEPT_NET_ID}" ] && [ "${KEPT_NET_ID#${n}}" != "${KEPT_NET_ID}" ]; then
      die "REFUSING: the long-lived network ${SPIKE_NETWORK} carries the env label. \
Label namespaces have collided. Fix up.sh; no network removed."
    fi
    log "step 3/4 networks   : removing ${n}"
    docker network rm "${n}" >/dev/null || true
  done
fi

# --- Step 4: images labeled for this run ----------------------------------
# Base images (node/postgres/redis) are NOT labeled and NOT removed: they are
# shared with the foreign project's image cache on this same daemon.
SELECTED_IMAGES="$(docker image ls -q --filter "label=${SCOPE}" || true)"
if [ -z "${SELECTED_IMAGES}" ]; then
  log "step 4/4 images     : none in scope (already absent)"
else
  log "step 4/4 images     : removing -> $(echo ${SELECTED_IMAGES} | tr '\n' ' ')"
  # shellcheck disable=SC2086
  docker image rm -f ${SELECTED_IMAGES} >/dev/null || true
fi

# --- Convergence check (destroy's OWN view — deliberately NOT the evidence) --
REMAIN_C="$(docker ps -aq --filter "label=${SCOPE}" | wc -l | tr -d ' ')"
REMAIN_V="$(docker volume ls -q --filter "label=${SCOPE}" | wc -l | tr -d ' ')"
REMAIN_N="$(docker network ls -q --filter "label=${SCOPE}" | wc -l | tr -d ' ')"
log "converged? containers=${REMAIN_C} volumes=${REMAIN_V} networks=${REMAIN_N}"

# --- Preservation assertions ----------------------------------------------
for c in ${FOREIGN_CONTAINERS}; do
  if docker ps --format '{{.Names}}' | grep -qx "${c}"; then
    log "preserved: ${c} still running"
  else
    log "WARNING: foreign container ${c} is NOT running — investigate before continuing"
  fi
done
if docker network inspect "${SPIKE_NETWORK}" >/dev/null 2>&1; then
  log "preserved: long-lived network ${SPIKE_NETWORK} intact"
else
  die "REGRESSION: long-lived network ${SPIKE_NETWORK} is gone after destroy. \
The canary can no longer re-claim the CT-3 DNS names."
fi

if [ "${REMAIN_C}${REMAIN_V}${REMAIN_N}" != "000" ]; then
  die "destroy did not converge for scope ${SCOPE}"
fi
log "destroy complete for ${SCOPE}. Evidence is NOT produced here — run verify/verify.js."
