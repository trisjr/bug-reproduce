'use strict';

/**
 * ============================================================================
 *  B4 · src/spike/capsule/index.js
 *  CAPSULE WRITER & READER (P0-B / Wave 2.2)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *  ⛔  ĐÂY KHÔNG PHẢI CAPSULE FORMAT V1 (thuộc D5 của P1).
 *
 *  Nhiệm vụ:
 *    - Format tối thiểu, "tự chứa" đủ cho replay không cần external store.
 *    - Đọc/ghi qua `serializeArtifact()` / `parseArtifact()` của B0'.
 *    - 🆕 D-8: từ chối ghi nếu outDir không chứa `/capsules/` hoặc filename không kết thúc `.capsule`
 *      (để bảo đảm khớp .gitignore, chống lọt capsule vào git — THREAT-006).
 */

const fs = require('node:fs');
const path = require('node:path');
const {
  validateArtifact,
  serializeArtifact,
  parseArtifact,
} = require('../contract');

/**
 * Kiểm tra đường dẫn có thoả ràng buộc an toàn D-8 không.
 * @param {string} fullPath
 * @returns {boolean}
 */
function isSafeCapsulePath(fullPath) {
  const resolved = path.resolve(fullPath);
  const normalized = resolved.replace(/\\/g, '/');
  const hasCapsulesDir = normalized.includes('/capsules/') || normalized.endsWith('/capsules');
  const hasCapsuleExt = normalized.endsWith('.capsule') || normalized.endsWith('.capsule.json');
  return hasCapsulesDir && hasCapsuleExt;
}

/**
 * Ghi artifact thành file capsule.
 * @param {string} targetPath đường dẫn file đích (phải nằm trong thư mục /capsules/ và đuôi .capsule)
 * @param {object} artifact artifact hợp lệ theo schema B0'
 * @returns {string} đường dẫn file đã ghi
 */
function writeCapsule(targetPath, artifact) {
  if (!isSafeCapsulePath(targetPath)) {
    throw new Error(
      `D-8 VIOLATION: Từ chối ghi capsule vào "${targetPath}". ` +
      'Đường dẫn bắt buộc phải nằm trong thư mục có tên `capsules/` và kết thúc bằng `.capsule` ' +
      'để bảo đảm khớp quy tắc .gitignore và không lọt plaintext artifact vào git history.'
    );
  }

  const validation = validateArtifact(artifact);
  if (!validation.ok) {
    throw new Error(
      'writeCapsule: Artifact không hợp lệ theo schema contract: ' +
      validation.errors.join('; ')
    );
  }

  const dir = path.dirname(targetPath);
  fs.mkdirSync(dir, { recursive: true });

  const serialized = serializeArtifact(artifact);
  fs.writeFileSync(targetPath, serialized + '\n', 'utf8');
  return targetPath;
}

/**
 * Đọc và xác thực một capsule file.
 * @param {string} filePath
 * @returns {object} artifact đã parse và validate
 */
function readCapsule(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`readCapsule: File không tồn tại: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const artifact = parseArtifact(content);
  const validation = validateArtifact(artifact);
  if (!validation.ok) {
    throw new Error(
      `readCapsule: Capsule "${filePath}" không hợp lệ: ` + validation.errors.join('; ')
    );
  }

  return artifact;
}

/**
 * Trích xuất metadata tóm tắt của capsule để inspect.
 * @param {object} artifact
 * @returns {object}
 */
function inspectCapsule(artifact) {
  return {
    schema: artifact.schema,
    schemaVersion: artifact.schemaVersion,
    capsuleId: artifact.capsuleId,
    scenarioId: artifact.scenarioId,
    manifestCommitHash: artifact.manifestCommitHash || null,
    inClass: artifact.classAssessment ? artifact.classAssessment.inClass : null,
    mechanism: artifact.classAssessment ? artifact.classAssessment.mechanism : null,
    u0Target: artifact.u0 ? artifact.u0.target : null,
    interactionCount: Array.isArray(artifact.interactions) ? artifact.interactions.length : 0,
    uInfinity: artifact.uInfinity ? artifact.uInfinity.outcome : null,
    drift: artifact.drift || null,
  };
}

module.exports = {
  isSafeCapsulePath,
  writeCapsule,
  readCapsule,
  inspectCapsule,
};
