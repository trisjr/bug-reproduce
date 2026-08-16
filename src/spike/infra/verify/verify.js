'use strict';
/* ---------------------------------------------------------------------------
 * repro spike P0-B — B2 : INDEPENDENT DESTROY VERIFIER
 *
 * CT-1: CommonJS. Zero npm dependencies (node: built-ins only) so this never
 * touches package.json, which is owned by worker B1.
 *
 * ============================ INDEPENDENCE ==============================
 *
 * Exit criteria B2(b): "Bằng chứng phải do một công cụ ĐỘC LẬP sinh ra (không
 * phải chính script destroy)". This file provides HALF of what that sentence
 * asks for, and the gap is declared here and in Deploy-Spike.md rather than
 * papered over.
 *
 *   INDEPENDENT AT THE TOOL LAYER  -- YES.
 *     Separate package. Imports nothing from destroy.sh or lib/common.sh; it
 *     re-derives the label scope from its own CLI arguments. It does not shell
 *     out to the `docker` CLI either: it speaks the Docker Engine HTTP API
 *     directly over the unix socket, adds host-side TCP probes and an lsof
 *     enumeration that have no counterpart in destroy at all. A second call
 *     into the same code path would NOT be an independent verifier, and that
 *     is precisely the self-deception this file is written to avoid.
 *
 *   INDEPENDENT AT THE AUTHORITY LAYER -- NO.
 *     The source of truth is still the very dockerd that destroy commands. If
 *     dockerd lies, or is compromised, or simply does not know about a
 *     resource, this verifier repeats the lie. Worse and concretely: this host
 *     has THREE docker contexts (colima, default, desktop-linux). A resource
 *     surviving under a context other than the one probed is completely
 *     invisible here. A provider-side inventory -- the thing that would close
 *     this -- does not exist in a local simulation.
 *
 *   ⇒ Every evidence file carries `independence.authority_layer: false` and the
 *     list of contexts NOT probed. The narrow proposition actually proven is:
 *     "within the declared label scope, on ONE docker context, at the moment of
 *     measurement, no resource matching the scope exists."
 *     It is NOT: "no path exists by which the original environment still lives."
 *
 * ============================ LOOPBACK ENUMERATION ======================
 *
 * Every run enumerates EVERY loopback TCP listener via
 *   lsof -nP -iTCP -sTCP:LISTEN
 * at the START and at the END of the run, and writes both into the evidence.
 *
 * Why this is worth doing: L2's egress allowlist INCLUDES loopback by design,
 * so T12 (destination resolving to loopback) is a KNOWN blind spot that no
 * amount of careful B5 code closes. Enumerating listeners turns that blind spot
 * into dated evidence at ~zero marginal cost, because the verifier has to exist
 * anyway. It also catches the live hazard on this machine: tnm_redis holds
 * 6379 and tnm_postgres holds 5433, so a leaked WRITE to loopback could land in
 * ANOTHER PROJECT'S database instead of in the canary -- silently producing
 * escaped_side_effects = 0 while real damage occurred outside the blast radius
 * (THREAT-018 residual risk (b)).
 *
 * ============================ FILE LAYOUT ===============================
 *
 * `assertions` : stable, comparable. Two runs of destroy must produce IDENTICAL
 *                assertions blocks -- that diff IS the idempotency proof.
 *                ONLY stable scalars go in here. Anything whose value could
 *                differ between two consecutive post-destroy measurements (file
 *                lists, listener lists, timings) belongs in `observations`.
 * `observations`: true but naturally varying (listener lists, contexts).
 * `volatile`   : timestamps and anything else that must never be diffed.
 *
 * ============================ SCOPE POSITIVE CONTROL ====================
 *
 * `destroy_clean` was computed as "all four residual arrays are empty". An
 * empty array because NOTHING IS LEFT and an empty array because WE ASKED THE
 * WRONG QUESTION are indistinguishable, so a nonexistent label key or a
 * never-existed run_id both produced `destroy_clean: true, exit 0` -- a false
 * negative that would let the whole pipeline print a complete clean+IDEMPOTENT
 * evidence set while the environment was still alive.
 *
 * The fix is a POSITIVE CONTROL on the SELECTOR, not on the result: before a
 * post-destroy emptiness reading may be believed, the exact same
 * `<label-key>=<run-id>` scope must be on record as having SELECTED REAL
 * RESOURCES at least once. That record is an earlier evidence file for the same
 * run_id and the identical label_scope whose `destroy_clean` is FALSE.
 *
 *   --scope-proof establish  this measurement IS the calibration; it FAILS if
 *                            the scope selects nothing (used for --phase
 *                            pre-destroy, while the environment is alive).
 *   --scope-proof require    (DEFAULT, fail-closed) a calibration file must
 *                            already exist. A bare hand-typed invocation gets
 *                            this, so an unproven scope cannot exit 0.
 *   --scope-proof none       explicit opt-out. Recorded in the evidence, and
 *                            `destroy_clean_readable` reads false.
 *
 * The default is `require` on purpose: the failure mode this closes was found
 * by hand-typed direct invocation, so the protection has to live HERE and not
 * in the orchestrator.
 * ------------------------------------------------------------------------- */

const http = require('node:http');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const TOOL_ID = 'repro-spike-destroy-verifier';
const TOOL_VERSION = '1.1.0';
const SCHEMA = 'repro.spike.destroy-evidence/v1';
const SCOPE_PROOF_MODES = ['require', 'establish', 'none'];

/* --------------------------- CLI ---------------------------------------- */
function parseArgs(argv) {
  const out = {
    runId: null,
    socket: null,
    phase: 'unspecified',
    network: 'repro-spike-net',
    outDir: null,
    ports: [],
    foreign: [],
    label: 'repro.spike.env',
    // FAIL-CLOSED DEFAULT. See the SCOPE POSITIVE CONTROL section in the header.
    scopeProof: 'require'
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--run-id') out.runId = next();
    else if (a === '--socket') out.socket = next();
    else if (a === '--phase') out.phase = next();
    else if (a === '--network') out.network = next();
    else if (a === '--out-dir') out.outDir = next();
    else if (a === '--label-key') out.label = next();
    else if (a === '--ports') out.ports = next().split(',').map(Number).filter(Boolean);
    else if (a === '--foreign') out.foreign = next().split(',').filter(Boolean);
    else if (a === '--scope-proof') out.scopeProof = next();
    else throw new Error('unknown argument: ' + a);
  }
  if (!out.runId) throw new Error('--run-id is required');
  if (!out.socket) throw new Error('--socket is required (path to the docker socket to probe)');
  if (!out.outDir) throw new Error('--out-dir is required');
  if (SCOPE_PROOF_MODES.indexOf(out.scopeProof) < 0) {
    throw new Error(`--scope-proof must be one of ${SCOPE_PROOF_MODES.join('|')}`);
  }
  return out;
}

/* --------------------- scope positive control ---------------------------- */
// Look for an EARLIER evidence file that proves this exact selector once
// selected real resources. Matching is on all three of:
//   run_id           -> a never-existed run_id finds nothing;
//   label_scope      -> a nonexistent label key finds nothing (the full
//                       "<key>=<value>" string, so key and value are both
//                       pinned);
//   destroy_clean === false -> the scope actually SELECTED something.
// Anything less would be satisfied by the very emptiness it is meant to
// validate.
function findScopeCalibration(outDir, runId, scope) {
  const result = { searched_dir: outDir, readable: false, candidates_scanned: 0, matched: [] };
  let names;
  try {
    names = fs.readdirSync(outDir);
    result.readable = true;
  } catch (e) {
    result.error = e.message;
    return result;
  }
  names
    .filter((n) => n.indexOf('destroy-evidence-') === 0 && n.endsWith('.json'))
    .forEach((n) => {
      result.candidates_scanned += 1;
      let j;
      try {
        j = JSON.parse(fs.readFileSync(path.join(outDir, n), 'utf8'));
      } catch (e) {
        return;
      }
      const a = j && j.assertions;
      if (!a) return;
      if (j.run_id !== runId) return;
      if (j.label_scope !== scope) return;
      if (a.destroy_clean !== false) return;
      result.matched.push({
        file: n,
        phase: j.phase,
        residual_containers: (a.residual_containers || []).length,
        residual_volumes: (a.residual_volumes || []).length,
        residual_images: (a.residual_images || []).length
      });
    });
  return result;
}

/* --------------------- Docker Engine API over unix socket ---------------- */
function engine(socketPath, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { socketPath, path: urlPath, method: 'GET', headers: { Host: 'docker' } },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`engine ${urlPath} -> HTTP ${res.statusCode}: ${body.slice(0, 300)}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`engine ${urlPath} -> unparseable JSON: ${e.message}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('engine request timeout')));
    req.end();
  });
}

const f = (obj) => encodeURIComponent(JSON.stringify(obj));

/* --------------------- host-side TCP probe -------------------------------
 * THIS PROBE IS ITSELF A SIDE EFFECT, AND IT MUST SAY SO.
 *
 * The verifier opens a connection to EVERY published port in EVERY phase, by
 * design -- that is how it distinguishes "nothing is listening" from "something
 * still answers". During the canary-active phase the thing that answers is the
 * canary, so each probe was landing in the canary log as an anonymous accept
 * and being counted as an escaped side effect. Three phantom leaks per run,
 * from the measuring instrument.
 *
 * It is NOT fixable by filtering on the source address: host-origin traffic
 * arrives at the canary as the bridge gateway IP, and the host is precisely
 * where an MTP T12 loopback leak would come from. Excluding the gateway would
 * blind the mechanism to real leaks.
 *
 * So the probe identifies itself instead. It sends one marker-bearing payload
 * that is simultaneously:
 *   - a well-formed HTTP/1.1 request, so an HTTP canary port records it as an
 *     http_request whose path AND header carry the marker; and
 *   - raw bytes, so a raw-TCP canary port records the marker in the tcp_close
 *     payload.
 * Either way the marker shares a conn_id with the accept, and the coverage
 * evaluator excludes the whole connection for a NAMED reason and reports the
 * count. The marker namespace is distinct from the control probe's, so this can
 * never satisfy clause (i) by accident.
 *
 * The probe RESULT is still decided by the connect event alone, so
 * `assertions.published_ports` is unchanged in shape and value.
 */
function verifyProbeMarker(runId) {
  return `repro-verify-probe-${runId}`;
}

function verifyProbePayload(marker, host, port) {
  return (
    `GET /__repro_verify_probe__?marker=${marker} HTTP/1.1\r\n` +
    `Host: ${host}:${port}\r\n` +
    `User-Agent: ${TOOL_ID}/${TOOL_VERSION}\r\n` +
    `X-Repro-Verify-Probe: ${marker}\r\n` +
    'Connection: close\r\n' +
    '\r\n'
  );
}

function probePort(host, port, timeoutMs, marker) {
  return new Promise((resolve) => {
    const started = Date.now();
    const sock = new net.Socket();
    let settled = false;
    let announced = false;
    const done = (result, detail) => {
      if (settled) return;
      settled = true;
      resolve({ host, port, result, detail: detail || null, ms: Date.now() - started, announced });
    };
    sock.setTimeout(timeoutMs || 1500);
    sock.once('connect', () => {
      // `end(payload)` (not write+destroy): destroy() can discard bytes that
      // have not left the kernel buffer yet, which would leave the canary with
      // an UNMARKED accept -- the exact phantom leak this is closing.
      try {
        sock.end(verifyProbePayload(marker, host, port));
        announced = true;
      } catch (e) {
        sock.destroy();
      }
      done('accepted');
      // Give the peer a moment to read the marker, then guarantee teardown.
      setTimeout(() => sock.destroy(), 250);
    });
    sock.once('timeout', () => {
      done('timeout');
      sock.destroy();
    });
    sock.once('error', (e) => {
      done(e.code === 'ECONNREFUSED' ? 'refused' : 'error', e.code || e.message);
      sock.destroy();
    });
    sock.connect(port, host);
  });
}

/* --------------------- lsof loopback enumeration ------------------------- */
function enumerateListeners() {
  let raw;
  try {
    raw = execFileSync('lsof', ['-nP', '-iTCP', '-sTCP:LISTEN'], {
      encoding: 'utf8',
      timeout: 20000,
      maxBuffer: 8 * 1024 * 1024
    });
  } catch (e) {
    // lsof exits 1 when it has partial permission errors but still prints.
    raw = (e.stdout && e.stdout.toString()) || '';
    if (!raw) {
      return { ok: false, error: e.message, listeners: [], raw_line_count: 0 };
    }
  }
  const lines = raw.split('\n').filter((l) => l.trim() && !/^COMMAND\s/.test(l));
  const listeners = lines.map((line) => {
    const cols = line.split(/\s+/);
    const nameIdx = line.indexOf('(LISTEN)');
    const addr = cols[cols.length - 2] || '';
    const m = /^(.*):(\d+)$/.exec(addr);
    const address = m ? m[1] : addr;
    const port = m ? Number(m[2]) : null;
    return {
      command: cols[0] || null,
      pid: cols[1] ? Number(cols[1]) : null,
      user: cols[2] || null,
      type: cols[4] || null,
      address,
      port,
      is_loopback: address === '127.0.0.1' || address === '[::1]' || address === '::1',
      is_wildcard: address === '*' || address === '[::]',
      raw: nameIdx >= 0 ? line.trim() : line.trim()
    };
  });
  return { ok: true, listeners, raw_line_count: lines.length };
}

/* --------------------- docker contexts (blind-spot disclosure) ----------- */
function enumerateContexts(probedSocket) {
  try {
    const raw = execFileSync(
      'docker',
      ['context', 'ls', '--format', '{{.Name}}\t{{.DockerEndpoint}}\t{{.Current}}'],
      { encoding: 'utf8', timeout: 15000 }
    );
    return raw
      .split('\n')
      .filter(Boolean)
      .map((l) => {
        const [name, endpoint, current] = l.split('\t');
        const sock = (endpoint || '').replace(/^unix:\/\//, '');
        return {
          name,
          endpoint,
          current: current === 'true',
          probed_by_this_run: sock === probedSocket,
          socket_exists: sock ? fs.existsSync(sock) : false
        };
      });
  } catch (e) {
    return [{ error: 'could not enumerate docker contexts: ' + e.message }];
  }
}

/* --------------------------- main ---------------------------------------- */
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const listenersAtStart = enumerateListeners();

  const scope = `${args.label}=${args.runId}`;
  const engineErrors = [];
  const call = async (p, fallback) => {
    try {
      return await engine(args.socket, p);
    } catch (e) {
      engineErrors.push({ path: p, error: e.message });
      return fallback;
    }
  };

  // --- residual resources IN SCOPE (this is the destroy assertion) --------
  const containers = await call(`/containers/json?all=1&filters=${f({ label: [scope] })}`, null);
  const volumesResp = await call(`/volumes?filters=${f({ label: [scope] })}`, null);
  const networks = await call(`/networks?filters=${f({ label: [scope] })}`, null);
  const images = await call(`/images/json?filters=${f({ label: [scope] })}`, null);

  const residualContainers = (containers || []).map((c) => ({
    id: c.Id.slice(0, 12),
    names: c.Names,
    image: c.Image,
    state: c.State,
    status: c.Status
  }));
  const residualVolumes = ((volumesResp && volumesResp.Volumes) || []).map((v) => ({
    name: v.Name,
    driver: v.Driver
  }));
  const residualNetworks = (networks || []).map((n) => ({ id: n.Id.slice(0, 12), name: n.Name }));
  const residualImages = (images || []).map((i) => ({
    id: i.Id.slice(7, 19),
    tags: i.RepoTags || []
  }));

  // --- the long-lived network MUST still exist ---------------------------
  const allNetworks = await call('/networks', []);
  const persistent = (allNetworks || []).find((n) => n.Name === args.network) || null;

  // --- ANONYMOUS-VOLUME sweep --------------------------------------------
  // Anonymous volumes do NOT inherit compose labels, so a purely label-scoped
  // check is blind to them. We therefore also count dangling unlabeled volumes
  // and report the number. This cannot be turned into a hard assertion (the
  // foreign project owns dangling volumes too), so it is reported as an
  // observation with an explicit caveat rather than silently omitted.
  const allVolumes = await call('/volumes', null);
  const anonymousLike = (((allVolumes || {}).Volumes) || []).filter(
    (v) => /^[0-9a-f]{60,}$/.test(v.Name)
  );

  // --- FOREIGN ASSET PRESERVATION ----------------------------------------
  // Positive evidence that the label discipline held: destroy must NOT have
  // touched the other project's containers. This is the counterpart to the
  // residual check -- a destroy with a loose scope fails HERE.
  const allContainers = await call('/containers/json?all=1', []);
  const byName = {};
  (allContainers || []).forEach((c) =>
    (c.Names || []).forEach((n) => (byName[n.replace(/^\//, '')] = c))
  );
  const foreignStatus = args.foreign.map((name) => {
    const c = byName[name];
    return {
      name,
      present: Boolean(c),
      state: c ? c.State : null,
      status: c ? c.Status : null,
      preserved: Boolean(c) && c.State === 'running'
    };
  });

  // --- host-side port probes ---------------------------------------------
  const probeMarker = verifyProbeMarker(args.runId);
  const portProbes = [];
  for (const p of args.ports) {
    /* eslint-disable no-await-in-loop */
    portProbes.push(await probePort('127.0.0.1', p, 1500, probeMarker));
  }

  const listenersAtEnd = enumerateListeners();
  const finishedAt = new Date().toISOString();

  const spikePortHolders = args.ports.map((p) => {
    const hits = (listenersAtEnd.listeners || []).filter((l) => l.port === p);
    return {
      port: p,
      held: hits.length > 0,
      holders: hits.map((h) => ({ command: h.command, pid: h.pid, address: h.address }))
    };
  });

  const destroyClean =
    residualContainers.length === 0 &&
    residualVolumes.length === 0 &&
    residualNetworks.length === 0 &&
    residualImages.length === 0;

  // --- scope positive control ---------------------------------------------
  const calibration = findScopeCalibration(args.outDir, args.runId, scope);
  let scopeCalibrated;
  let scopeProofBasis;
  if (args.scopeProof === 'establish') {
    scopeCalibrated = destroyClean === false;
    scopeProofBasis = scopeCalibrated
      ? 'THIS measurement is the calibration: the scope selected live resources.'
      : 'FAILED to establish: the scope selected NOTHING while it was supposed to ' +
        'be measuring a live environment. Either the environment is not up, or the ' +
        'label key / run_id does not address it. An emptiness reading from this ' +
        'selector cannot be believed later.';
  } else if (args.scopeProof === 'none') {
    scopeCalibrated = false;
    scopeProofBasis =
      'Calibration explicitly waived (--scope-proof none). destroy_clean is NOT ' +
      'readable as evidence: an empty result cannot be told apart from a ' +
      'mis-addressed query.';
  } else {
    scopeCalibrated = calibration.matched.length > 0;
    scopeProofBasis = scopeCalibrated
      ? 'A prior evidence file for the identical run_id AND label_scope recorded ' +
        'destroy_clean=false, i.e. this selector is proven to select real resources.'
      : 'NO prior evidence file for this exact run_id + label_scope ever recorded ' +
        'destroy_clean=false. This selector has never been shown to select ' +
        'anything, so its emptiness proves nothing. Run --phase pre-destroy with ' +
        '--scope-proof establish while the environment is alive.';
  }
  const scopeProofOk = args.scopeProof === 'none' ? false : scopeCalibrated;

  const evidence = {
    schema: SCHEMA,
    produced_by: {
      tool: TOOL_ID,
      version: TOOL_VERSION,
      source: 'src/spike/infra/verify/verify.js',
      imports_destroy_module: false,
      shells_out_to_docker_cli_for_assertions: false,
      note:
        'Assertions come from the Docker Engine HTTP API over the unix socket, ' +
        'plus host TCP probes and lsof. The `docker` CLI is used only to list ' +
        'contexts, which is a disclosure field, not an assertion.'
    },
    run_id: args.runId,
    phase: args.phase,
    label_scope: scope,
    host: { hostname: os.hostname(), platform: os.platform(), node: process.version },

    /* ---- stable + comparable: THIS block is the idempotency diff -------- */
    assertions: {
      /* ---- scope positive control ------------------------------------------
       * ONLY stable scalars live here: the matched calibration FILE LIST goes
       * to observations, so the two post-destroy assertions blocks stay
       * byte-identical and the idempotency diff keeps working.
       */
      scope_proof_mode: args.scopeProof,
      scope_calibrated: scopeCalibrated,
      destroy_clean_readable: scopeProofOk,

      destroy_clean: destroyClean,
      residual_containers: residualContainers,
      residual_volumes: residualVolumes,
      residual_networks: residualNetworks,
      residual_images: residualImages,
      persistent_network_present: Boolean(persistent),
      persistent_network_name: args.network,
      foreign_assets_preserved: foreignStatus.every((x) => x.preserved),
      foreign_assets: foreignStatus,
      published_ports: portProbes.map((p) => ({ port: p.port, result: p.result })),
      engine_errors: engineErrors
    },

    /* ---- true but naturally varying ------------------------------------ */
    observations: {
      scope_calibration: {
        mode: args.scopeProof,
        calibrated: scopeCalibrated,
        basis: scopeProofBasis,
        searched_dir: calibration.searched_dir,
        dir_readable: calibration.readable,
        candidates_scanned: calibration.candidates_scanned,
        matched_calibration_files: calibration.matched,
        why_it_matters:
          'destroy_clean is computed from four EMPTY arrays. Empty-because-gone ' +
          'and empty-because-the-question-was-wrong are the same value. Without ' +
          'this control, a nonexistent label key and a never-existed run_id both ' +
          'returned destroy_clean=true, exit 0.'
      },
      verify_probe_marker: probeMarker,
      verify_probe_announced: portProbes.map((p) => ({ port: p.port, announced: p.announced })),
      why_the_probe_announces_itself:
        'Every probe below opens a real connection to a published port and would ' +
        'otherwise be recorded by the canary as an anonymous escaped side effect. ' +
        'It carries a marker in its own namespace so the coverage evaluator can ' +
        'subtract it BY IDENTITY. Filtering on the source address instead would ' +
        'blind the canary to host-origin (MTP T12) leaks.',
      spike_port_holders: spikePortHolders,
      anonymous_like_volumes_on_daemon: {
        count: anonymousLike.length,
        caveat:
          'Anonymous volumes do not inherit compose labels, so they are invisible ' +
          'to a label-scoped check. This count includes volumes owned by the ' +
          'foreign project and is therefore reported, not asserted. destroy.sh ' +
          'uses `docker rm -f -v` so anonymous volumes attached to in-scope ' +
          'containers are removed with them.'
      },
      loopback_listeners_at_start: (listenersAtStart.listeners || []).filter((l) => l.is_loopback),
      loopback_listeners_at_end: (listenersAtEnd.listeners || []).filter((l) => l.is_loopback),
      all_listeners_at_start: listenersAtStart.listeners || [],
      all_listeners_at_end: listenersAtEnd.listeners || [],
      lsof_ok: listenersAtStart.ok && listenersAtEnd.ok,
      why_listeners_are_recorded:
        "L2's egress allowlist includes loopback BY DESIGN, so MTP T12 " +
        '(destination resolving to loopback) is a known blind spot. Enumerating ' +
        'every listener at start and end turns that blind spot into dated ' +
        'evidence. On this host the hazard is live: the foreign project holds ' +
        '6379 and 5433, so a leaked WRITE to loopback could reach a real ' +
        'database instead of the canary -- THREAT-018 residual risk (b).'
    },

    /* ---- the honest gap ------------------------------------------------- */
    independence: {
      tool_layer: true,
      authority_layer: false,
      probed_socket: args.socket,
      docker_contexts: enumerateContexts(args.socket),
      proposition_proven:
        'Within the declared label scope, on ONE docker context, at the moment ' +
        'of measurement, no resource matching the scope exists.',
      proposition_NOT_proven:
        'That no path exists by which the original environment still lives. The ' +
        'source of truth is the same dockerd that destroy commands; resources ' +
        'surviving under a non-probed context are invisible to this tool. ' +
        'Closing this needs a provider-side inventory, which a local simulation ' +
        'does not have. Declared in Spec-Spike-Protocol §5.2 shortcut ledger.'
    },

    volatile: {
      started_at: startedAt,
      finished_at: finishedAt,
      port_probe_timings_ms: portProbes.map((p) => ({ port: p.port, ms: p.ms, detail: p.detail })),
      lsof_line_count_start: listenersAtStart.raw_line_count,
      lsof_line_count_end: listenersAtEnd.raw_line_count
    }
  };

  fs.mkdirSync(args.outDir, { recursive: true });
  const stamp = startedAt.replace(/[:.]/g, '-');
  const file = path.join(
    args.outDir,
    `destroy-evidence-${args.runId}-${args.phase}-${stamp}.json`
  );
  fs.writeFileSync(file, JSON.stringify(evidence, null, 2) + '\n', 'utf8');

  process.stderr.write(
    `[verify] ${file}\n` +
      `[verify] scope=${scope} scope_proof=${args.scopeProof} ` +
      `scope_calibrated=${scopeCalibrated}\n` +
      `[verify] destroy_clean=${destroyClean} readable=${scopeProofOk} ` +
      `persistent_network=${Boolean(persistent)} ` +
      `foreign_preserved=${foreignStatus.every((x) => x.preserved)}\n`
  );
  if (!scopeProofOk) {
    process.stderr.write('[verify] SCOPE NOT CALIBRATED — ' + scopeProofBasis + '\n');
  }
  process.stdout.write(file + '\n');

  // FAIL-CLOSED. Missing or negative evidence counts as NOT PASSING
  // (Spec-Spike-Protocol §4.6).
  //
  // 25 comes FIRST and deliberately: if the selector was never shown to select
  // anything, `destroy_clean` is not a result, it is an artefact of the
  // question. Reporting 0 in that state is the false negative this closes.
  if (!scopeProofOk) process.exitCode = 25;
  // In `establish` mode a NON-clean reading is the expected, correct outcome.
  else if (args.scopeProof !== 'establish' && !destroyClean) process.exitCode = 21;
  else if (!persistent) process.exitCode = 22;
  else if (!foreignStatus.every((x) => x.preserved)) process.exitCode = 23;
  else if (engineErrors.length) process.exitCode = 24;
}

main().catch((e) => {
  process.stderr.write('[verify] FATAL ' + e.stack + '\n');
  process.exit(1);
});
