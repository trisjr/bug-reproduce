'use strict';

/*
 * ============================================================================
 *  B0 · src/spike/contract/normalize.js
 *  BỐN PHÉP NORMALIZATION — tiêu thụ nguyên văn Spec-Spike-Protocol §3.2
 * ============================================================================
 *
 *  ⚠️  THROWAWAY. Toàn bộ code P0-B là throwaway (Spec §0.3). File này tồn tại
 *      để trả lời RQ.md §39, KHÔNG để tiến hoá thành V0.1.
 *
 *  Module này hiện thực ĐÚNG bốn phép của Spec §3.2 — không thêm phép thứ năm,
 *  không bỏ phép nào:
 *
 *    Phép 1 — SQL → fingerprint: literal thay bằng placeholder; khoảng trắng và
 *             chữ hoa/thường chuẩn hoá. Giá trị literal đi vào `arguments`,
 *             KHÔNG đi vào `target`.
 *    Phép 2 — URL → path template + canonical query: `/users/7731` → `/users/:id`;
 *             query string sắp thứ tự.
 *    Phép 3 — JSON → canonical form: key sắp thứ tự, khoảng trắng loại bỏ.
 *    Phép 4 — Field đã redact → marker: giá trị thật thay bằng một marker ổn định;
 *             hai bên so marker với marker.
 *
 *  ──────────────────────────────────────────────────────────────────────────
 *  ⛔  U-01 / U-02 KHÔNG ĐƯỢC ĐÓNG BỞI FILE NÀY.
 *      Spec §3.2 tự cảnh báo: "Phép 1 và 2 đứng trên `U-02` — rủi ro hiện thực
 *      cao nhất của cả thiết kế" (SDD-Repro §4.4: 4 phương án, chưa chọn cái nào).
 *      `U-01`/`U-02` thuộc `D3` của `P1`. `P0-B` KHÔNG có thẩm quyền đóng chúng.
 *      Việc file này chạy được KHÔNG phải bằng chứng `U-02` đã đóng.
 *  ──────────────────────────────────────────────────────────────────────────
 *
 *  HYPOTHESIS — cần validate · [inferred] · H-N1
 *    Heuristic fingerprint SQL dưới đây là một STAND-IN mức hypothesis cho `U-02`.
 *    Điểm yếu đã biết (bắt buộc theo Spec §1.2 quy tắc 3):
 *      · không xử lý dollar-quoted string (`$tag$ ... $tag$`) của PostgreSQL;
 *      · không tách comment `--` / `/* *\/` ra khỏi câu lệnh;
 *      · uppercase toàn bộ phần ngoài literal ⇒ quoted identifier phân biệt hoa
 *        thường ("Foo" vs "foo") bị trộn thành một;
 *      · không phân biệt được hai câu lệnh chỉ khác nhau ở literal đã bị placeholder
 *        hoá — đúng bản chất của fingerprint, nhưng nó là một LỰA CHỌN, không phải
 *        một sự thật.
 *
 *  HYPOTHESIS — cần validate · [inferred] · H-N2
 *    Heuristic path template: một segment được coi là biến khi nó toàn chữ số,
 *    hoặc là UUID, hoặc là chuỗi hex >= 16 ký tự. Điểm yếu đã biết: slug dạng
 *    `/orders/abc-123` KHÔNG được template hoá ⇒ hai execution khác id sẽ cho hai
 *    `target` khác nhau; ngược lại một segment tĩnh toàn số (`/v1/2024/report`)
 *    sẽ bị template hoá nhầm.
 *
 *  HYPOTHESIS — cần validate · [inferred] · H-N4
 *    Marker redaction là một hằng chuỗi ổn định. Điểm yếu đã biết: marker nằm
 *    trong cùng không gian giá trị với dữ liệu thật ⇒ một giá trị thật trùng
 *    chuỗi marker sẽ được coi là "đã redact". Spike chấp nhận; sản phẩm không nên.
 */

const REDACTION_MARKER = '<<REPRO_REDACTED>>';
const SQL_LITERAL_PLACEHOLDER = '?';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALL_DIGITS_RE = /^\d+$/;
const LONG_HEX_RE = /^[0-9a-f]{16,}$/i;

// ---------------------------------------------------------------------------
// PHÉP 1 — SQL → fingerprint  (Spec §3.2 phép 1)
// ---------------------------------------------------------------------------
/**
 * @param {string} sql câu lệnh SQL thô
 * @returns {{ target: string, literals: Array<string|number> }}
 *          `target` = fingerprint (KHÔNG chứa literal).
 *          `literals` = các giá trị literal đã bị bóc ra, để đi vào `arguments`.
 *
 * Placeholder dùng `?` chứ không dùng `$n`, để KHÔNG va vào bind parameter `$1`,
 * `$2` mà driver `pg` đã đặt sẵn trong câu lệnh — những bind param đó được GIỮ
 * NGUYÊN vì chúng vốn đã là placeholder.
 */
function sqlFingerprint(sql) {
  if (typeof sql !== 'string') {
    throw new TypeError('sqlFingerprint: expected string, got ' + typeof sql);
  }

  const literals = [];

  // 1a+1b. Bóc string literal VÀ numeric literal trong MỘT LƯỢT QUÉT TRÁI→PHẢI,
  //        để `literals` giữ đúng THỨ TỰ XUẤT HIỆN trong câu lệnh.
  //        Bóc hai loại bằng hai lượt riêng là SAI: `WHERE a = 1 AND b = 'x'` và
  //        `WHERE a = 'x' AND b = 1` sẽ cho cùng fingerprint VÀ cùng mảng literal
  //        ⇒ hai câu lệnh khác nhau bị coi là một. Bug này đã bị self-check bắt.
  //        Numeric KHÔNG chạm `$1` (bind param) vì `$` bị loại khỏi lớp ký tự đứng trước.
  const LITERAL_RE = /('(?:[^']|'')*')|(^|[^\w$.])(-?\d+(?:\.\d+)?)\b/g;
  let out = sql.replace(LITERAL_RE, (m, str, pre, num) => {
    if (str !== undefined) {
      literals.push(str.slice(1, -1).replace(/''/g, "'"));
      return SQL_LITERAL_PLACEHOLDER;
    }
    literals.push(Number(num));
    return pre + SQL_LITERAL_PLACEHOLDER;
  });

  // 1c. Chuẩn hoá khoảng trắng + chữ hoa/thường.
  out = out.replace(/\s+/g, ' ').trim().toUpperCase();

  return { target: out, literals };
}

// ---------------------------------------------------------------------------
// PHÉP 2 — URL → path template + canonical query  (Spec §3.2 phép 2)
// ---------------------------------------------------------------------------
function isVariableSegment(seg) {
  return ALL_DIGITS_RE.test(seg) || UUID_RE.test(seg) || LONG_HEX_RE.test(seg);
}

/**
 * @param {string} rawUrl URL tuyệt đối hoặc path tương đối
 * @returns {{ target: string, query: Object }}
 *          `target` = (origin nếu URL tuyệt đối) + path đã template hoá.
 *          `query`  = object đã sắp thứ tự key.
 */
function urlTemplate(rawUrl) {
  if (typeof rawUrl !== 'string') {
    throw new TypeError('urlTemplate: expected string, got ' + typeof rawUrl);
  }

  const RELATIVE_BASE = 'http://relative.invalid';
  const isAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(rawUrl);
  const parsed = new URL(rawUrl, RELATIVE_BASE);

  const templatedPath =
    parsed.pathname
      .split('/')
      .map((seg) => (seg !== '' && isVariableSegment(seg) ? ':id' : seg))
      .join('/') || '/';

  // Query sắp thứ tự key (và thứ tự value trong cùng một key).
  const query = {};
  const keys = [...new Set([...parsed.searchParams.keys()])].sort();
  for (const k of keys) {
    const values = parsed.searchParams.getAll(k).slice().sort();
    query[k] = values.length === 1 ? values[0] : values;
  }

  const target = isAbsolute ? parsed.origin + templatedPath : templatedPath;
  return { target, query };
}

// ---------------------------------------------------------------------------
// PHÉP 3 — JSON → canonical form  (Spec §3.2 phép 3)
// ---------------------------------------------------------------------------
/** Sắp thứ tự key đệ quy. Mảng GIỮ NGUYÊN thứ tự (mảng là dữ liệu, không phải map). */
function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value).sort()) out[k] = canonicalValue(value[k]);
    return out;
  }
  return value;
}

/** @returns {string} JSON không khoảng trắng, key đã sắp thứ tự. */
function canonicalJson(value) {
  return JSON.stringify(canonicalValue(value) === undefined ? null : canonicalValue(value));
}

// ---------------------------------------------------------------------------
// PHÉP 4 — Field đã redact → marker  (Spec §3.2 phép 4)
// ---------------------------------------------------------------------------
/**
 * Thay giá trị của các field đã redact bằng marker ổn định.
 * @param {*} value       giá trị (thường là object)
 * @param {string[]} redactedFields  danh sách path dạng `a.b.c` (đọc từ redaction
 *                                   record của capsule — MTP §8.1 `B3-8`)
 */
function applyRedactionMarkers(value, redactedFields) {
  if (!Array.isArray(redactedFields) || redactedFields.length === 0) return value;
  const clone = JSON.parse(JSON.stringify(value === undefined ? null : value));
  for (const path of redactedFields) {
    const parts = String(path).split('.');
    let node = clone;
    for (let i = 0; i < parts.length - 1; i += 1) {
      if (node === null || typeof node !== 'object') { node = null; break; }
      node = node[parts[i]];
    }
    const leaf = parts[parts.length - 1];
    if (node !== null && typeof node === 'object' && leaf in node) {
      node[leaf] = REDACTION_MARKER;
    }
  }
  return clone;
}

/** Quan hệ tương đương "marker tương đương marker" (Spec §3.3 hàng 2). */
function isRedactionMarker(value) {
  return value === REDACTION_MARKER;
}

// ---------------------------------------------------------------------------
// normalize(unit) — áp bốn phép trên MỘT đơn vị so sánh
// ---------------------------------------------------------------------------
/*
 *  HYPOTHESIS — cần validate · [inferred] · H-N5
 *    Ánh xạ "phép nào áp cho field nào" dưới đây KHÔNG có trong Spec §3.2 —
 *    Spec liệt kê bốn phép, không nói phép nào chạy trên field nào của kind nào.
 *    Ánh xạ này là phần module này thêm vào:
 *      · kind = 'db-query'                  → phép 1 trên `target`; literal bóc
 *                                             ra nhập vào `arguments.sqlLiterals`
 *      · kind = 'inbound-http'|'outbound-http' → phép 2 trên `target`; query
 *                                             canonical nhập vào `arguments.query`
 *      · kind = 'feature-flag'              → `target` chỉ trim (tên flag)
 *      · kind = 'clock'                     → `target` = null (Spec §3.7 hàng 2
 *                                             để trống ô target của đơn vị clock)
 *      · mọi kind                           → phép 4 rồi phép 3 trên `arguments`
 *                                             và `result`
 *    Điểm yếu đã biết: phép 4 chạy TRƯỚC phép 3 là một lựa chọn thứ tự; nếu
 *    redaction record dùng path tính trên dạng canonical thì thứ tự này sai.
 */
const KINDS = Object.freeze([
  'inbound-http',
  'db-query',
  'outbound-http',
  'feature-flag',
  'clock',
  'stack-trace',
  'git-commit',
  'runtime-metadata',
]);

const DIRECTIONS = Object.freeze(['READ', 'WRITE']);

function normalize(unit) {
  if (!unit || typeof unit !== 'object') {
    throw new TypeError('normalize: expected an object unit');
  }

  const kind = String(unit.kind || '').trim().toLowerCase();
  if (!KINDS.includes(kind)) {
    throw new RangeError(
      'normalize: unknown kind "' + unit.kind + '" (Spec §3.2 cho phép: ' + KINDS.join(', ') + ')'
    );
  }

  const redactedFields = Array.isArray(unit.redactedFields) ? unit.redactedFields.slice().sort() : [];
  const rawArgs =
    unit.arguments === undefined || unit.arguments === null ? {} : unit.arguments;

  let target = null;
  let extraArgs = {};

  if (kind === 'db-query') {
    const fp = sqlFingerprint(String(unit.target ?? ''));
    target = fp.target;
    if (fp.literals.length > 0) extraArgs.sqlLiterals = fp.literals;
  } else if (kind === 'inbound-http' || kind === 'outbound-http') {
    const method = unit.method ? String(unit.method).trim().toUpperCase() + ' ' : '';
    const t = urlTemplate(String(unit.target ?? ''));
    target = method + t.target;
    if (Object.keys(t.query).length > 0) extraArgs.query = t.query;
  } else if (kind === 'feature-flag') {
    target = String(unit.target ?? '').trim();
  } else if (kind === 'stack-trace' || kind === 'git-commit' || kind === 'runtime-metadata') {
    target = unit.target === undefined || unit.target === null ? null : String(unit.target).trim();
  } else {
    // kind === 'clock' — không có target (Spec §3.7, hàng `I1`).
    target = null;
  }

  const mergedArgs =
    typeof rawArgs === 'object' && !Array.isArray(rawArgs)
      ? Object.assign({}, rawArgs, extraArgs)
      : { value: rawArgs, ...extraArgs };

  const direction = String(unit.direction || '').trim().toUpperCase();
  if (!DIRECTIONS.includes(direction)) {
    throw new RangeError(
      'normalize: direction phải là READ|WRITE (fail-closed, Spec §3.2 / ADR-005), got ' +
        JSON.stringify(unit.direction)
    );
  }

  return Object.freeze({
    kind,
    target,
    arguments: canonicalJson(applyRedactionMarkers(mergedArgs, redactedFields)),
    direction,
    result: canonicalJson(
      applyRedactionMarkers(unit.result === undefined ? null : unit.result, redactedFields)
    ),
    ordinal: unit.ordinal === undefined || unit.ordinal === null ? null : Number(unit.ordinal),
    // ---- slot KHÔNG vào so sánh (Spec §3.2 bảng dưới) --------------------
    redactedFields: Object.freeze(redactedFields),
    truncated: unit.truncated === true,
    concurrencyGroup:
      unit.concurrencyGroup === undefined || unit.concurrencyGroup === null
        ? null
        : String(unit.concurrencyGroup),
  });
}

/**
 * Hàm thuần derive `direction` ('READ'|'WRITE') từ `kind` và `target`.
 * Dùng chung cho B3 (capture) và B5 (replay) — D-3.
 * @param {string} kind
 * @param {string|null} [target]
 * @returns {'READ'|'WRITE'}
 */
function directionOf(kind, target) {
  if (!kind) {
    throw new TypeError('directionOf: kind is required');
  }
  const k = String(kind).trim().toLowerCase();
  if (!KINDS.includes(k)) {
    throw new RangeError(
      'directionOf: unknown kind "' + kind + '" (Spec §3.2 cho phép: ' + KINDS.join(', ') + ')'
    );
  }

  if (
    k === 'inbound-http' ||
    k === 'clock' ||
    k === 'feature-flag' ||
    k === 'stack-trace' ||
    k === 'git-commit' ||
    k === 'runtime-metadata'
  ) {
    return 'READ';
  }

  if (k === 'outbound-http') {
    const t = String(target || '').trim();
    const method = t.split(/\s+/)[0]?.toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      return 'WRITE';
    }
    return 'READ';
  }

  if (k === 'db-query') {
    const t = String(target || '').trim();
    // Bỏ comment và whitespace ở đầu SQL
    const clean = t.replace(/^\s*(?:\/\*[\s\S]*?\*\/|--[^\r\n]*[\r\n]+)\s*/g, '').trim();
    const firstWord = clean.split(/\s+/)[0]?.toUpperCase();
    if (['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TRUNCATE'].includes(firstWord)) {
      return 'WRITE';
    }
    return 'READ';
  }

  return 'READ';
}

module.exports = {
  REDACTION_MARKER,
  SQL_LITERAL_PLACEHOLDER,
  KINDS,
  DIRECTIONS,
  sqlFingerprint,
  urlTemplate,
  canonicalValue,
  canonicalJson,
  applyRedactionMarkers,
  isRedactionMarker,
  normalize,
  directionOf,
};
