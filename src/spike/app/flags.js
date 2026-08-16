'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Dependency #4: FEATURE FLAG. Client tự viết, đọc file JSON trỏ bởi
 * `SPIKE_FLAG_FILE`. KHÔNG dùng SaaS flag nào — bề mặt chặn do chính ta kiểm soát
 * (đúng đánh giá 🟢 của architect Q2 nhóm 5).
 *
 * File được đọc LẠI ở mỗi request (không cache trong process) để B3 luôn có một
 * đơn vị `feature-flag` thật để capture, và để đổi flag không cần restart.
 */

const fs = require('node:fs');
const { KIND } = require('./interaction-log');

/** Thứ tự CỐ ĐỊNH — dãy đơn vị phải ổn định giữa capture và replay. */
const FLAG_NAMES = Object.freeze(['checkout_discount_v2', 'night_surcharge']);

class FlagError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FlagError';
  }
}

/**
 * @param {string} flagFile
 * @returns {Record<string, boolean>}
 */
function readFlagFile(flagFile) {
  let raw;
  try {
    raw = fs.readFileSync(flagFile, 'utf8');
  } catch (error) {
    throw new FlagError(`Không đọc được SPIKE_FLAG_FILE "${flagFile}": ${error.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new FlagError(`SPIKE_FLAG_FILE "${flagFile}" không phải JSON hợp lệ: ${error.message}`);
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new FlagError(`SPIKE_FLAG_FILE "${flagFile}" phải là một JSON object phẳng`);
  }
  return parsed;
}

/**
 * Đọc toàn bộ flag đã biết và ghi MỖI flag thành một đơn vị `feature-flag`.
 * @param {import('./interaction-log').InteractionLog} log
 * @param {string} flagFile
 * @returns {Readonly<Record<string, boolean>>}
 */
function evaluateFlags(log, flagFile) {
  const parsed = readFlagFile(flagFile);
  const flags = {};

  for (const name of FLAG_NAMES) {
    const enabled = parsed[name] === true;
    flags[name] = enabled;
    log.record({
      kind: KIND.FEATURE_FLAG,
      target: name,
      args: { provider: 'spike-file-flags' },
      result: { enabled },
    });
  }

  return Object.freeze(flags);
}

module.exports = { FLAG_NAMES, FlagError, evaluateFlags };
