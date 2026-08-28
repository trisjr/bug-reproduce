/**
 * Repro Manifest Schema Validator v1
 * Specification: ADR-002, ADR-012, SDD-Repro §4.2
 */

import type {
  ReproManifest,
  CapsuleManifestV1,
  TriggerReason,
  ClassAssessment,
  EncryptionMetadata,
  PayloadDigest,
  RedactionSummary,
  EnvironmentMetadata,
  ManifestMetadata,
} from '../types/manifest.ts';

export class ManifestValidationError extends Error {
  public readonly errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = 'ManifestValidationError';
    this.errors = errors;
  }
}

export interface ManifestValidationResult {
  valid: boolean;
  errors: string[];
  manifest?: ReproManifest;
}

/**
 * Validates whether an unknown object conforms to ReproManifest v1.
 */
export function validateManifest(data: unknown): ManifestValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      valid: false,
      errors: ['Manifest must be a non-null JSON object.'],
    };
  }

  const record = data as Record<string, unknown>;

  // 1. format_version
  const formatVersion = record.format_version;
  if (formatVersion === undefined || formatVersion === null) {
    errors.push("Missing required field 'format_version'.");
  } else if (formatVersion !== '1.0.0' && formatVersion !== '1' && formatVersion !== 1) {
    errors.push(
      `Unsupported format_version '${String(formatVersion)}'. Supported versions: '1.0.0' (v1).`
    );
  }

  // 2. capsule_id (UUIDv7 or valid string identifier)
  if (!record.capsule_id || typeof record.capsule_id !== 'string') {
    errors.push("Missing or invalid 'capsule_id'. Must be a non-empty string identifier.");
  }

  // 3. created_at (ISO-8601 UTC)
  if (!record.created_at || typeof record.created_at !== 'string') {
    errors.push("Missing or invalid 'created_at'. Must be an ISO-8601 timestamp string.");
  } else if (Number.isNaN(Date.parse(record.created_at))) {
    errors.push("Field 'created_at' is not a valid ISO-8601 date string.");
  }

  // 4. app_name / service
  const appName = record.app_name ?? record.service ?? record.service_name;
  if (!appName || typeof appName !== 'string') {
    errors.push("Missing or invalid 'app_name' (or 'service'). Must be a non-empty string.");
  }

  // 5. app_version
  if (record.app_version !== undefined && typeof record.app_version !== 'string') {
    errors.push("Field 'app_version' must be a string if provided.");
  }

  // 6. target_commit
  if (record.target_commit !== undefined && typeof record.target_commit !== 'string') {
    errors.push("Field 'target_commit' must be a string Git SHA if provided.");
  }

  // 7. trigger_reason
  const triggerReason = record.trigger_reason as Record<string, unknown> | undefined;
  if (!triggerReason || typeof triggerReason !== 'object') {
    errors.push("Missing or invalid 'trigger_reason'. Must be an object.");
  } else {
    if (!triggerReason.type || typeof triggerReason.type !== 'string') {
      errors.push("Field 'trigger_reason.type' must be a non-empty string.");
    }
    if (!triggerReason.error_name || typeof triggerReason.error_name !== 'string') {
      errors.push("Field 'trigger_reason.error_name' must be a string.");
    }
    if (!triggerReason.error_message || typeof triggerReason.error_message !== 'string') {
      errors.push("Field 'trigger_reason.error_message' must be a string.");
    }
  }

  // 8. class_assessment
  const classAssessment = record.class_assessment as Record<string, unknown> | undefined;
  if (!classAssessment || typeof classAssessment !== 'object') {
    errors.push("Missing or invalid 'class_assessment'. Must be an object.");
  } else {
    if (typeof classAssessment.is_supported_class !== 'boolean') {
      errors.push("Field 'class_assessment.is_supported_class' must be a boolean.");
    }
  }

  // 9. encryption_metadata / key_reference
  const encMeta = (record.encryption_metadata ?? record.key_reference) as Record<string, unknown> | undefined;
  if (!encMeta || typeof encMeta !== 'object') {
    errors.push("Missing or invalid 'encryption_metadata' (or 'key_reference'). Must be an object.");
  } else {
    if (encMeta.algorithm && encMeta.algorithm !== 'AES-256-GCM') {
      errors.push(`Unsupported encryption algorithm '${String(encMeta.algorithm)}'. Expected 'AES-256-GCM'.`);
    }
    if (!encMeta.key_id || typeof encMeta.key_id !== 'string') {
      errors.push("Field 'encryption_metadata.key_id' must be a non-empty string.");
    }
    if (!encMeta.custody_endpoint || typeof encMeta.custody_endpoint !== 'string') {
      errors.push("Field 'encryption_metadata.custody_endpoint' must be a valid URI string.");
    }
    if (encMeta.iv !== undefined && typeof encMeta.iv !== 'string') {
      errors.push("Field 'encryption_metadata.iv' must be a Base64 string if provided.");
    }
    if (encMeta.auth_tag !== undefined && typeof encMeta.auth_tag !== 'string') {
      errors.push("Field 'encryption_metadata.auth_tag' must be a Base64 string if provided.");
    }
  }

  // 10. integrity / payload_digest
  const integrity = (record.integrity ?? record.payload_digest) as Record<string, unknown> | undefined;
  if (!integrity || typeof integrity !== 'object') {
    errors.push("Missing or invalid 'integrity' (or 'payload_digest'). Must be an object.");
  } else {
    const hmac = integrity.payload_hmac_sha256 ?? integrity.payload_hmac;
    if (!hmac || typeof hmac !== 'string') {
      errors.push("Field 'integrity.payload_hmac_sha256' must be a non-empty SHA-256/HMAC hex string.");
    }
    if (typeof integrity.compressed_byte_size !== 'number' || integrity.compressed_byte_size < 0) {
      errors.push("Field 'integrity.compressed_byte_size' must be a non-negative number.");
    }
    if (typeof integrity.uncompressed_byte_size !== 'number' || integrity.uncompressed_byte_size < 0) {
      errors.push("Field 'integrity.uncompressed_byte_size' must be a non-negative number.");
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  // Normalized manifest
  const normalizedManifest: ReproManifest = {
    format_version: '1.0.0',
    capsule_id: record.capsule_id as string,
    created_at: record.created_at as string,
    app_name: (record.app_name ?? record.service ?? record.service_name) as string,
    app_version: (record.app_version as string) ?? '0.1.0',
    target_commit: (record.target_commit as string) ?? '0000000000000000000000000000000000000000',
    is_derived_sanitized: Boolean(record.is_derived_sanitized),
    trigger_reason: record.trigger_reason as TriggerReason,
    class_assessment: record.class_assessment as ClassAssessment,
    encryption_metadata: {
      algorithm: 'AES-256-GCM',
      key_id: (encMeta?.key_id as string) ?? '',
      custody_endpoint: (encMeta?.custody_endpoint as string) ?? '',
      iv: (encMeta?.iv as string) ?? '',
      auth_tag: (encMeta?.auth_tag as string) ?? '',
    },
    integrity: {
      algorithm: 'HMAC-SHA256',
      payload_hmac_sha256: ((integrity?.payload_hmac_sha256 ?? integrity?.payload_hmac) as string) ?? '',
      compressed_byte_size: (integrity?.compressed_byte_size as number) ?? 0,
      uncompressed_byte_size: (integrity?.uncompressed_byte_size as number) ?? 0,
      calculated_at: (integrity?.calculated_at as string) ?? (record.created_at as string),
    },
    redaction_summary: record.redaction_summary as RedactionSummary | undefined,
    metadata: record.metadata as ManifestMetadata | undefined,
    environment: record.environment as EnvironmentMetadata | undefined,
  };

  return {
    valid: true,
    errors: [],
    manifest: normalizedManifest,
  };
}

/**
 * Asserts that data conforms to ReproManifest, throwing ManifestValidationError if not.
 */
export function assertValidManifest(data: unknown): asserts data is ReproManifest {
  const result = validateManifest(data);
  if (!result.valid || !result.manifest) {
    throw new ManifestValidationError(
      `Manifest validation failed with ${result.errors.length} error(s):\n- ${result.errors.join('\n- ')}`,
      result.errors
    );
  }
}

/**
 * Type guard for ReproManifest.
 */
export function isReproManifest(data: unknown): data is ReproManifest {
  return validateManifest(data).valid;
}
