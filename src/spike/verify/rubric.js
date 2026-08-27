'use strict';

/**
 * ============================================================================
 *  B6 · src/spike/verify/rubric.js
 *  RUBRIC SO SÁNH NHỊ PHÂN TẦNG 2 (Spec-Spike-Protocol §3.4)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec §0.3).
 *
 *  BA ĐIỀU KIỆN CỦA VERDICT `Execution matched` (Spec §3.4):
 *  ---------------------------------------------------------
 *  1. Bằng độ dài: dãy đơn vị của production (expected) và của local (actual)
 *     có cùng số đơn vị sau normalization (một nhóm đồng thời tính là 1 đơn vị).
 *  2. Mọi đơn vị bằng nhau: với mọi vị trí i, đơn vị thứ i của hai bên bằng nhau
 *     trên toàn bộ tập 5 field (kind, target, arguments, direction, result),
 *     theo 3 quan hệ tương đương (Spec §3.3):
 *       - Nhóm đồng thời so như TẬP (set equality cho concurrencyGroup).
 *       - Marker tương đương marker (cho field đã redact).
 *       - Canonical form (cho target, arguments, result).
 *  3. Hai neo bằng nhau:
 *       - Neo U0 (inbound-http) bằng nhau trên 5 field.
 *       - Neo U∞ bằng nhau theo outcomeIdentity (danh tính LOẠI, không so stack trace).
 *
 *  Ngược lại: Verdict là `Execution diverged`, kèm First Divergence Point.
 */

const {
  normalize,
  normalizeArtifact,
  outcomeIdentity,
  INTERACTION_COMPARED_FIELDS,
} = require('../contract');

const RUBRIC_CONDITIONS = Object.freeze({
  LENGTH: 1,
  UNITS: 2,
  ANCHORS: 3,
});

const EXACT_COMPARED_FIELDS = Object.freeze([
  'kind',
  'target',
  'arguments',
  'direction',
  'result',
]);

/**
 * Gom nhóm dãy interactions đã normalize thành các "Đơn vị so sánh" (Units).
 * Một nhóm đồng thời (concurrencyGroup !== null) liên tiếp được gom thành 1 Unit.
 *
 * @param {Array<object>} interactions Danh sách interaction đã normalize
 * @returns {Array<object>} Danh sách units
 */
function groupInteractions(interactions) {
  if (!Array.isArray(interactions)) return [];

  const units = [];
  let currentGroup = null;

  for (let idx = 0; idx < interactions.length; idx++) {
    const raw = interactions[idx];
    const item = raw && typeof raw === 'object' && raw.kind ? raw : normalize(raw);
    const groupId = item.concurrencyGroup;

    if (groupId) {
      if (currentGroup && currentGroup.groupId === groupId) {
        currentGroup.interactions.push(item);
      } else {
        if (currentGroup) {
          units.push(currentGroup);
        }
        currentGroup = {
          type: 'concurrency-group',
          groupId: groupId,
          interactions: [item],
          ordinal: item.ordinal,
        };
      }
    } else {
      if (currentGroup) {
        units.push(currentGroup);
        currentGroup = null;
      }
      units.push({
        type: 'single',
        interaction: item,
        ordinal: item.ordinal,
      });
    }
  }

  if (currentGroup) {
    units.push(currentGroup);
  }

  return units;
}

/**
 * So sánh 2 single interaction records trên 5 field exact.
 *
 * @param {object} itemA
 * @param {object} itemB
 * @returns {{ matched: boolean, mismatchedFields: string[] }}
 */
function compareSingleItems(itemA, itemB) {
  const mismatchedFields = [];
  for (const field of EXACT_COMPARED_FIELDS) {
    const valA = itemA[field];
    const valB = itemB[field];
    if (valA !== valB) {
      mismatchedFields.push(field);
    }
  }
  return {
    matched: mismatchedFields.length === 0,
    mismatchedFields,
  };
}

/**
 * So sánh 2 Units (Single vs Single, hoặc ConcurrencyGroup vs ConcurrencyGroup).
 *
 * @param {object} expectedUnit
 * @param {object} actualUnit
 * @returns {{ matched: boolean, mismatchedFields: string[], reason?: string, expected?: object, actual?: object }}
 */
function compareUnits(expectedUnit, actualUnit) {
  if (!expectedUnit || !actualUnit) {
    return {
      matched: false,
      mismatchedFields: ['unit'],
      reason: 'Unit rỗng hoặc không xác định',
      expected: expectedUnit,
      actual: actualUnit,
    };
  }

  if (expectedUnit.type !== actualUnit.type) {
    return {
      matched: false,
      mismatchedFields: ['unitType'],
      reason: `Khác loại đơn vị: expected '${expectedUnit.type}' vs actual '${actualUnit.type}'`,
      expected: expectedUnit,
      actual: actualUnit,
    };
  }

  if (expectedUnit.type === 'single') {
    const cmp = compareSingleItems(expectedUnit.interaction, actualUnit.interaction);
    if (!cmp.matched) {
      return {
        matched: false,
        mismatchedFields: cmp.mismatchedFields,
        reason: `Mismatched fields [${cmp.mismatchedFields.join(', ')}] ở interaction ${expectedUnit.interaction.kind}`,
        expected: expectedUnit.interaction,
        actual: actualUnit.interaction,
      };
    }
    return { matched: true, mismatchedFields: [] };
  }

  if (expectedUnit.type === 'concurrency-group') {
    const expList = expectedUnit.interactions || [];
    const actList = actualUnit.interactions || [];

    if (expList.length !== actList.length) {
      return {
        matched: false,
        mismatchedFields: ['concurrencyGroupSize'],
        reason: `Số lượng interaction trong nhóm đồng thời '${expectedUnit.groupId}' không khớp: expected ${expList.length} vs actual ${actList.length}`,
        expected: expectedUnit,
        actual: actualUnit,
      };
    }

    // Set equality (multiset matching 1-1)
    const matchedActualIndices = new Set();

    for (let eIdx = 0; eIdx < expList.length; eIdx++) {
      const expItem = expList[eIdx];
      let foundMatch = false;

      for (let aIdx = 0; aIdx < actList.length; aIdx++) {
        if (matchedActualIndices.has(aIdx)) continue;
        const actItem = actList[aIdx];
        const cmp = compareSingleItems(expItem, actItem);
        if (cmp.matched) {
          matchedActualIndices.add(aIdx);
          foundMatch = true;
          break;
        }
      }

      if (!foundMatch) {
        return {
          matched: false,
          mismatchedFields: ['concurrencyGroupItems'],
          reason: `Interaction trong nhóm đồng thời '${expectedUnit.groupId}' không tìm thấy phần tử tương đương trong tập actual (Spec §3.3 Set Equality)`,
          expected: expItem,
          actual: actualUnit,
        };
      }
    }

    return { matched: true, mismatchedFields: [] };
  }

  return {
    matched: false,
    mismatchedFields: ['unknownType'],
    reason: `Loại unit không hợp lệ: ${expectedUnit.type}`,
  };
}

/**
 * Đánh giá Rubric So Sánh Nhị Phân Tầng 2 trên expectedArtifact và actualArtifact.
 *
 * @param {object} expectedArtifact Artifact đã capture ở production
 * @param {object} actualArtifact Artifact thu được lúc replay ở local
 * @param {object} [options]
 * @returns {{
 *   verdict: 'matched' | 'diverged',
 *   matched: boolean,
 *   conditionFailed?: number,
 *   firstDivergence?: {
 *     point: 'u0' | 'interaction' | 'length' | 'uInfinity',
 *     index: number,
 *     expectedUnit?: object,
 *     actualUnit?: object,
 *     mismatchedFields?: string[],
 *     reason: string,
 *     [key: string]: any
 *   },
 *   conditions?: { length: boolean, units: boolean, anchors: boolean },
 *   totalUnits?: number
 * }}
 */
function evaluateRubric(expectedArtifact, actualArtifact, options = {}) {
  if (!expectedArtifact || !actualArtifact) {
    return {
      verdict: 'diverged',
      matched: false,
      conditionFailed: RUBRIC_CONDITIONS.ANCHORS,
      firstDivergence: {
        point: 'u0',
        index: 0,
        reason: 'Thiếu expectedArtifact hoặc actualArtifact để so khớp',
      },
    };
  }

  const exp = normalizeArtifact(expectedArtifact);
  const act = normalizeArtifact(actualArtifact);

  // -------------------------------------------------------------------------
  // ĐIỀU KIỆN 3 (Phần 1): Neo U0 khớp nhau (Spec §3.1 · §3.4 đk 3)
  // -------------------------------------------------------------------------
  if (!exp.u0 || !act.u0) {
    return {
      verdict: 'diverged',
      matched: false,
      conditionFailed: RUBRIC_CONDITIONS.ANCHORS,
      firstDivergence: {
        point: 'u0',
        index: 0,
        expectedUnit: exp.u0 || null,
        actualUnit: act.u0 || null,
        mismatchedFields: ['u0'],
        reason: 'Neo U0 (inbound-http) bị thiếu ở một trong hai bên',
      },
    };
  }

  const u0Cmp = compareSingleItems(exp.u0, act.u0);
  if (!u0Cmp.matched) {
    return {
      verdict: 'diverged',
      matched: false,
      conditionFailed: RUBRIC_CONDITIONS.ANCHORS,
      firstDivergence: {
        point: 'u0',
        index: 0,
        expectedUnit: exp.u0,
        actualUnit: act.u0,
        mismatchedFields: u0Cmp.mismatchedFields,
        reason: `Neo U0 (inbound-http) không khớp trên các field [${u0Cmp.mismatchedFields.join(', ')}]`,
      },
    };
  }

  // -------------------------------------------------------------------------
  // ĐIỀU KIỆN 1 & 2: Gom nhóm units và so sánh từng unit (Spec §3.4 đk 1, đk 2)
  // -------------------------------------------------------------------------
  const expUnits = groupInteractions(exp.interactions || []);
  const actUnits = groupInteractions(act.interactions || []);

  const minLen = Math.min(expUnits.length, actUnits.length);

  // So sánh từng đơn vị cho tới minLen
  for (let i = 0; i < minLen; i++) {
    const cmp = compareUnits(expUnits[i], actUnits[i]);
    if (!cmp.matched) {
      return {
        verdict: 'diverged',
        matched: false,
        conditionFailed: RUBRIC_CONDITIONS.UNITS,
        firstDivergence: {
          point: 'interaction',
          index: i + 1, // 1-based index của unit phân kỳ
          expectedUnit: cmp.expected || expUnits[i],
          actualUnit: cmp.actual || actUnits[i],
          mismatchedFields: cmp.mismatchedFields,
          reason: cmp.reason || `Đơn vị thứ ${i + 1} không khớp trên [${cmp.mismatchedFields.join(', ')}]`,
        },
      };
    }
  }

  // ĐIỀU KIỆN 1: Bằng độ dài (Spec §3.4 đk 1)
  if (expUnits.length !== actUnits.length) {
    return {
      verdict: 'diverged',
      matched: false,
      conditionFailed: RUBRIC_CONDITIONS.LENGTH,
      firstDivergence: {
        point: 'length',
        index: minLen + 1,
        expectedUnitsCount: expUnits.length,
        actualUnitsCount: actUnits.length,
        expectedUnit: expUnits[minLen] || null,
        actualUnit: actUnits[minLen] || null,
        mismatchedFields: ['length'],
        reason: `Dãy đơn vị không bằng độ dài sau normalization: expected ${expUnits.length} units vs actual ${actUnits.length} units`,
      },
    };
  }

  // -------------------------------------------------------------------------
  // ĐIỀU KIỆN 3 (Phần 2): Neo U∞ khớp nhau theo outcomeIdentity (Spec §3.1 · §3.4 đk 3)
  // -------------------------------------------------------------------------
  if (!exp.uInfinity || !act.uInfinity) {
    return {
      verdict: 'diverged',
      matched: false,
      conditionFailed: RUBRIC_CONDITIONS.ANCHORS,
      firstDivergence: {
        point: 'uInfinity',
        index: expUnits.length + 2,
        expectedUnit: exp.uInfinity || null,
        actualUnit: act.uInfinity || null,
        mismatchedFields: ['uInfinity'],
        reason: 'Neo U∞ bị thiếu ở một trong hai bên',
      },
    };
  }

  const expOutcomeId = outcomeIdentity(exp.uInfinity);
  const actOutcomeId = outcomeIdentity(act.uInfinity);

  if (expOutcomeId !== actOutcomeId) {
    return {
      verdict: 'diverged',
      matched: false,
      conditionFailed: RUBRIC_CONDITIONS.ANCHORS,
      firstDivergence: {
        point: 'uInfinity',
        index: expUnits.length + 2,
        expectedOutcome: exp.uInfinity.outcome,
        actualOutcome: act.uInfinity.outcome,
        expectedIdentity: expOutcomeId,
        actualIdentity: actOutcomeId,
        mismatchedFields: ['outcomeIdentity'],
        reason: `Neo U∞ không khớp danh tính loại (Spec §3.1): expected '${expOutcomeId}' vs actual '${actOutcomeId}'`,
      },
    };
  }

  // -------------------------------------------------------------------------
  // THỎA MÃN 100% CẢ 3 ĐIỀU KIỆN -> VERDICT MATCHED
  // -------------------------------------------------------------------------
  return {
    verdict: 'matched',
    matched: true,
    conditions: {
      length: true,
      units: true,
      anchors: true,
    },
    totalUnits: expUnits.length,
  };
}

module.exports = {
  RUBRIC_CONDITIONS,
  EXACT_COMPARED_FIELDS,
  groupInteractions,
  compareSingleItems,
  compareUnits,
  evaluateRubric,
};
