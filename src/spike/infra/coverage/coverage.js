'use strict';
/* ---------------------------------------------------------------------------
 * repro spike P0-B — B2 : `canary_coverage` EVALUATOR (fail-closed)
 *
 * CT-1: CommonJS. Zero npm dependencies.
 *
 * ======================= WHY THIS FILE EXISTS ===========================
 *
 * `escaped_side_effects = 0` — the number GATE-06 will read as proof of safety
 * — CAN BE A FAKE ZERO, and nothing in the original design detects that.
 *
 * Three analysis lenses reached the same failure mode from three directions:
 *   security  : egress to an address OUTSIDE the set the canary covers;
 *   architect : L2 at the runtime layer is blind to child_process, and Node's
 *               --permission has no --allow-net, so it cannot reach T12;
 *   devops    : on THIS machine the canary cannot bind 6379 / 5433 because
 *               tnm_redis and tnm_postgres (a DIFFERENT project, up 7+ days)
 *               hold them. A leaked WRITE to loopback would not reach the
 *               canary — it would reach a REAL database. Two silent
 *               consequences: the metric reads 0 while a real write landed,
 *               and data damage occurs outside the spike's blast radius.
 *
 * Threat model, THREAT-018 residual risk (b), verbatim: "đường loopback bị lạm
 * dụng nếu máy developer có dịch vụ thật lắng nghe ở localhost". On this host
 * that is a PRESENT condition, not a hypothetical.
 *
 * PM's adjudication folds all three into ONE precondition, evaluated here.
 * Kept as three separate exit-criteria lines instead, an implementer satisfies
 * each line individually and still lets through exactly the failure mode all
 * three point at.
 *
 * ======================= THE FOUR CLAUSES ===============================
 *
 *  (i)   A CONTROL `curl` at the old host, run from inside the replay
 *        container, OUTSIDE every test, MUST appear in the canary log.
 *  (ii)  The egress-test fixture targets an address INSIDE the covered set,
 *        and records that fact in the fixture itself. (Fixture belongs to
 *        another task — B2 supplies the MECHANISM and the MEASUREMENT, and
 *        reads the fixture's attestation file. The field is always PRESENT in
 *        the output, never omitted, so a missing attestation is visible.)
 *  (iii) The independent verifier enumerated every loopback listener at the
 *        start and the end of the scenario.
 *  (iv)  Any clause missing ⇒ canary_coverage: incomplete ⇒ FAIL-CLOSED per
 *        Spec-Spike-Protocol §4.6: "bằng chứng thiếu ⇒ tính là KHÔNG đạt".
 *  (v)   The machine-readable output prints canary_coverage NEXT TO
 *        escaped_side_effects, in the SAME file. A zero without coverage is an
 *        uninterpretable number.
 *
 * Usage:
 *   node coverage.js --run-id <id> --canary-log-dir <dir> --evidence-dir <dir>
 *                    --out-dir <dir> [--fixture-attestation <file>]
 *                    [--expected-aliases spike-app,spike-httpstub,...]
 * ------------------------------------------------------------------------- */

const fs = require('node:fs');
const path = require('node:path');

const SCHEMA = 'repro.spike.canary-coverage/v1';
const FAIL_CLOSED_RULE =
  'Spec-Spike-Protocol §4.6 — bằng chứng thiếu ⇒ tính là KHÔNG đạt, KHÔNG phải loại khỏi mẫu số.';

/* =========================== NOISE IS NOT SUBTRACTED, IT IS NAMED =========
 *
 * Every connection and every statement this tooling makes ABOUT ITSELF carries
 * a marker derived from the run_id. Nothing is excluded from
 * escaped_side_effects unless it is identified by one of these markers, or by a
 * structural property that CANNOT be produced by the workload under test.
 *
 * Three DISJOINT namespaces — no one of them is a substring of another. That
 * matters twice: the evaluator matches with indexOf over the stringified event,
 * and the control probe is the POSITIVE CONTROL for clause (i). If the canary's
 * own healthcheck carried the control marker, clause (i) would be satisfied by
 * the canary talking to itself, i.e. a tautology.
 *
 *   repro-canary-control-<run>   the control probe    -> CALIBRATION (clause i)
 *   repro-canary-selftest-<run>  the compose healthcheck of canary-net
 *   repro-verify-probe-<run>     verify.js's host-side TCP probes
 *
 * FORBIDDEN, and not done here: subtracting a constant, ignoring the first N
 * events, or excluding by source address. The healthcheck fires every 5s, so a
 * constant does not exist — the old number was a function of canary uptime.
 * Excluding by source address would blind the canary to host-origin (MTP T12)
 * leaks, which is the very thing it is deployed to catch.
 */
function markersFor(runId) {
  return {
    control: `repro-canary-control-${runId}`,
    selftest: `repro-canary-selftest-${runId}`,
    verify_probe: `repro-verify-probe-${runId}`
  };
}

/* --- Postgres log_line_prefix parser -------------------------------------
 * Prefix format is fixed by docker-compose.canary.yml:
 *   %m [canary] user=%u db=%d app=%a client=%h
 * `%h` for a UNIX-SOCKET connection is the literal string `[local]`, NOT an
 * empty string. The previous revision filtered on /client=\S/ intending to drop
 * local traffic and dropped nothing at all, because `[local]` matches `\S`.
 * That single mistake is where 19 of the 23 phantom side effects came from.
 * Non-greedy captures below so an empty `%a` / `%h` does not swallow `LOG:`.
 */
const PG_PREFIX_RE = /\suser=(\S*?)\sdb=(\S*?)\sapp=(.*?)\sclient=(\S*?)\s/;
const PG_LOCAL_CLIENT = '[local]';
// Emitted by probe-control.sh through psql, so canary-db's OWN log states which
// DNS alias the client dialed.
const DB_CONTROL_RE = /repro-canary-db-control alias=([^\s']+) marker=([^\s']+)/;

function parseArgs(argv) {
  const out = {
    runId: null,
    canaryLogDir: null,
    evidenceDir: null,
    outDir: null,
    fixtureAttestation: null,
    expectedAliases: ['spike-app', 'spike-httpstub', 'spike-redis', 'spike-postgres']
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--run-id') out.runId = next();
    else if (a === '--canary-log-dir') out.canaryLogDir = next();
    else if (a === '--evidence-dir') out.evidenceDir = next();
    else if (a === '--out-dir') out.outDir = next();
    else if (a === '--fixture-attestation') out.fixtureAttestation = next();
    else if (a === '--expected-aliases') out.expectedAliases = next().split(',').filter(Boolean);
    else throw new Error('unknown argument: ' + a);
  }
  ['runId', 'canaryLogDir', 'evidenceDir', 'outDir'].forEach((k) => {
    if (!out[k]) throw new Error(`--${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())} is required`);
  });
  return out;
}

function readNdjson(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch (e) {
        return { kind: 'unparseable', raw: l.slice(0, 200) };
      }
    });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const now = new Date().toISOString();
  const MARKERS = markersFor(args.runId);
  const marker = MARKERS.control; // clause (i) positive control

  /* ---------------- canary network log ---------------------------------- */
  let canaryEvents = [];
  let canaryLogFiles = [];
  if (fs.existsSync(args.canaryLogDir)) {
    canaryLogFiles = fs
      .readdirSync(args.canaryLogDir)
      .filter((n) => n.endsWith('.ndjson') && n.indexOf(args.runId) >= 0);
    canaryLogFiles.forEach((n) => {
      canaryEvents = canaryEvents.concat(readNdjson(path.join(args.canaryLogDir, n)));
    });
  }

  const listeningEvents = canaryEvents.filter((e) => e.kind === 'listening');
  const listenErrors = canaryEvents.filter((e) => e.kind === 'listen_error');
  const claimedAliases = Array.from(
    new Set(
      canaryEvents.reduce((acc, e) => acc.concat(e.canary_aliases || []), [])
    )
  );

  /* ---------------- canary DB sink -------------------------------------- */
  const auditFile = path.join(args.canaryLogDir, `canary-db-audit-${args.runId}.json`);
  const stmtFile = path.join(args.canaryLogDir, `canary-db-statements-${args.runId}.log`);
  let auditRows = null;
  let auditHarvested = false;
  if (fs.existsSync(auditFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
      if (Array.isArray(parsed)) {
        auditRows = parsed;
        auditHarvested = true;
      } else {
        auditRows = [];
        auditHarvested = Boolean(parsed.harvested);
      }
    } catch (e) {
      auditRows = null;
    }
  }
  /* ---------------- DB sink: classify EVERY statement line ---------------
   * The postgres entrypoint runs a temporary server during initdb with the same
   * -c log_statement=all flags, so every statement of 01-canary-audit.sql is
   * logged. Those arrive over the UNIX SOCKET, which Postgres records as the
   * literal `client=[local]`. A unix-socket statement cannot have come from the
   * replay workload: the workload is in another container and can only reach
   * this Postgres over TCP. That is a structural impossibility, not a
   * heuristic, and it is why the exclusion is legitimate.
   *
   * Everything else is classified by an IDENTIFIER, never by position or count:
   *   - the DB control probe, by its marker in `application_name`;
   *   - canary-db's own pg_isready healthcheck, by application_name.
   * Anything left is a statement from a network client = an escaped side
   * effect, and it is counted.
   */
  const allStatementLines = fs.existsSync(stmtFile)
    ? fs.readFileSync(stmtFile, 'utf8').split('\n').filter((l) => /LOG:\s+statement:/i.test(l) || /STATEMENT:\s+/.test(l))
    : [];

  function classifyStatementLine(line) {
    const m = PG_PREFIX_RE.exec(line);
    const app = m ? m[3] : null;
    const client = m ? m[4] : null;
    if (!m) {
      if (/STATEMENT:\s+/.test(line)) {
        return { counted: false, reason: 'db_statement_error_detail', app, client };
      }
      return { counted: true, reason: 'unattributable_prefix', app, client };
    }
    if (client === PG_LOCAL_CLIENT) {
      return { counted: false, reason: 'db_local_unix_socket', app, client };
    }
    if (app && app.indexOf(MARKERS.control) >= 0) {
      return { counted: false, reason: 'db_control_probe', app, client };
    }
    if (line.indexOf(MARKERS.control) >= 0) {
      return { counted: false, reason: 'db_control_probe', app, client };
    }
    if (app === 'pg_isready') {
      return { counted: false, reason: 'db_healthcheck_pg_isready', app, client };
    }
    if (!/LOG:\s+statement:/i.test(line) && /STATEMENT:\s+/.test(line)) {
      return { counted: false, reason: 'db_statement_error_detail', app, client };
    }
    return { counted: true, reason: 'db_network_client', app, client };
  }

  const dbClassified = allStatementLines.map((l) => ({ line: l, cls: classifyStatementLine(l) }));
  const dbStatementLines = dbClassified.filter((x) => x.cls.counted).map((x) => x.line);
  const dbExcludedByReason = {};
  dbClassified
    .filter((x) => !x.cls.counted)
    .forEach((x) => {
      dbExcludedByReason[x.cls.reason] = (dbExcludedByReason[x.cls.reason] || 0) + 1;
    });
  const dbLocalStatementLines = dbExcludedByReason.db_local_unix_socket || 0;
  const dbControlStatementLines = dbExcludedByReason.db_control_probe || 0;

  // The DB sink's own positive control: which alias did the control probe dial,
  // according to canary-db's log rather than according to our configuration?
  const dbControlHits = [];
  dbClassified.forEach((x) => {
    if (x.cls.reason !== 'db_control_probe') return;
    const m = DB_CONTROL_RE.exec(x.line);
    dbControlHits.push({
      alias_dialled: m ? m[1] : null,
      marker_seen: m ? m[2] : null,
      application_name: x.cls.app,
      client: x.cls.client,
      marker_matches_run: Boolean(m && m[2] === MARKERS.control)
    });
  });
  const dbProvenAliases = Array.from(
    new Set(
      dbControlHits
        .filter((h) => h.marker_matches_run && h.alias_dialled && h.client !== PG_LOCAL_CLIENT)
        .map((h) => h.alias_dialled)
    )
  );

  /* ---------------- COVERED SET = both sinks -----------------------------
   * The network canary declares its aliases in every ndjson line it writes.
   * canary-db writes no ndjson, so the ONLY sink that could ever appear in
   * `claimed_aliases` was the network one, and `spike-postgres` was reported
   * missing on every run forever — a mechanism reporting falsely about itself.
   *
   * The DB sink's aliases are therefore taken from canary-db's OWN statement
   * log: the control probe connects with psql through the alias and logs a
   * statement naming the alias it dialled. The DB could not have logged that
   * line unless the alias resolved to it, it accepted the destroyed
   * environment's credentials, and log_statement=all was on.
   */
  const coveredAliases = Array.from(new Set(claimedAliases.concat(dbProvenAliases)));

  /* ---------------- clause (i): the control probe ------------------------ */
  const controlHits = canaryEvents.filter((e) => {
    const hay = JSON.stringify(e);
    return hay.indexOf(marker) >= 0;
  });
  const controlByAlias = {};
  controlHits.forEach((e) => {
    const port = e.port;
    controlByAlias[String(port)] = (controlByAlias[String(port)] || 0) + 1;
  });
  const dbControlOk = dbControlHits.some((h) => h.marker_matches_run);
  const clauseI = {
    id: 'i',
    requirement:
      'A control curl to the OLD host, executed from inside the replay container, ' +
      'OUTSIDE every test, must appear in the canary log — in BOTH sinks.',
    marker,
    // BOTH halves. A control that only exercises the network sink leaves the DB
    // sink completely uncalibrated: "canary-db logged no statement" and
    // "canary-db was never reachable at spike-postgres" would stay
    // indistinguishable, which is the exact failure clause (i) exists to kill.
    satisfied: controlHits.length > 0 && dbControlOk,
    network_sink_satisfied: controlHits.length > 0,
    db_sink_satisfied: dbControlOk,
    control_events_found: controlHits.length,
    control_events_by_port: controlByAlias,
    db_control_hits: dbControlHits,
    why_it_matters:
      'Without a positive control, "canary saw nothing" and "canary was not on ' +
      'the address" are indistinguishable, and escaped_side_effects = 0 is ' +
      'unreadable.'
  };

  /* ---------------- clause (ii): fixture attestation --------------------- */
  // Owned by another task (B5/B8 fixtures). B2 supplies the mechanism and the
  // measurement; the field is ALWAYS present so a missing attestation is
  // visible rather than absent.
  let fixture = null;
  let fixtureError = null;
  if (args.fixtureAttestation) {
    try {
      fixture = JSON.parse(fs.readFileSync(args.fixtureAttestation, 'utf8'));
    } catch (e) {
      fixtureError = e.message;
    }
  }
  const fixtureTargets = (fixture && fixture.egress_targets) || [];
  const coveredSet = coveredAliases.length ? coveredAliases : [];
  const uncoveredTargets = fixtureTargets.filter(
    (t) => coveredSet.indexOf(typeof t === 'string' ? t : t.host) < 0
  );
  const clauseII = {
    id: 'ii',
    requirement:
      'The egress-test fixture must aim at a destination INSIDE the canary-covered ' +
      'set, and must record that fact in the fixture itself.',
    owner: 'fixture task (B5 / B8) — B2 supplies the mechanism and reads the attestation',
    attestation_path: args.fixtureAttestation || null,
    attestation_present: Boolean(fixture),
    attestation_parse_error: fixtureError,
    expected_attestation_shape: {
      egress_targets: ['<hostname the fixture aims at>'],
      declared_inside_canary_set: true,
      fixture_id: '<T8 / T12 / ...>'
    },
    fixture_targets: fixtureTargets,
    targets_outside_canary_set: uncoveredTargets,
    satisfied:
      Boolean(fixture) &&
      fixture.declared_inside_canary_set === true &&
      fixtureTargets.length > 0 &&
      uncoveredTargets.length === 0
  };

  /* ---------------- clause (iii): loopback enumeration ------------------- */
  let evidenceFiles = [];
  if (fs.existsSync(args.evidenceDir)) {
    evidenceFiles = fs
      .readdirSync(args.evidenceDir)
      .filter((n) => n.indexOf(args.runId) >= 0 && n.endsWith('.json') && n.indexOf('destroy-evidence') === 0);
  }
  const enumerated = evidenceFiles
    .map((n) => {
      try {
        const j = JSON.parse(fs.readFileSync(path.join(args.evidenceDir, n), 'utf8'));
        const o = j.observations || {};
        return {
          file: n,
          phase: j.phase,
          has_start: Array.isArray(o.all_listeners_at_start) && o.all_listeners_at_start.length > 0,
          has_end: Array.isArray(o.all_listeners_at_end) && o.all_listeners_at_end.length > 0,
          lsof_ok: o.lsof_ok === true
        };
      } catch (e) {
        return { file: n, error: e.message, has_start: false, has_end: false, lsof_ok: false };
      }
    })
    .filter(Boolean);
  const clauseIII = {
    id: 'iii',
    requirement:
      'The independent verifier enumerated EVERY loopback TCP listener ' +
      '(lsof -nP -iTCP -sTCP:LISTEN) at the START and the END of the scenario.',
    evidence_files: enumerated,
    satisfied:
      enumerated.length > 0 && enumerated.every((e) => e.has_start && e.has_end && e.lsof_ok),
    why_it_matters:
      "L2's allowlist includes loopback by design, so T12 cannot be blocked and " +
      'is a known blind spot. Enumerating listeners converts that blind spot ' +
      'into dated evidence at ~zero cost.'
  };

  /* ---------------- loopback listeners metric (D-12 / Q5) ---------------- */
  let loopbackListenersUncovered = 0;
  let loopbackListenersTotal = 0;
  const canaryHeldHostPorts = new Set([18080, 18081, 15432, 16379]);
  if (evidenceFiles.length > 0) {
    const uniquePorts = new Set();
    evidenceFiles.forEach((n) => {
      try {
        const j = JSON.parse(fs.readFileSync(path.join(args.evidenceDir, n), 'utf8'));
        const o = j.observations || {};
        const s = o.all_listeners_at_start || [];
        const e = o.all_listeners_at_end || [];
        [...s, ...e].forEach((l) => {
          if (l && l.port) uniquePorts.add(Number(l.port));
        });
      } catch (_) {}
    });
    loopbackListenersTotal = uniquePorts.size;
    uniquePorts.forEach((p) => {
      if (!canaryHeldHostPorts.has(p)) {
        loopbackListenersUncovered += 1;
      }
    });
  }

  /* ---------------- clause (iv): address contention ---------------------- */
  // Not one of the three original lens findings but the concrete local form of
  // all of them: did the canary actually bind everything it claimed?
  const missingAliases = args.expectedAliases.filter((a) => coveredAliases.indexOf(a) < 0);
  const clauseIV = {
    id: 'iv-bind',
    requirement:
      'The canary must actually HOLD every address in the expected covered set — ' +
      'no bind error, no alias missing.',
    expected_aliases: args.expectedAliases,
    claimed_aliases: coveredAliases,
    claimed_aliases_by_sink: {
      network_sink_self_declared: claimedAliases,
      db_sink_proven_by_its_own_statement_log: dbProvenAliases
    },
    missing_aliases: missingAliases,
    listen_errors: listenErrors.map((e) => ({ port: e.port, error: e.error })),
    ports_listening: listeningEvents.map((e) => ({ port: e.port, mode: e.mode })),
    db_sink_harvested: auditHarvested,
    satisfied:
      listenErrors.length === 0 &&
      missingAliases.length === 0 &&
      listeningEvents.length > 0 &&
      auditHarvested,
    known_local_hazard:
      'tnm_redis holds 6379 and tnm_postgres holds 5433 on this daemon. The spike ' +
      'host ports are chosen to avoid them; up.sh and canary-up.sh fail closed if ' +
      'a chosen port is nonetheless held. Foreign containers are never stopped by ' +
      'this tooling.'
  };

  /* ---------------- escaped_side_effects -------------------------------- */
  // SINGLE SOURCE OF TRUTH: the canary log. NEVER the replay runtime's own log
  // (MTP §5.2, Timeline B7-11 — using the runtime to prove the runtime blocked
  // something is circular verification).
  //
  // COUNTING RULES, and why each exists:
  //
  //  R1. The control probe is CALIBRATION, not a leak. The marker appears only
  //      on the payload-bearing event (http_request header / tcp_close body),
  //      never on the bare accept. So we first collect every conn_id linked to
  //      a marked event, then exclude EVERY event sharing those conn_ids.
  //      Without R1 a perfectly clean run reads >= 3 from its own probe.
  //  R2. Count one CONNECTION once. An accept plus its request is one attempt,
  //      not two.
  //  R3. The DB statement log is a superset of the audit table: a leaked INSERT
  //      that succeeds produces one audit row AND one statement line. The
  //      statement log wins the headline count (it also catches statements that
  //      errored out and never reached a table); audit rows stay in the
  //      breakdown so a reader can see which leaks actually landed.
  //  R4. A statement logged with client=[local] came over the UNIX SOCKET. The
  //      workload under test lives in another container and can only reach this
  //      Postgres over TCP, so a unix-socket statement is structurally
  //      impossible to attribute to it. These are initdb and in-container exec.
  //  R5. The canary's own compose healthcheck carries repro-canary-selftest-*,
  //      and verify.js's host-side port probes carry repro-verify-probe-*. Both
  //      are excluded BY MARKER, in namespaces disjoint from the control probe.
  //  R6. Residual, marker-less self-traffic: a connection whose peer is this
  //      container's OWN loopback can only have been made by a process inside
  //      the canary container — i.e. the healthcheck whose marked request had
  //      not arrived yet when the canary was torn down. Host-origin traffic
  //      arrives as the bridge gateway address, never as 127.0.0.1, so this
  //      does NOT mask an MTP T12 leak. Counted and reported separately.
  const SELF_SOURCES = [
    { key: 'control_probe', marker: MARKERS.control },
    { key: 'canary_selftest', marker: MARKERS.selftest },
    { key: 'verifier_probe', marker: MARKERS.verify_probe }
  ];

  // conn_id -> the NAMED reason it is not a leak. Marker evidence wins over
  // structural evidence, so the breakdown attributes as precisely as possible.
  const connExclusion = new Map();
  const markedConnIdsBySource = {};
  SELF_SOURCES.forEach((s) => (markedConnIdsBySource[s.key] = new Set()));

  canaryEvents.forEach((e) => {
    if (!e.conn_id) return;
    const hay = JSON.stringify(e);
    SELF_SOURCES.forEach((s) => {
      if (hay.indexOf(s.marker) >= 0) {
        markedConnIdsBySource[s.key].add(e.conn_id);
        if (!connExclusion.has(e.conn_id)) connExclusion.set(e.conn_id, s.key);
      }
    });
  });
  canaryEvents.forEach((e) => {
    if (!e.conn_id || connExclusion.has(e.conn_id)) return;
    const isSelfLoopback =
      e.origin === 'canary-container-loopback' ||
      (e.peer && e.peer.origin === 'canary-container-loopback');
    if (isSelfLoopback) connExclusion.set(e.conn_id, 'canary_selftest_unmarked_loopback'); // R6
  });

  // R1 kept for continuity of the published field name.
  const markedConnIds = markedConnIdsBySource.control_probe;

  const candidateKinds = ['tcp_accept', 'http_request', 'tcp_close'];
  const connKeys = new Set();
  const excludedConnKeys = new Set();
  let unlinkedEvents = 0;
  let unlinkedExcluded = 0;
  canaryEvents.forEach((e) => {
    if (candidateKinds.indexOf(e.kind) < 0) return;
    if (!e.conn_id) {
      // Must never be silently dropped. Excluded only on its own marker.
      const hay = JSON.stringify(e);
      if (SELF_SOURCES.some((s) => hay.indexOf(s.marker) >= 0)) unlinkedExcluded += 1;
      else unlinkedEvents += 1;
      return;
    }
    if (connExclusion.has(e.conn_id)) excludedConnKeys.add(e.conn_id); // R1/R5/R6
    else connKeys.add(e.conn_id); // R2 — one connection counts once
  });
  const escapedFromNetwork = connKeys.size + unlinkedEvents;

  const networkExcludedByReason = {};
  excludedConnKeys.forEach((id) => {
    const r = connExclusion.get(id);
    networkExcludedByReason[r] = (networkExcludedByReason[r] || 0) + 1;
  });
  SELF_SOURCES.forEach((s) => {
    if (!(s.key in networkExcludedByReason)) networkExcludedByReason[s.key] = 0;
  });
  if (!('canary_selftest_unmarked_loopback' in networkExcludedByReason)) {
    networkExcludedByReason.canary_selftest_unmarked_loopback = 0;
  }

  // Every remaining counted connection, dumped in full. A number a reader
  // cannot audit line by line is the same uninterpretable number in a new hat.
  const escapedNetworkDetail = canaryEvents
    .filter((e) => candidateKinds.indexOf(e.kind) >= 0 && e.conn_id && connKeys.has(e.conn_id))
    .map((e) => ({
      kind: e.kind,
      port: e.port,
      conn_id: e.conn_id,
      ts: e.ts,
      origin: e.origin || (e.peer && e.peer.origin) || null,
      remote_address: (e.peer && e.peer.remote_address) || null
    }));

  const auditRowCount = Array.isArray(auditRows)
    ? auditRows.filter((r) => r && r.event_kind !== 'canary:initialised').length
    : null;
  const escapedFromDb = dbStatementLines.length; // R3
  const escapedSideEffects = escapedFromNetwork + escapedFromDb;

  /* --------- SUGGESTION-4: the tooling's own structural footprint ---------
   * Some of this noise is DESIGN, not defect: verify.js must probe every
   * published port in every phase, and the canary must be healthchecked. Those
   * connections will exist in every future run. Printing how many were removed,
   * and under which name, is more durable than any claim of perfect filtering —
   * a reader can see the mechanism working instead of trusting that it did.
   * This does NOT replace the requirement that a clean run reads 0.
   */
  const baselineFromOwnTooling = {
    total:
      Object.keys(networkExcludedByReason).reduce(
        (n, k) => n + networkExcludedByReason[k],
        0
      ) +
      unlinkedExcluded +
      dbLocalStatementLines +
      dbControlStatementLines +
      (dbExcludedByReason.db_healthcheck_pg_isready || 0),
    network_sink: networkExcludedByReason,
    network_sink_unlinked_marked_events: unlinkedExcluded,
    db_sink: dbExcludedByReason,
    rule:
      'Excluded ONLY by identity: a marker in a namespace derived from this ' +
      'run_id, or a structural impossibility (unix-socket statement; a peer on ' +
      "the canary container's own loopback). No constant is subtracted and no " +
      'prefix of events is skipped.',
    markers: MARKERS
  };

  const clauses = [clauseI, clauseII, clauseIII, clauseIV];
  const unsatisfied = clauses.filter((c) => !c.satisfied).map((c) => c.id);
  const coverage = unsatisfied.length === 0 ? 'complete' : 'incomplete';

  const out = {
    schema: SCHEMA,
    run_id: args.runId,
    generated_at: now,

    /* (v) — the two fields side by side, in the SAME file, always. */
    canary_coverage: coverage,
    escaped_side_effects: escapedSideEffects,
    loopback_listeners_not_covered_by_canary: loopbackListenersUncovered,
    escaped_side_effects_readable: coverage === 'complete',
    escaped_side_effects_source: 'canary log (network sink + DB sink)',
    escaped_side_effects_source_rule:
      'MTP-Spike-Phase-0 §5.2 and Timeline B7-11: the source of truth is the ' +
      'canary log, NEVER the replay runtime log. Using the runtime to prove the ' +
      'runtime blocked something is circular verification.',
    /* SUGGESTION-4 — printed NEXT TO the headline, same file, always. */
    baseline_from_own_tooling: baselineFromOwnTooling,

    escaped_side_effects_breakdown: {
      network_sink_distinct_connections: escapedFromNetwork,
      network_sink_counted_events: escapedNetworkDetail,
      network_sink_connections_excluded_by_reason: networkExcludedByReason,
      network_sink_unlinked_events_counted: unlinkedEvents,
      db_sink_statement_log_lines_from_network_clients: escapedFromDb,
      db_sink_statement_lines_total: allStatementLines.length,
      db_sink_statement_lines_excluded_by_reason: dbExcludedByReason,
      db_sink_audit_rows: auditRowCount,
      db_sink_local_statement_lines_excluded: dbLocalStatementLines,
      control_probe_connections_excluded: markedConnIds.size,
      counting_rules: {
        R1: 'The control probe is calibration, not a leak: every event sharing a conn_id with a marker-bearing event is excluded.',
        R2: 'One connection counts once — an accept plus its request is one attempt.',
        R3: 'The DB statement log is the headline DB source (it also catches statements that errored out). Audit rows are a subset and are reported, not added, to avoid double counting.',
        R4: "A statement line whose prefix says client=[local] arrived over the UNIX SOCKET (Postgres prints the literal '[local]' for %h, NOT an empty string). The workload under test runs in another container and can only reach this Postgres over TCP, so such a line is structurally impossible to attribute to it: it is initdb or an in-container exec. Excluded.",
        R5: "The canary's own compose healthcheck and verify.js's host-side port probes each carry their own marker namespace (repro-canary-selftest-*, repro-verify-probe-*), disjoint from the control probe's, and are excluded by marker. Without this, escaped_side_effects was a function of how long the canary stayed up.",
        R6: "A connection whose peer is the canary container's OWN loopback can only come from a process inside that container (the healthcheck). Host-origin traffic arrives as the bridge gateway address, so this exclusion cannot hide an MTP T12 loopback leak.",
        R7: 'Một statement đếm một lần: neo vào LOG: statement: để đếm, dòng STATEMENT: lặp lại sau ERROR giữ cho detail/audit và không đếm đôi (W-7 fix).',
        FORBIDDEN:
          'Subtracting a constant, skipping the first N events, or excluding by ' +
          'source address. None is used here. Excluding by source address in ' +
          'particular would blind the canary to exactly the host-origin leaks it ' +
          'is deployed to catch.'
      }
    },

    verdict: {
      value: coverage === 'complete' ? 'evaluable' : 'NOT_EVALUABLE',
      unsatisfied_clauses: unsatisfied,
      fail_closed_rule: FAIL_CLOSED_RULE,
      interpretation:
        coverage === 'complete'
          ? 'escaped_side_effects may be read as a safety figure for this run.'
          : 'escaped_side_effects MUST NOT be read as a safety figure for this run. ' +
            'A 0 here is an uninterpretable number, not evidence of safety. The run ' +
            'counts as NOT PASSING.'
    },

    canary_covered_set: coveredAliases,
    canary_covered_set_by_sink: {
      network_sink_self_declared: claimedAliases,
      db_sink_proven_by_its_own_statement_log: dbProvenAliases
    },
    canary_log_files: canaryLogFiles,
    clauses,

    provenance: {
      produced_by: 'src/spike/infra/coverage/coverage.js',
      adjudication: 'run-plan 2026-08-15-p0b-spike-build §1 (PM), folding three lens findings into one precondition',
      anchors: [
        'Spec-Spike-Protocol §4.6 (fail-closed)',
        'MTP-Spike-Phase-0 §5.1 (ECONNREFUSED trap), §5.2 (canary spec), §5.4 (T8/T12)',
        'Spec-Security-Repro-Threat-Model THREAT-018 residual risk (b)'
      ]
    }
  };

  fs.mkdirSync(args.outDir, { recursive: true });
  const file = path.join(
    args.outDir,
    `canary-coverage-${args.runId}-${now.replace(/[:.]/g, '-')}.json`
  );
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n', 'utf8');

  process.stderr.write(
    `[coverage] ${file}\n[coverage] canary_coverage=${coverage} ` +
      `escaped_side_effects=${escapedSideEffects} readable=${out.escaped_side_effects_readable}\n` +
      `[coverage] baseline_from_own_tooling=${baselineFromOwnTooling.total} ` +
      `(net ${JSON.stringify(networkExcludedByReason)} db ${JSON.stringify(dbExcludedByReason)})\n` +
      `[coverage] covered_set=${JSON.stringify(coveredAliases)} ` +
      `missing=${JSON.stringify(missingAliases)} unsatisfied=${JSON.stringify(unsatisfied)}\n`
  );
  process.stdout.write(file + '\n');

  // FAIL-CLOSED exit code.
  if (coverage !== 'complete') process.exitCode = 30;
}

try {
  main();
} catch (e) {
  process.stderr.write('[coverage] FATAL ' + e.stack + '\n');
  process.exit(1);
}
