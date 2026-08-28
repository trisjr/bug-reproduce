/**
 * Environment Drift Detector — Compares Captured Runtime Metadata with Local Dev Environment
 * Specification: ADR-011, Story-14, SDD-Repro §3.11, §4.3
 */

import type {
  RuntimeMetadata,
  EnvironmentMetadata,
  ReproManifest,
  NodeInfo,
  GitMetadata,
  OSInfo,
  RedactedEnv
} from '@repro/core';

export type DriftCategory =
  | 'NODE_VERSION'
  | 'NODE_ENV'
  | 'GIT_COMMIT'
  | 'GIT_DIRTY'
  | 'OS_PLATFORM'
  | 'OS_ARCH'
  | 'ENV_VARS'
  | 'DEPENDENCY_VERSION'
  | 'PACKAGE_LOCK'
  | 'CONFIG';

export type DriftSeverity = 'FATAL' | 'WARNING' | 'INFO';

export interface DriftItem {
  category: DriftCategory;
  severity: DriftSeverity;
  key: string;
  captured_value: unknown;
  local_value: unknown;
  description: string;
}

export interface EnvironmentDriftResult {
  has_drift: boolean;
  has_fatal_drift: boolean;
  drift_items: DriftItem[];
  summary: string[];
}

export interface LocalEnvironmentContext {
  node?: Partial<NodeInfo>;
  git?: Partial<GitMetadata>;
  os?: Partial<OSInfo>;
  env?: Record<string, string | undefined>;
  package_lock_hash?: string;
  dependencies?: Record<string, string>;
  code_hash?: string;
}

export interface DriftDetectorOptions {
  strictNodeMajor?: boolean;
  strictGitCommit?: boolean;
  monitoredEnvKeys?: string[];
  ignoredEnvKeys?: string[];
}

/**
 * Normalizes input metadata into a standard RuntimeMetadata-like representation.
 */
function normalizeCapturedMetadata(
  captured: RuntimeMetadata | EnvironmentMetadata | ReproManifest | Record<string, unknown>
): {
  node?: Partial<NodeInfo>;
  git?: Partial<GitMetadata>;
  os?: Partial<OSInfo>;
  env?: Partial<RedactedEnv> | Record<string, string>;
  package_lock_hash?: string;
} {
  if (!captured || typeof captured !== 'object') {
    return {};
  }

  const obj = captured as Record<string, unknown>;

  // Check if it's a ReproManifest
  if ('format_version' in obj && 'environment' in obj) {
    const manifest = obj as unknown as ReproManifest;
    const envMeta = manifest.environment;
    return {
      node: envMeta ? { version: envMeta.node_version } : undefined,
      git: {
        commit: manifest.target_commit || envMeta?.git_commit || '',
        branch: envMeta?.git_branch
      },
      os: envMeta
        ? {
            platform: envMeta.os_platform,
            arch: envMeta.os_arch,
            release: envMeta.os_release
          }
        : undefined
    };
  }

  // Check if it's RuntimeMetadata
  if ('node' in obj || 'git' in obj || 'os' in obj) {
    const runtime = obj as unknown as RuntimeMetadata;
    return {
      node: runtime.node,
      git: runtime.git,
      os: runtime.os,
      env: runtime.env
    };
  }

  // Check if it's EnvironmentMetadata
  if ('node_version' in obj && 'git_commit' in obj) {
    const envMeta = obj as unknown as EnvironmentMetadata;
    return {
      node: { version: envMeta.node_version },
      git: { commit: envMeta.git_commit, branch: envMeta.git_branch },
      os: { platform: envMeta.os_platform, arch: envMeta.os_arch, release: envMeta.os_release }
    };
  }

  return obj;
}

/**
 * Extracts the major version number from a Node version string (e.g. "v22.6.0" -> 22).
 */
function extractNodeMajor(versionStr?: string): number | null {
  if (!versionStr) return null;
  const cleaned = versionStr.startsWith('v') ? versionStr.slice(1) : versionStr;
  const parts = cleaned.split('.');
  const major = parseInt(parts[0], 10);
  return isNaN(major) ? null : major;
}

/**
 * EnvironmentDriftDetector inspects and compares the runtime environment
 * of a recorded production capsule against the developer's local environment.
 */
export class EnvironmentDriftDetector {
  private options: DriftDetectorOptions;

  constructor(options: DriftDetectorOptions = {}) {
    this.options = {
      strictNodeMajor: true,
      strictGitCommit: false,
      monitoredEnvKeys: ['NODE_ENV', 'PORT', 'APP_ENV', 'API_URL', 'DATABASE_URL', 'TZ'],
      ignoredEnvKeys: ['PATH', 'HOME', 'USER', 'SHELL', 'PWD', 'TERM'],
      ...options
    };
  }

  /**
   * Captures the current local machine runtime environment.
   */
  public getCurrentLocalEnvironment(): LocalEnvironmentContext {
    return {
      node: {
        version: typeof process !== 'undefined' ? process.version : 'unknown',
        node_env: typeof process !== 'undefined' && process.env ? process.env.NODE_ENV : undefined,
        exec_path: typeof process !== 'undefined' ? process.execPath : undefined
      },
      os: {
        platform: typeof process !== 'undefined' ? process.platform : 'unknown',
        arch: typeof process !== 'undefined' ? process.arch : 'unknown'
      },
      env: typeof process !== 'undefined' && process.env ? { ...process.env } : {}
    };
  }

  /**
   * Detects drift between captured runtime metadata and local environment context.
   */
  public detectDrift(
    captured: RuntimeMetadata | EnvironmentMetadata | ReproManifest | Record<string, unknown>,
    local?: LocalEnvironmentContext
  ): EnvironmentDriftResult {
    const localEnv = local ?? this.getCurrentLocalEnvironment();
    const capturedEnv = normalizeCapturedMetadata(captured);
    const driftItems: DriftItem[] = [];

    // 1. Check Node Version
    if (capturedEnv.node?.version && localEnv.node?.version) {
      const capturedMajor = extractNodeMajor(capturedEnv.node.version);
      const localMajor = extractNodeMajor(localEnv.node.version);

      if (capturedMajor !== null && localMajor !== null && capturedMajor !== localMajor) {
        driftItems.push({
          category: 'NODE_VERSION',
          severity: this.options.strictNodeMajor ? 'FATAL' : 'WARNING',
          key: 'node.version',
          captured_value: capturedEnv.node.version,
          local_value: localEnv.node.version,
          description: `Node.js major version mismatch: captured ${capturedEnv.node.version} (v${capturedMajor}) vs local ${localEnv.node.version} (v${localMajor})`
        });
      } else if (capturedEnv.node.version !== localEnv.node.version) {
        driftItems.push({
          category: 'NODE_VERSION',
          severity: 'INFO',
          key: 'node.version',
          captured_value: capturedEnv.node.version,
          local_value: localEnv.node.version,
          description: `Node.js minor/patch version difference: captured ${capturedEnv.node.version} vs local ${localEnv.node.version}`
        });
      }
    }

    // 2. Check Node Environment (NODE_ENV)
    const capturedNodeEnv = capturedEnv.node?.node_env || (capturedEnv.env as Record<string, string>)?.NODE_ENV;
    const localNodeEnv = localEnv.node?.node_env || localEnv.env?.NODE_ENV;
    if (capturedNodeEnv && localNodeEnv && capturedNodeEnv !== localNodeEnv) {
      driftItems.push({
        category: 'NODE_ENV',
        severity: 'WARNING',
        key: 'NODE_ENV',
        captured_value: capturedNodeEnv,
        local_value: localNodeEnv,
        description: `NODE_ENV drift: captured "${capturedNodeEnv}" vs local "${localNodeEnv}"`
      });
    }

    // 3. Check Git Commit SHA
    if (capturedEnv.git?.commit && localEnv.git?.commit) {
      const capCommit = capturedEnv.git.commit.trim();
      const locCommit = localEnv.git.commit.trim();
      const commitsMatch = capCommit.toLowerCase() === locCommit.toLowerCase() ||
        (capCommit.length >= 7 && locCommit.length >= 7 &&
          (capCommit.startsWith(locCommit) || locCommit.startsWith(capCommit)));

      if (!commitsMatch) {
        driftItems.push({
          category: 'GIT_COMMIT',
          severity: this.options.strictGitCommit ? 'FATAL' : 'WARNING',
          key: 'git.commit',
          captured_value: capCommit,
          local_value: locCommit,
          description: `Git commit SHA drift: captured ${capCommit.slice(0, 8)} vs local ${locCommit.slice(0, 8)}`
        });
      }
    }

    // 4. Check Git Dirty Status
    if (localEnv.git?.dirty === true) {
      driftItems.push({
        category: 'GIT_DIRTY',
        severity: 'WARNING',
        key: 'git.dirty',
        captured_value: false,
        local_value: true,
        description: 'Local workspace contains uncommitted git changes (working tree is dirty)'
      });
    }

    // 5. Check OS Platform and Architecture
    if (capturedEnv.os?.platform && localEnv.os?.platform && capturedEnv.os.platform !== localEnv.os.platform) {
      driftItems.push({
        category: 'OS_PLATFORM',
        severity: 'INFO',
        key: 'os.platform',
        captured_value: capturedEnv.os.platform,
        local_value: localEnv.os.platform,
        description: `Operating system platform mismatch: captured "${capturedEnv.os.platform}" vs local "${localEnv.os.platform}"`
      });
    }

    if (capturedEnv.os?.arch && localEnv.os?.arch && capturedEnv.os.arch !== localEnv.os.arch) {
      driftItems.push({
        category: 'OS_ARCH',
        severity: 'INFO',
        key: 'os.arch',
        captured_value: capturedEnv.os.arch,
        local_value: localEnv.os.arch,
        description: `CPU architecture mismatch: captured "${capturedEnv.os.arch}" vs local "${localEnv.os.arch}"`
      });
    }

    // 6. Check Environment Variables Drift
    const capturedVars: Record<string, string> =
      (capturedEnv.env as RedactedEnv)?.variables ||
      (typeof capturedEnv.env === 'object' && capturedEnv.env !== null ? (capturedEnv.env as Record<string, string>) : {});

    const localVars = localEnv.env || {};
    const keysToCheck = new Set<string>([
      ...(this.options.monitoredEnvKeys || []),
      ...Object.keys(capturedVars)
    ]);

    for (const key of keysToCheck) {
      if (this.options.ignoredEnvKeys?.includes(key)) continue;
      if (key === 'NODE_ENV') continue; // Handled separately above

      const capturedVal = capturedVars[key];
      const localVal = localVars[key];

      if (capturedVal !== undefined && localVal !== undefined && capturedVal !== localVal) {
        driftItems.push({
          category: 'ENV_VARS',
          severity: 'WARNING',
          key: `env.${key}`,
          captured_value: capturedVal,
          local_value: localVal,
          description: `Environment variable "${key}" differs: captured "${capturedVal}" vs local "${localVal}"`
        });
      }
    }

    // 7. Check Dependency Version / Package Lock Drift
    if (capturedEnv.package_lock_hash && localEnv.package_lock_hash) {
      if (capturedEnv.package_lock_hash !== localEnv.package_lock_hash) {
        driftItems.push({
          category: 'PACKAGE_LOCK',
          severity: 'WARNING',
          key: 'package_lock_hash',
          captured_value: capturedEnv.package_lock_hash,
          local_value: localEnv.package_lock_hash,
          description: 'package-lock.json integrity hash mismatch between production capsule and local workspace'
        });
      }
    }

    // Check specific dependencies if provided
    if (localEnv.dependencies) {
      for (const [depName, locVer] of Object.entries(localEnv.dependencies)) {
        const capDependencies = (capturedEnv as Record<string, unknown>).dependencies as Record<string, string> | undefined;
        if (capDependencies && capDependencies[depName] && capDependencies[depName] !== locVer) {
          driftItems.push({
            category: 'DEPENDENCY_VERSION',
            severity: 'WARNING',
            key: `dependency.${depName}`,
            captured_value: capDependencies[depName],
            local_value: locVer,
            description: `Dependency "${depName}" version drift: captured ${capDependencies[depName]} vs local ${locVer}`
          });
        }
      }
    }

    // Build summary lines
    const summary = driftItems.map((item) => {
      const prefix = item.severity === 'FATAL' ? '🚨 FATAL' : item.severity === 'WARNING' ? '⚠️ WARNING' : 'ℹ️ INFO';
      return `${prefix} [${item.category}] ${item.description}`;
    });

    const hasFatal = driftItems.some((item) => item.severity === 'FATAL');

    return {
      has_drift: driftItems.length > 0,
      has_fatal_drift: hasFatal,
      drift_items: driftItems,
      summary
    };
  }

  /**
   * Helper to format drift result into readable lines.
   */
  public formatDriftSummary(result: EnvironmentDriftResult): string {
    if (!result.has_drift) {
      return '✓ Environment parity verified: No significant drift detected between captured capsule and local workspace.';
    }
    return result.summary.join('\n');
  }
}

/**
 * Functional entrypoint for environment drift detection.
 */
export function detectEnvironmentDrift(
  captured: RuntimeMetadata | EnvironmentMetadata | ReproManifest | Record<string, unknown>,
  local?: LocalEnvironmentContext,
  options?: DriftDetectorOptions
): EnvironmentDriftResult {
  const detector = new EnvironmentDriftDetector(options);
  return detector.detectDrift(captured, local);
}
