'use strict';

/*
 * ============================================================================
 *  B0 · src/spike/contract — SHARED SPIKE CONTRACT
 *  Schema artifact spike + module định danh dùng chung (`normalize()`/`identity()`)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3). Code này tồn tại để trả lời
 *      `RQ.md §39` — KHÔNG để tiến hoá thành V0.1.
 *  ⛔  KHÔNG phải capsule format v1. KHÔNG ràng buộc `D5`. KHÔNG đóng `U-01`/`U-02`.
 *  🏷️  Mọi quyết định trong thư mục này mang nhãn `HYPOTHESIS — cần validate`
 *      (`H-N*`, `H-I*`, `H-S*`) — xem `README.md` và header từng file.
 *
 *  BA CONSUMER (nghĩa vụ chi tiết ở `README.md` §3):
 *    · `B3` recorder      — GHI ra artifact đúng schema này, gồm khối `class_assessment`.
 *    · `B5` allowlist R3  — tra cứu entry READ bằng ĐÚNG `identity()` này.
 *    · `B6` rubric        — so sánh dãy đơn vị đã đi qua ĐÚNG `normalize()` này.
 *
 *  CommonJS, zero-dependency, chỉ built-in `node:*` — `src/spike/contract/` KHÔNG
 *  sở hữu `package.json` (thuộc `B1`), nên nó không được phép cần một cái.
 */

const normalizeMod = require('./normalize');
const identityMod = require('./identity');
const schemaMod = require('./schema');

module.exports = Object.freeze(
  Object.assign({}, normalizeMod, identityMod, schemaMod, {
    THROWAWAY: true,
    HYPOTHESIS_LABEL: 'HYPOTHESIS — cần validate',
    NOT_CAPSULE_FORMAT_V1: true,
    normalizeModule: normalizeMod,
    identityModule: identityMod,
    schemaModule: schemaMod,
  })
);
