'use strict';
/* ---------------------------------------------------------------------------
 * repro spike P0-B — B2 : CANARY SINK (network half)
 *
 * CT-1: CommonJS. Zero npm dependencies — node: built-ins only, so this file
 * never touches package.json (owned by worker B1).
 *
 * WHY THIS EXISTS (MTP-Spike-Phase-0 §5.1):
 *   After destroy, a LEAKED write and a BLOCKED write both surface as
 *   ECONNREFUSED. They are indistinguishable. Every safety claim of C1 is
 *   therefore meaningless without an independent observer sitting on the old
 *   address. This process is that observer.
 *
 * THIS IS THE SINGLE SOURCE OF TRUTH FOR `escaped_side_effects`.
 *   MTP §5.2 and Timeline B7-11 forbid deriving that metric from the replay
 *   runtime's own log: using the runtime to prove the runtime blocked
 *   something is circular — the dangerous cases are exactly the ones the
 *   runtime is blind to.
 *
 * IT LISTENS ON LOOPBACK TOO, ON PURPOSE (MTP §5.2, §5.4):
 *   L2's allowlist INCLUDES loopback by design, so T12 (destination resolving
 *   to loopback) is not blocked and would silently pass. A canary that does not
 *   hold loopback makes T12 blind.
 *
 * WHAT IS RECORDED, per MTP §5.2:
 *   - TCP accept log : every connection that touches us, including ones closed
 *                      immediately, including ones that send zero bytes.
 *   - HTTP log       : method, path, query, headers, body.
 *   (The DB sink is the other half — canary-db, a real Postgres with
 *    log_statement=all plus an INSERT-only audit table. See initdb/.)
 *
 * OUTPUT: NDJSON to CANARY_LOG_DIR. That directory is gitignored on purpose
 * (raw runtime data, may contain leaked payloads). The COMMITTED artifact is
 * the summary written by coverage/coverage.js into docs/035-QA/Evidence/.
 * ------------------------------------------------------------------------- */

const net = require('node:net');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const RUN_ID = process.env.SPIKE_RUN_ID || 'unknown-run';
const LOG_DIR = process.env.CANARY_LOG_DIR || '/canary-log';
const ROLE = process.env.CANARY_ROLE || 'net';

// "8080:http,8081:http,6379:tcp"
const SPEC = process.env.CANARY_PORTS || '8080:http,8081:http,6379:tcp';

// Which CT-3 DNS names this process claims via --network-alias. Recorded in
// every log line so the coverage evaluator can compute the covered set without
// guessing from container config.
const ALIASES = (process.env.CANARY_ALIASES || '').split(',').filter(Boolean);

fs.mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = path.join(LOG_DIR, `canary-${ROLE}-${RUN_ID}.ndjson`);
const stream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

let seq = 0;

function record(event) {
  seq += 1;
  const line = Object.assign(
    {
      schema: 'repro.spike.canary-event/v1',
      seq,
      ts: new Date().toISOString(),
      run_id: RUN_ID,
      canary_role: ROLE,
      canary_aliases: ALIASES,
      canary_host: os.hostname()
    },
    event
  );
  stream.write(JSON.stringify(line) + '\n');
  // stdout mirror so `docker logs` also carries it
  process.stdout.write(JSON.stringify(line) + '\n');
}

/* --- ORIGIN CLASSIFICATION ------------------------------------------------
 * Recorded on every accept so the coverage evaluator never has to GUESS which
 * connections the tooling made about itself.
 *
 * Inside this container there are exactly three possible peer shapes, and they
 * do not overlap:
 *
 *   127.0.0.1 / ::1   -> a process INSIDE THIS CONTAINER. The only such process
 *                        is the compose healthcheck (`node -e ...` execs into
 *                        this container's netns). It CANNOT be a leak from the
 *                        replay workload, which never runs in here.
 *   <gateway ip>      -> arrived through a PUBLISHED host port (docker-proxy
 *                        rewrites the source to the bridge gateway). This is
 *                        NOT self-evidently ours -- the host is exactly where a
 *                        T12 loopback leak would come from -- so it is
 *                        classified 'remote' and is only excluded when it
 *                        carries an explicit tooling marker.
 *   <other 10.x ip>   -> another container on the spike network. 'remote'.
 *
 * Deliberate non-rule: we do NOT exclude by gateway IP. Doing so would mask
 * every host-origin leak, which is the loosening this mechanism exists to
 * prevent.
 */
function originOf(addr) {
  if (typeof addr !== 'string' || !addr) return 'unknown';
  if (addr.indexOf('127.') === 0 || addr === '::1' || addr === '::ffff:127.0.0.1') {
    return 'canary-container-loopback';
  }
  return 'remote';
}

function peer(sock) {
  const addr = sock.remoteAddress || null;
  const origin = originOf(addr);
  return {
    remote_address: addr,
    remote_port: sock.remotePort || null,
    local_address: sock.localAddress || null,
    local_port: sock.localPort || null,
    is_loopback: origin === 'canary-container-loopback',
    origin,
    origin_note:
      origin === 'canary-container-loopback'
        ? 'source is a process inside the canary container itself (compose healthcheck); ' +
          'the replay workload never runs in here, so this can never be a leak'
        : 'source is outside this container; only excluded from escaped_side_effects ' +
          'when it carries an explicit tooling marker'
  };
}

/* --- raw TCP sink ---------------------------------------------------------
 * Records the ACCEPT itself. A connection that is opened and immediately
 * closed with zero bytes is still a side-effect attempt and still counts.
 */
function startTcp(port) {
  const server = net.createServer((sock) => {
    const id = `tcp-${port}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const origin = originOf(sock.remoteAddress);
    record({ kind: 'tcp_accept', port, conn_id: id, origin, peer: peer(sock) });

    const chunks = [];
    let bytes = 0;
    sock.on('data', (d) => {
      bytes += d.length;
      if (chunks.length < 32) chunks.push(d);
    });
    sock.on('close', () => {
      const buf = Buffer.concat(chunks);
      record({
        kind: 'tcp_close',
        port,
        conn_id: id,
        origin,
        bytes_received: bytes,
        payload_utf8: buf.toString('utf8').slice(0, 4096),
        payload_hex: buf.toString('hex').slice(0, 8192)
      });
    });
    sock.on('error', (e) => record({ kind: 'tcp_error', port, conn_id: id, error: e.message }));
    // Deliberately do not speak any protocol. We are a sink, not a service.
    // Holding the socket open lets the client's full payload arrive first.
    setTimeout(() => sock.destroy(), 1500);
  });
  server.on('error', (e) => {
    record({ kind: 'listen_error', port, mode: 'tcp', error: e.message });
    // FAIL-CLOSED: a canary that cannot bind is a canary that cannot observe.
    // Exiting non-zero makes canary_coverage: incomplete, per Spec §4.6.
    process.exitCode = 70;
    setTimeout(() => process.exit(70), 200);
  });
  server.listen(port, '0.0.0.0', () =>
    record({ kind: 'listening', port, mode: 'tcp', bind: '0.0.0.0' })
  );
  return server;
}

/* --- HTTP sink ----------------------------------------------------------- */
function startHttp(port) {
  const server = http.createServer((req, res) => {
    // Reuse the conn_id minted by the 'connection' handler below. Linking the
    // accept to the request matters for counting: the coverage evaluator
    // excludes EVERY event sharing a conn_id with a marked control-probe event.
    // Without the link, the control probe's own accepts would be counted as
    // escaped side effects and a clean run could never read 0.
    const id =
      req.socket.__canaryConnId ||
      `http-${port}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const chunks = [];
    let bytes = 0;
    req.on('data', (d) => {
      bytes += d.length;
      if (bytes <= 65536) chunks.push(d);
    });
    req.on('end', () => {
      let url;
      try {
        url = new URL(req.url, `http://${req.headers.host || 'canary'}`);
      } catch (e) {
        url = null;
      }
      record({
        kind: 'http_request',
        port,
        conn_id: id,
        origin: originOf(req.socket.remoteAddress),
        method: req.method,
        path: url ? url.pathname : req.url,
        query: url ? Object.fromEntries(url.searchParams.entries()) : {},
        raw_url: req.url,
        host_header: req.headers.host || null,
        headers: req.headers,
        body_bytes: bytes,
        body_utf8: Buffer.concat(chunks).toString('utf8').slice(0, 8192),
        peer: peer(req.socket)
      });
      res.writeHead(200, {
        'content-type': 'application/json',
        'x-repro-canary': 'sink',
        'x-repro-canary-run': RUN_ID
      });
      res.end(JSON.stringify({ canary: true, run_id: RUN_ID, recorded_as: id }) + '\n');
    });
  });
  // TCP-layer accept log for HTTP ports too: a bare connect that never sends a
  // request line would otherwise be invisible.
  server.on('connection', (sock) => {
    const id = `http-${port}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    sock.__canaryConnId = id;
    record({
      kind: 'tcp_accept',
      port,
      mode: 'http',
      conn_id: id,
      origin: originOf(sock.remoteAddress),
      peer: peer(sock)
    });
  });
  server.on('error', (e) => {
    record({ kind: 'listen_error', port, mode: 'http', error: e.message });
    process.exitCode = 70;
    setTimeout(() => process.exit(70), 200);
  });
  server.listen(port, '0.0.0.0', () =>
    record({ kind: 'listening', port, mode: 'http', bind: '0.0.0.0' })
  );
  return server;
}

const started = [];
SPEC.split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .forEach((entry) => {
    const parts = entry.split(':');
    const port = Number(parts[0]);
    const mode = (parts[1] || 'tcp').toLowerCase();
    if (!Number.isInteger(port) || port <= 0) {
      record({ kind: 'config_error', entry });
      return;
    }
    started.push(mode === 'http' ? startHttp(port) : startTcp(port));
  });

record({
  kind: 'canary_started',
  spec: SPEC,
  log_file: LOG_FILE,
  node_version: process.version,
  pid: process.pid
});

function shutdown(sig) {
  record({ kind: 'canary_stopping', signal: sig });
  started.forEach((s) => {
    try {
      s.close();
    } catch (e) {
      /* already closed */
    }
  });
  stream.end(() => process.exit(0));
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
