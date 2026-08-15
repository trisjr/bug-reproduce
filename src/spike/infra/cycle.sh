#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# repro spike P0-B — B2 : one full evidence cycle.
#
#   bash cycle.sh [--infra-only] [--run-id <id>]
#
# Sequence, and why it is this sequence:
#   1. up.sh              build the environment (labels + long-lived network)
#   2. verify --phase pre-destroy --scope-proof establish
#                         baseline evidence WHILE the environment is alive. This
#                         is the ONE step that can calibrate the label scope, so
#                         it is a HARD failure (see SCOPE CALIBRATION below).
#   3. destroy.sh         first destroy
#   4. verify post-destroy-1
#   5. destroy.sh         SECOND destroy — the idempotency proof
#   6. verify post-destroy-2
#   7. diff the `assertions` blocks of (4) and (6). Identical ⇒ idempotent.
#      Idempotent does not mean "runs twice without erroring"; it means the
#      post-state converges to absence and stays there.
#   8. canary-up.sh --control-probe   canary claims the old addresses; the
#      clause (i) control probe runs from inside the spike network
#   9. verify --phase canary-active   loopback enumeration with canary bound
#  10. canary-down.sh     harvest DB statement log + append-only audit table
#  11. coverage.js        emit canary_coverage NEXT TO escaped_side_effects
#
# ========================== HOW SUB-SCRIPTS ARE CALLED =====================
#
# Every sub-script is invoked as `bash "<path>"`, NEVER as `"<path>"`. The exec
# bit is not guaranteed to survive checkout, and this file used to die on its
# very first line with `Permission denied` when run exactly the way the runbook
# says to run it. Depending on `chmod` would make the pipeline depend on a
# mutable property of the working copy instead of on committed content.
#
# ========================== EXIT-CODE POLICY ===============================
#
# The layers below are deliberately FAIL-CLOSED: verify.js exits 21/22/23/24/25
# and coverage.js exits 30 when the evidence does not support a pass. An
# orchestrator that swallows those with `|| true` leaves Spec-Spike-Protocol
# §4.6 ("bằng chứng thiếu ⇒ tính là KHÔNG đạt") in force for a HUMAN reading the
# JSON and repealed for every MACHINE reading the exit status. There is exactly
# one `|| true`-shaped construct left in this file and it is the ledger below,
# which RECORDS the code instead of discarding it.
#
#   HARD-FAIL (abort immediately, via set -e):
#     up, pre-destroy verify, both destroys, both post-destroy verifies, the
#     idempotency diff. Continuing past any of these produces evidence about a
#     state nobody established.
#
#   LEDGERED (record the code, keep going, exit non-zero at the end):
#     the canary section only. A failure there must NOT skip canary-down.sh:
#     aborting between canary-up and canary-down would leave the canary stack,
#     its volume and its published ports alive on the host — a cleanup
#     violation, and the next run would then fail-closed on port contention.
#
# EXPECT A NON-ZERO EXIT WHILE clause (ii) IS UNOWNED. The fixture attestation
# belongs to the fixture task (B5/B8, Wave 2-3). Until it exists,
# canary_coverage is `incomplete` and coverage.js exits 30 BY DESIGN, so this
# script exits 30. That non-zero IS the mechanism working.
# ---------------------------------------------------------------------------
set -euo pipefail
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

# Same interpreter that is running this file; falls back to PATH lookup.
SH="${BASH:-bash}"

PASSTHRU=""
while [ $# -gt 0 ]; do
  case "$1" in
    --infra-only) PASSTHRU="${PASSTHRU} --infra-only" ;;
    --run-id)     PASSTHRU="${PASSTHRU} --run-id ${2:-}"; shift ;;
    *) die "unknown arg: $1" ;;
  esac
  shift
done

# --- exit-code ledger -------------------------------------------------------
# Keeps the FIRST meaningful failure so the reported code names a cause rather
# than whatever happened to run last.
CYCLE_RC=0
CYCLE_FAILURES=""
note_failure() {
  # $1 = exit code, $2 = what failed
  log "FAIL-CLOSED SIGNAL: $2 exited $1 (not swallowed; propagated to cycle exit)"
  CYCLE_FAILURES="${CYCLE_FAILURES}
  - $2 -> exit $1"
  if [ "${CYCLE_RC}" -eq 0 ]; then CYCLE_RC="$1"; fi
  return 0
}

# ============================ HARD-FAIL SECTION =============================

# shellcheck disable=SC2086
"${SH}" "${INFRA_DIR}/up.sh" ${PASSTHRU}
load_run_env
RID="${SPIKE_RUN_ID}"

# SCOPE CALIBRATION — was `|| true`, which silently discarded the only step able
# to prove that `repro.spike.env=<run_id>` selects anything at all. Without it,
# a nonexistent label key and a never-existed run_id both yield four empty
# residual arrays, i.e. `destroy_clean: true`, i.e. a full clean+IDEMPOTENT
# evidence set for an environment that is still running. `--scope-proof
# establish` makes this step FAIL when the scope selects nothing, and the
# evidence file it writes is what the later phases require before they are
# allowed to believe their own emptiness.
"${SH}" "${INFRA_DIR}/verify/verify.sh" --phase pre-destroy --scope-proof establish

"${SH}" "${INFRA_DIR}/destroy.sh"
E1="$("${SH}" "${INFRA_DIR}/verify/verify.sh" --phase post-destroy-1)"
"${SH}" "${INFRA_DIR}/destroy.sh"
E2="$("${SH}" "${INFRA_DIR}/verify/verify.sh" --phase post-destroy-2)"

log "idempotency proof: comparing the assertions blocks of the two evidence files"
node -e '
var fs=require("node:fs");
function A(p){var j=JSON.parse(fs.readFileSync(p,"utf8"));return JSON.stringify(j.assertions,null,2);}
var a=A(process.argv[1]), b=A(process.argv[2]);
if(a===b){console.log("IDEMPOTENT: assertions blocks are byte-identical");process.exit(0);}
console.error("NOT IDEMPOTENT: assertions blocks differ");
console.error("--- run1 ---\n"+a+"\n--- run2 ---\n"+b);
process.exit(31);
' "${E1}" "${E2}"

# ============================ LEDGERED SECTION ==============================
# From here on, failures are recorded and the cycle continues, because
# canary-down.sh MUST run.

RC=0
"${SH}" "${INFRA_DIR}/canary-up.sh" --control-probe || RC=$?
if [ "${RC}" -ne 0 ]; then note_failure "${RC}" "canary-up.sh --control-probe"; fi

sleep 2

RC=0
"${SH}" "${INFRA_DIR}/verify/verify.sh" --phase canary-active || RC=$?
if [ "${RC}" -ne 0 ]; then note_failure "${RC}" "verify --phase canary-active"; fi

# UNCONDITIONAL. Harvests the DB statement log (which only exists inside the
# container) and releases the published ports, whatever happened above.
RC=0
"${SH}" "${INFRA_DIR}/canary-down.sh" || RC=$?
if [ "${RC}" -ne 0 ]; then note_failure "${RC}" "canary-down.sh"; fi

RC=0
node "${INFRA_DIR}/coverage/coverage.js" \
  --run-id "${RID}" \
  --canary-log-dir "${CANARY_LOG_DIR}" \
  --evidence-dir "${EVIDENCE_DIR}" \
  --out-dir "${EVIDENCE_DIR}" || RC=$?
if [ "${RC}" -ne 0 ]; then
  note_failure "${RC}" "coverage.js (exit 30 = canary_coverage is 'incomplete')"
fi

if [ "${CYCLE_RC}" -eq 0 ]; then
  log "cycle complete for ${RID}. Evidence in ${EVIDENCE_DIR}"
else
  log "cycle for ${RID} ran to completion; evidence in ${EVIDENCE_DIR}"
  log "FAIL-CLOSED exit ${CYCLE_RC}. Signals:${CYCLE_FAILURES}"
  log "Read canary_coverage / verdict.unsatisfied_clauses in the coverage JSON."
fi
exit "${CYCLE_RC}"
