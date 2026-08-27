'use strict';

/*
 * ============================================================================
 *  B0 · src/spike/contract/schema.js
 *  SCHEMA ARTIFACT SPIKE — `HYPOTHESIS`, spike-local
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec §0.3).
 *
 *  ⛔  ĐÂY KHÔNG PHẢI CAPSULE FORMAT v1.
 *      · `Timeline-Repro` dòng `B4` ghi thẳng: "Capsule writer tối thiểu —
 *        KHÔNG phải capsule format v1".
 *      · `ADR-002` đặc tả layout CỦA SẢN PHẨM và tự để **container format +
 *        encoding** ở dạng `TBD` (ADR-002 §Open items).
 *      · Đóng băng capsule format v1 là task `D5`, thuộc `P1`.
 *      ⇒ Schema dưới đây là một format SPIKE-LOCAL. Nó KHÔNG ràng buộc `D5`,
 *        KHÔNG lấn vào ô `TBD` của `ADR-002`, và KHÔNG được trích dẫn như một
 *        quyết định format.
 *
 *  Đây là format mà `B3` GHI RA và `B5`/`B6` ĐỌC VÀO.
 *
 *  HYPOTHESIS — cần validate · [inferred] · H-S1 (envelope)
 *    Container = MỘT object JSON duy nhất, encoding UTF-8, `JSON.stringify` của
 *    dạng canonical. Điểm yếu đã biết: toàn bộ artifact phải nằm gọn trong bộ
 *    nhớ; không stream được; không có chỗ cho binary blob. Đủ cho 10 scenario
 *    synthetic của `P0-B`, KHÔNG đủ cho sản phẩm — và đó chính là lý do `D5` tồn tại.
 *
 *  HYPOTHESIS — cần validate · [inferred] · H-S2 (đọc "6 field")
 *    Bản ghi `interaction` có ĐÚNG 6 field vào so sánh:
 *        kind · target · arguments · direction · result · ordinal
 *    `outcome` KHÔNG nằm trong 6 field đó — Spec §3.2 ghi `outcome` là
 *    "Chỉ ở `U∞`" ⇒ nó là field của NEO, không phải của bản ghi interaction.
 *    Cách đọc này khớp với `findings/architect.md` Q1: "schema bản ghi
 *    `interaction` 6 field + hai neo `U0`/`U∞`".
 *
 *  HYPOTHESIS — cần validate · [inferred] · H-S3 (neo là field riêng)
 *    `u0` và `uInfinity` là HAI FIELD RIÊNG của envelope, không phải hai phần tử
 *    đầu/cuối của `interactions[]`. Lý do: Spec §3.4 điều kiện 3 nói hai neo là
 *    "hai đơn vị mà rubric KHÔNG BAO GIỜ được phép bỏ qua" — tách field làm điều
 *    đó thành ràng buộc CẤU TRÚC thay vì một quy ước.
 *
 *  HYPOTHESIS — cần validate · [inferred] · H-S4 (biểu diễn `U∞`)
 *    `outcome` = `{ class: 'http-response' | 'exception', type: <string> }`,
 *    so bằng DANH TÍNH LOẠI. Stack trace KHÔNG có chỗ trong schema — cố ý, theo
 *    `ADR-006 A3` (Spec §3.1: "so bằng danh tính loại, KHÔNG so stack trace").
 *    Điểm yếu đã biết: `type` của một exception là tên class ở runtime; hai lỗi
 *    khác nhau cùng là `TypeError` sẽ khớp nhau.
 *
 *  HYPOTHESIS — cần validate · [inferred] · H-S5 (khối `class_assessment`)
 *    Hình dạng của khối `class_assessment` dưới đây là một ĐỀ XUẤT cơ chế cho
 *    `U-24`, KHÔNG phải câu trả lời của `U-24` (Spec §2.3 cảnh báo cuối, và
 *    §2.7 `E-F`: "khối `class_assessment` là đề xuất, chưa được validate").
 */

const {
  KINDS,
  DIRECTIONS,
  normalize,
  canonicalValue,
  canonicalJson,
} = require('./normalize');

const SCHEMA_ID = 'repro.spike.artifact';
/** Nhãn version cố tình KHÔNG phải `1` — để không ai đọc nhầm thành capsule format v1. */
const SCHEMA_VERSION = 'spike-0-HYPOTHESIS';

// ---------------------------------------------------------------------------
// class_assessment — Spec §2.6
// ---------------------------------------------------------------------------
/** Ba cơ chế phát hiện của Spec §2.3 + ô thứ tư "không cơ chế nào" (Spec §2.6). */
const ASSESSMENT_MECHANISMS = Object.freeze([
  'M-cap',
  'M-rep',
  'M-scope',
  'none-declaration', // "không cơ chế nào — kết luận đến từ LỜI KHAI" (Spec §2.6)
]);

const CLASS_CONDITIONS = Object.freeze(['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7']);

/**
 * Khối `class_assessment` — BẮT BUỘC có mặt trong mọi artifact.
 *
 * Spec §2.6 khối `CAUTION`: "KHÔNG có phương án capture im lặng" — một capsule
 * không mang đánh giá class "trông giống hệt capsule hợp lệ… sẽ được replay,
 * được chấm điểm, và được đưa vào một con số".
 *
 * Phân vai (Spec §2.6 · §3.5 · findings/architect.md Q5):
 *   · GHI khối này lúc capture         → `B3`
 *   · THI HÀNH cổng `inconclusive`     → `B6`
 *   · CHỖ ĐỂ NÓ TỒN TẠI trong schema   → `B0` (file này)
 *
 * @param {object} spec
 * @param {boolean|null} spec.inClass  true | false | null (= KHÔNG KIỂM ĐƯỢC).
 *        `null` là giá trị hợp lệ và có nghĩa: Spec §3.5 xử "KHÔNG, hoặc KHÔNG
 *        KIỂM ĐƯỢC" như nhau ở cổng tầng 1 ⇒ `B3` LUÔN ghi được một điều đúng sự thật.
 * @param {string[]} [spec.failedConditions] tập con của `S1`–`S7` không thoả.
 * @param {object|null} [spec.exclusionAxis]
 *        `{ axis: 1, group: '<tên nhóm §20.1>' }` hoặc
 *        `{ axis: 2, dependency: '<tên dependency>' }`
 * @param {string} spec.mechanism một trong `ASSESSMENT_MECHANISMS`.
 * @param {string} [spec.note]
 */
function makeClassAssessment(spec) {
  const s = spec || {};
  return {
    inClass: s.inClass === undefined ? null : s.inClass,
    failedConditions: Array.isArray(s.failedConditions) ? s.failedConditions.slice().sort() : [],
    exclusionAxis: s.exclusionAxis === undefined ? null : s.exclusionAxis,
    mechanism: s.mechanism,
    note: s.note === undefined ? null : s.note,
  };
}

function validateClassAssessment(block, errors, path) {
  if (block === undefined || block === null) {
    errors.push(
      path +
        ': THIẾU khối `class_assessment` — Spec §2.6 CAUTION: "KHÔNG có phương án capture im lặng". ' +
        'Artifact không mang đánh giá class là artifact KHÔNG HỢP LỆ.'
    );
    return;
  }
  if (typeof block !== 'object') {
    errors.push(path + ': `class_assessment` phải là object');
    return;
  }
  if (!(block.inClass === true || block.inClass === false || block.inClass === null)) {
    errors.push(
      path + '.inClass: phải là true | false | null (null = KHÔNG KIỂM ĐƯỢC, Spec §3.5)'
    );
  }
  if (!ASSESSMENT_MECHANISMS.includes(block.mechanism)) {
    errors.push(
      path +
        '.mechanism: phải là một trong ' +
        ASSESSMENT_MECHANISMS.join(' | ') +
        ' (Spec §2.6), got ' +
        JSON.stringify(block.mechanism)
    );
  }
  if (!Array.isArray(block.failedConditions)) {
    errors.push(path + '.failedConditions: phải là mảng');
  } else {
    for (const c of block.failedConditions) {
      if (!CLASS_CONDITIONS.includes(c)) {
        errors.push(path + '.failedConditions: "' + c + '" không thuộc S1–S7 (Spec §2.2)');
      }
    }
  }
  if (block.inClass === false) {
    const ax = block.exclusionAxis;
    const ok =
      ax &&
      typeof ax === 'object' &&
      ((ax.axis === 1 && typeof ax.group === 'string' && ax.group.length > 0) ||
        (ax.axis === 2 && typeof ax.dependency === 'string' && ax.dependency.length > 0));
    if (!ok) {
      errors.push(
        path +
          '.exclusionAxis: inClass=false thì BẮT BUỘC ghi trục loại trừ — ' +
          '{axis:1, group} (Spec §2.3) hoặc {axis:2, dependency} (Spec §2.4)'
      );
    }
    if (block.failedConditions.length === 0 && (!ax || ax.axis !== 2)) {
      errors.push(
        path + '.failedConditions: inClass=false theo trục 1 thì phải nêu điều kiện S1–S7 không thoả'
      );
    }
  }
}

// ---------------------------------------------------------------------------
// drift — Lớp cờ drift (Spec §3.6 bước 3 · MTP §7.1:527)
// ---------------------------------------------------------------------------
/**
 * Lớp cờ drift mang giá trị hai bên (capsule vs local) cho 4 trục:
 *   - gitCommit: Git commit hash / SHA
 *   - runtime: runtime metadata (Node.js version, platform...)
 *   - dependency: dependency lockfile / packages
 *   - schemaVersion: DB migration / schema version
 *
 * @param {object} spec
 */
function makeDriftFlags(spec) {
  const s = spec || {};
  function makeDriftEntry(entry) {
    if (!entry || typeof entry !== 'object') {
      return { capsule: null, local: null, drifted: false };
    }
    const cap = entry.capsule === undefined ? null : entry.capsule;
    const loc = entry.local === undefined ? null : entry.local;
    const drf =
      typeof entry.drifted === 'boolean'
        ? entry.drifted
        : cap !== null && loc !== null && cap !== loc;
    return {
      capsule: cap,
      local: loc,
      drifted: drf,
    };
  }
  return {
    gitCommit: makeDriftEntry(s.gitCommit),
    runtime: makeDriftEntry(s.runtime),
    dependency: makeDriftEntry(s.dependency),
    schemaVersion: makeDriftEntry(s.schemaVersion),
  };
}

// ---------------------------------------------------------------------------
// Đơn vị so sánh: interaction (6 field) + hai neo
// ---------------------------------------------------------------------------
/** 6 field VÀO SO SÁNH của bản ghi `interaction` (Spec §3.2 · H-S2). */
const INTERACTION_COMPARED_FIELDS = Object.freeze([
  'kind',
  'target',
  'arguments',
  'direction',
  'result',
  'ordinal',
]);

/** Slot KHÔNG vào so sánh — carrier cho `B3`/`B6`, neo: MTP §8.1 `B3-8`, Spec §3.3/§3.6. */
const INTERACTION_META_FIELDS = Object.freeze([
  'redactedFields', // redaction record của chính đơn vị (B3-8) — phép 4 + §3.6 bước 1
  'truncated', // cờ `truncated: true` tại điểm phân kỳ (B3-8) — §3.6 bước 2b
  'concurrencyGroup', // slot mang ranh giới nhóm đồng thời — `U-20` VẪN MỞ, §3.3
]);

/** Bản ghi `interaction` thô (chưa normalize). */
function makeInteraction(spec) {
  const s = spec || {};
  return {
    kind: s.kind,
    target: s.target === undefined ? null : s.target,
    method: s.method === undefined ? null : s.method, // chỉ dùng để dựng `target` HTTP
    arguments: s.arguments === undefined ? {} : s.arguments,
    direction: s.direction,
    result: s.result === undefined ? null : s.result,
    ordinal: s.ordinal === undefined ? null : s.ordinal,
    redactedFields: Array.isArray(s.redactedFields) ? s.redactedFields.slice() : [],
    truncated: s.truncated === true,
    concurrencyGroup: s.concurrencyGroup === undefined ? null : s.concurrencyGroup,
  };
}

/** Neo `U0` — inbound HTTP request đã chuẩn hoá (Spec §3.1). */
function makeU0(spec) {
  return makeInteraction(Object.assign({ direction: 'READ' }, spec, { kind: 'inbound-http' }));
}

/**
 * Neo `U∞` — kết cục (Spec §3.1). So bằng danh tính LOẠI.
 * @param {object} spec `{ class: 'http-response'|'exception', type, redactedFields?, truncated? }`
 */
const OUTCOME_CLASSES = Object.freeze(['http-response', 'exception']);

function makeUInfinity(spec) {
  const s = spec || {};
  return {
    anchor: 'U-INF',
    outcome: { class: s.class, type: s.type === undefined ? null : String(s.type) },
    redactedFields: Array.isArray(s.redactedFields) ? s.redactedFields.slice() : [],
    truncated: s.truncated === true,
  };
}

/** Danh tính loại của `U∞`, dạng chuỗi canonical. */
function outcomeIdentity(uInfinity) {
  if (!uInfinity || typeof uInfinity !== 'object' || !uInfinity.outcome) {
    throw new TypeError('outcomeIdentity: expected a U∞ anchor');
  }
  return uInfinity.outcome.class + ':' + uInfinity.outcome.type;
}

// ---------------------------------------------------------------------------
// Artifact
// ---------------------------------------------------------------------------
/**
 * @param {object} spec `{ capsuleId, scenarioId, classAssessment, u0, interactions, uInfinity }`
 * `capsuleId`/`scenarioId`: neo MTP §8.1 `B3-4`.
 */
function makeArtifact(spec) {
  const s = spec || {};
  return {
    schema: SCHEMA_ID,
    schemaVersion: SCHEMA_VERSION,
    notCapsuleFormatV1: true, // đọc được bằng mắt trong chính artifact
    capsuleId: s.capsuleId,
    scenarioId: s.scenarioId,
    manifestCommitHash: s.manifestCommitHash === undefined ? null : s.manifestCommitHash,
    classAssessment: s.classAssessment === undefined ? null : s.classAssessment,
    drift: s.drift === undefined ? null : s.drift,
    u0: s.u0 === undefined ? null : s.u0,
    interactions: Array.isArray(s.interactions) ? s.interactions.slice() : [],
    uInfinity: s.uInfinity === undefined ? null : s.uInfinity,
  };
}

/** Normalize toàn bộ artifact: bốn phép §3.2 áp cho `u0` và mọi `interaction`. */
function normalizeArtifact(artifact) {
  const a = artifact || {};
  return Object.assign({}, a, {
    u0: a.u0 ? normalize(a.u0) : null,
    interactions: (a.interactions || []).map(normalize),
    uInfinity: a.uInfinity || null,
  });
}

/**
 * Kiểm tra artifact có hợp lệ theo schema spike này không.
 * @returns {{ ok: boolean, errors: string[] }}
 *
 * ⛔ CỐ Ý FAIL khi thiếu `class_assessment` — đây là toàn bộ khả năng thực thi mà
 *    `B0` có thể cấp cho khối `CAUTION` của Spec §2.6. Một schema coi khối này là
 *    tuỳ chọn sẽ tự tay dựng lại "capture im lặng" theo cấu tạo.
 */
function validateArtifact(artifact) {
  const errors = [];
  const a = artifact;

  if (!a || typeof a !== 'object') {
    return { ok: false, errors: ['artifact: phải là object'] };
  }
  if (a.schema !== SCHEMA_ID) {
    errors.push('artifact.schema: phải là "' + SCHEMA_ID + '"');
  }
  for (const f of ['capsuleId', 'scenarioId']) {
    if (typeof a[f] !== 'string' || a[f].length === 0) {
      errors.push('artifact.' + f + ': bắt buộc, chuỗi không rỗng (MTP §8.1 B3-4)');
    }
  }
  if (a.manifestCommitHash !== undefined && a.manifestCommitHash !== null) {
    if (typeof a.manifestCommitHash !== 'string' || a.manifestCommitHash.length === 0) {
      errors.push('artifact.manifestCommitHash: phải là chuỗi commit hash hoặc null');
    }
  }

  if (a.drift !== undefined && a.drift !== null) {
    if (typeof a.drift !== 'object') {
      errors.push('artifact.drift: phải là object chứa cờ drift');
    }
  }

  validateClassAssessment(a.classAssessment, errors, 'artifact.classAssessment');

  if (!a.u0) {
    errors.push('artifact.u0: THIẾU neo `U0` (Spec §3.1 — neo luôn có mặt ở đầu dãy)');
  } else {
    validateUnit(a.u0, errors, 'artifact.u0');
    if (a.u0.kind !== 'inbound-http') {
      errors.push('artifact.u0.kind: neo `U0` phải là `inbound-http` (Spec §3.1)');
    }
  }

  if (!Array.isArray(a.interactions)) {
    errors.push('artifact.interactions: phải là mảng');
  } else {
    a.interactions.forEach((u, i) => validateUnit(u, errors, 'artifact.interactions[' + i + ']'));
  }

  if (!a.uInfinity) {
    errors.push('artifact.uInfinity: THIẾU neo `U∞` (Spec §3.1 — neo luôn có mặt ở cuối dãy)');
  } else if (!OUTCOME_CLASSES.includes(a.uInfinity.outcome && a.uInfinity.outcome.class)) {
    errors.push(
      'artifact.uInfinity.outcome.class: phải là ' +
        OUTCOME_CLASSES.join(' | ') +
        ' (Spec §3.1 — so bằng danh tính LOẠI)'
    );
  } else if (
    typeof a.uInfinity.outcome.type !== 'string' ||
    a.uInfinity.outcome.type.length === 0
  ) {
    errors.push('artifact.uInfinity.outcome.type: bắt buộc, chuỗi không rỗng');
  }

  return { ok: errors.length === 0, errors };
}

function validateUnit(unit, errors, path) {
  if (!unit || typeof unit !== 'object') {
    errors.push(path + ': phải là object');
    return;
  }
  if (!KINDS.includes(unit.kind)) {
    errors.push(path + '.kind: phải là ' + KINDS.join(' | ') + ' (Spec §3.2)');
  }
  if (!DIRECTIONS.includes(unit.direction)) {
    errors.push(
      path + '.direction: phải là READ | WRITE — fail-closed theo `ACG-09` + `ADR-005` (Spec §3.2)'
    );
  }
  if (unit.ordinal !== null && !Number.isInteger(unit.ordinal)) {
    errors.push(path + '.ordinal: phải là số nguyên hoặc null');
  }
  if (!Array.isArray(unit.redactedFields)) {
    errors.push(path + '.redactedFields: phải là mảng (MTP §8.1 B3-8)');
  }
  if (typeof unit.truncated !== 'boolean') {
    errors.push(path + '.truncated: phải là boolean (MTP §8.1 B3-8 — Spec §3.6 bước 2b)');
  }
  const NO_TARGET_ALLOWED = ['clock', 'stack-trace', 'git-commit', 'runtime-metadata'];
  if (!NO_TARGET_ALLOWED.includes(unit.kind) && (unit.target === null || unit.target === undefined)) {
    errors.push(
      path +
        '.target: đơn vị loại "' +
        unit.kind +
        '" BẮT BUỘC có target (chỉ ' +
        NO_TARGET_ALLOWED.join(', ') +
        ' được phép null, Spec §3.7)'
    );
  }
}

/** Serialize artifact ở dạng canonical (phép 3 áp cho cả envelope). */
function serializeArtifact(artifact) {
  return canonicalJson(canonicalValue(artifact));
}

function parseArtifact(text) {
  return JSON.parse(text);
}

module.exports = {
  SCHEMA_ID,
  SCHEMA_VERSION,
  ASSESSMENT_MECHANISMS,
  CLASS_CONDITIONS,
  OUTCOME_CLASSES,
  INTERACTION_COMPARED_FIELDS,
  INTERACTION_META_FIELDS,
  makeClassAssessment,
  makeDriftFlags,
  makeInteraction,
  makeU0,
  makeUInfinity,
  outcomeIdentity,
  makeArtifact,
  normalizeArtifact,
  validateArtifact,
  serializeArtifact,
  parseArtifact,
};
