/**
 * Repro Manifest v1 Type Definitions
 * Specification: ADR-002, SDD-Repro §4.2, Story-05, Story-06
 */

export interface KeyReference {
  key_id: string; // Reference identifier to Key Custody Store (ADR-012)
  custody_endpoint: string; // Key custody service URI
  registered_at?: string; // ISO-8601 UTC timestamp
  expires_at?: string; // ISO-8601 UTC timestamp (TTL SEC-022)
}

export interface EncryptionMetadata {
  algorithm: 'AES-256-GCM';
  key_id: string; // Reference to Key Custody Store (ADR-012)
  custody_endpoint: string;
  iv: string; // Base64 12-byte IV
  auth_tag: string; // Base64 16-byte Auth Tag
}

export interface PayloadDigest {
  algorithm?: 'HMAC-SHA256' | string;
  payload_hmac_sha256: string; // SEC-027 verify-before-parse
  compressed_byte_size: number;
  uncompressed_byte_size: number;
  calculated_at?: string; // ISO-8601 UTC
}

export interface TriggerReason {
  type: 'HTTP_5XX' | 'UNHANDLED_EXCEPTION' | 'MANUAL_DEBUG';
  error_name: string;
  error_message: string;
  stack_trace?: string;
  status_code?: number;
}

export interface ClassAssessment {
  is_supported_class: boolean; // ACG-07 Supported Execution Class check
  unsupported_reasons?: string[]; // e.g. ['REDIS_INTERACTION', 'RACE_CONDITION']
}

export interface RedactionSummary {
  total_fields_redacted: number;
  has_redactions: boolean;
}

export interface EnvironmentMetadata {
  node_version: string;
  os_platform: string;
  os_arch?: string;
  os_release?: string;
  git_branch?: string;
  git_commit: string;
  env_keys_allowlist?: string[];
}

export interface ManifestMetadata {
  trace_id?: string;
  incident_id?: string;
  captured_by?: string;
  service_name?: string;
  custom_attributes?: Record<string, unknown>;
}

export interface CapsuleFileEntry {
  path: string; // Relative path inside tarball, e.g. 'manifest.json', 'interactions.jsonl'
  sha256_digest: string;
  byte_size: number;
  compressed?: boolean;
}

export interface ReproManifest {
  format_version: '1.0.0';
  capsule_id: string; // UUIDv7
  created_at: string; // ISO-8601 UTC
  app_name: string;
  app_version: string;
  target_commit: string; // Git commit SHA
  is_derived_sanitized?: boolean; // THREAT-006: safe for git commit in V0.2
  trigger_reason: TriggerReason;
  class_assessment: ClassAssessment;
  encryption_metadata: EncryptionMetadata;
  integrity: PayloadDigest;
  redaction_summary?: RedactionSummary;
  metadata?: ManifestMetadata;
  environment?: EnvironmentMetadata;
}

/**
 * Alias for ReproManifest (Capsule Manifest v1 Contract)
 */
export type CapsuleManifestV1 = ReproManifest;
