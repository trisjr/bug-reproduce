/**
 * Repro Runtime Environment Metadata Type Definitions
 * Specification: ADR-002, SDD-Repro §4.3, Story-05
 */

export interface NodeInfo {
  version: string; // e.g. "v22.6.0"
  v8_version?: string;
  node_env?: string;
  exec_path?: string;
}

export interface GitMetadata {
  branch: string;
  commit: string; // Git commit SHA-1 or SHA-256
  dirty?: boolean;
  tag?: string;
  commit_timestamp?: string; // ISO-8601 UTC
  author?: string;
}

export interface OSInfo {
  platform: 'darwin' | 'linux' | 'win32' | string;
  arch: 'arm64' | 'x64' | 'arm' | string;
  release: string;
  hostname?: string;
  total_memory_bytes?: number;
}

export interface RedactedEnv {
  allowlist: string[]; // List of environment variable keys permitted to capture
  variables: Record<string, string>; // Captured key-value pairs (filtered by allowlist)
  redacted_keys: string[]; // Keys that were present in allowlist but masked/redacted
}

export interface RuntimeMetadata {
  node: NodeInfo;
  git: GitMetadata;
  os: OSInfo;
  env: RedactedEnv;
  captured_at: string; // ISO-8601 UTC timestamp
  process_uptime_seconds?: number;
}
