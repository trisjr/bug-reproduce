/**
 * 6-Step Divergence Attribution Classifier (U-04 Protocol)
 * Specification: ADR-011, Story-14, SDD-Repro §3.6, §3.10
 */

import type {
  InteractionUnit,
  InboundInteraction,
  DivergencePoint,
  AttributionCategory,
  AttributionReason,
  RuntimeMetadata,
  EnvironmentMetadata,
  ReproManifest
} from '@repro/core';
import { isRedactionMask } from '../engine/tier2-rubric.ts';
import {
  EnvironmentDriftDetector,
  type LocalEnvironmentContext,
  type EnvironmentDriftResult,
  type DriftDetectorOptions
} from './drift-detector.ts';

export interface AttributionStepResult {
  step: number;
  name: string;
  matched: boolean;
  category?: AttributionCategory;
  reason?: AttributionReason | string;
  details?: string;
}

export interface DivergenceAttributionResult {
  category: AttributionCategory;
  reason: AttributionReason | string;
  step_matched: number; // 1 to 6
  step_name: string;
  explanation: string;
  divergence_index?: number;
  divergence_point?: DivergencePoint;
  drift_result?: EnvironmentDriftResult;
  steps_evaluated: AttributionStepResult[];
}

export interface DivergenceClassificationInput {
  recorded?: unknown[] | Record<string, unknown>;
  replayed?: unknown[] | Record<string, unknown>;
  first_divergence_point?: DivergencePoint;
  divergence_points?: DivergencePoint[];
  runtime_metadata?: RuntimeMetadata | EnvironmentMetadata | ReproManifest | Record<string, unknown>;
  manifest?: ReproManifest | Record<string, unknown>;
  local_context?: LocalEnvironmentContext;
  code_diff_present?: boolean;
  is_truncated?: boolean;
  is_incomplete_capture?: boolean;
  k_run_verdicts?: Array<{ status: string }>;
}

export interface ClassifierOptions {
  driftOptions?: DriftDetectorOptions;
}

/**
 * Extracts interaction units array from input wrapper.
 */
function extractUnitArray(input: unknown): InteractionUnit[] {
  if (Array.isArray(input)) {
    return input as InteractionUnit[];
  }
  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj.interactions)) {
      return obj.interactions as InteractionUnit[];
    }
    if (Array.isArray(obj.units)) {
      return obj.units as InteractionUnit[];
    }
  }
  return [];
}

/**
 * DivergenceClassifier executes the sequential 6-step First-Match-Wins
 * Divergence Attribution Protocol (Spec §3.6, U-04, Story-14).
 *
 * Steps:
 * 1. Step 1: Inbound Request Check (U-00 Mismatch -> INPUT_MISMATCH / ENVIRONMENT_DRIFT)
 * 2. Step 2: Code Hash / Git Commit SHA / Local Diff (Local code != capsule -> CODE_CHANGE)
 * 3. Step 3: Environment Variables (NODE_ENV, port, config -> ENVIRONMENT_DRIFT)
 * 4. Step 4: Dependency Version Drift (package-lock drift -> ENVIRONMENT_DRIFT)
 * 5. Step 5: Redaction Artifacts (Difference due to redaction mask -> REDACTION_ARTIFACT)
 * 6. Step 6: Unexplained Divergence (Cannot be explained -> UNATTRIBUTED)
 */
export class DivergenceClassifier {
  private options: ClassifierOptions;
  private driftDetector: EnvironmentDriftDetector;

  constructor(options: ClassifierOptions = {}) {
    this.options = options;
    this.driftDetector = new EnvironmentDriftDetector(options.driftOptions);
  }

  /**
   * Step 1: Check Inbound Request U-00 (Input Mismatch).
   */
  public checkStep1InboundRequest(
    recordedUnits: InteractionUnit[],
    replayedUnits: InteractionUnit[],
    firstDiv?: DivergencePoint
  ): AttributionStepResult {
    const name = 'Step 1: Inbound Request (U-00) Check';

    // If first divergence point is at index 0 (inbound interaction)
    if (firstDiv && firstDiv.index === 0) {
      return {
        step: 1,
        name,
        matched: true,
        category: 'ENVIRONMENT_DRIFT',
        reason: 'incomplete-capture',
        details: `Inbound request (U0) mismatch at index 0: ${firstDiv.description || 'Request method, URL, headers, or body differed'}`
      };
    }

    // Check first units directly
    const rec0 = recordedUnits[0] as InboundInteraction | undefined;
    const rep0 = replayedUnits[0] as InboundInteraction | undefined;

    if (rec0 && rep0) {
      const recCat = rec0.category || (rec0 as Record<string, unknown>).type;
      const repCat = rep0.category || (rep0 as Record<string, unknown>).type;

      if (recCat === 'HTTP_INBOUND' || repCat === 'HTTP_INBOUND') {
        const recReq = rec0.request || (rec0 as Record<string, unknown>).data;
        const repReq = rep0.request || (rep0 as Record<string, unknown>).data;

        if (recReq && repReq) {
          const recObj = recReq as Record<string, unknown>;
          const repObj = repReq as Record<string, unknown>;

          const methodDiff = recObj.method && repObj.method && recObj.method !== repObj.method;
          const urlDiff = recObj.url && repObj.url && recObj.url !== repObj.url;

          if (methodDiff || urlDiff) {
            return {
              step: 1,
              name,
              matched: true,
              category: 'ENVIRONMENT_DRIFT',
              reason: 'incomplete-capture',
              details: `Inbound request (U0) mismatch: ${methodDiff ? `method (${recObj.method} vs ${repObj.method})` : ''} ${urlDiff ? `url (${recObj.url} vs ${repObj.url})` : ''}`.trim()
            };
          }
        }
      }
    }

    return { step: 1, name, matched: false };
  }

  /**
   * Step 2: Check Code Hash / Git Commit SHA / Local Diff (CODE_CHANGE).
   */
  public checkStep2CodeChange(
    input: DivergenceClassificationInput,
    driftResult: EnvironmentDriftResult
  ): AttributionStepResult {
    const name = 'Step 2: Code Hash / Git Commit SHA / Local Diff Check';

    // Check explicit code diff flag
    if (input.code_diff_present === true) {
      return {
        step: 2,
        name,
        matched: true,
        category: 'CODE_CHANGE',
        reason: 'code',
        details: 'Local source code changes detected relative to captured capsule revision'
      };
    }

    // Check git dirty status
    if (input.local_context?.git?.dirty === true) {
      return {
        step: 2,
        name,
        matched: true,
        category: 'CODE_CHANGE',
        reason: 'code',
        details: 'Local working tree is dirty with uncommitted changes'
      };
    }

    // Check git commit mismatch in drift items
    const commitDrift = driftResult.drift_items.find((item) => item.category === 'GIT_COMMIT');
    if (commitDrift) {
      return {
        step: 2,
        name,
        matched: true,
        category: 'CODE_CHANGE',
        reason: 'code',
        details: commitDrift.description
      };
    }

    // Check code hash mismatch
    if (
      input.local_context?.code_hash &&
      input.runtime_metadata &&
      (input.runtime_metadata as Record<string, unknown>).code_hash &&
      input.local_context.code_hash !== (input.runtime_metadata as Record<string, unknown>).code_hash
    ) {
      return {
        step: 2,
        name,
        matched: true,
        category: 'CODE_CHANGE',
        reason: 'code',
        details: 'Local source code hash does not match production capsule code hash'
      };
    }

    return { step: 2, name, matched: false };
  }

  /**
   * Step 3: Check Environment Variables (ENVIRONMENT_DRIFT).
   */
  public checkStep3EnvironmentVars(driftResult: EnvironmentDriftResult): AttributionStepResult {
    const name = 'Step 3: Environment Variables Check';

    const envDrifts = driftResult.drift_items.filter(
      (item) => item.category === 'NODE_ENV' || item.category === 'ENV_VARS' || item.category === 'CONFIG'
    );

    if (envDrifts.length > 0) {
      return {
        step: 3,
        name,
        matched: true,
        category: 'ENVIRONMENT_DRIFT',
        reason: 'version-drift',
        details: envDrifts.map((d) => d.description).join('; ')
      };
    }

    return { step: 3, name, matched: false };
  }

  /**
   * Step 4: Check Dependency Version Drift (ENVIRONMENT_DRIFT).
   */
  public checkStep4DependencyDrift(driftResult: EnvironmentDriftResult): AttributionStepResult {
    const name = 'Step 4: Dependency Version Drift Check';

    const depDrifts = driftResult.drift_items.filter(
      (item) =>
        item.category === 'PACKAGE_LOCK' ||
        item.category === 'DEPENDENCY_VERSION' ||
        item.category === 'NODE_VERSION'
    );

    if (depDrifts.length > 0) {
      return {
        step: 4,
        name,
        matched: true,
        category: 'ENVIRONMENT_DRIFT',
        reason: 'version-drift',
        details: depDrifts.map((d) => d.description).join('; ')
      };
    }

    return { step: 4, name, matched: false };
  }

  /**
   * Step 5: Check Redaction Artifacts (REDACTION_ARTIFACT).
   */
  public checkStep5RedactionArtifacts(
    firstDiv?: DivergencePoint,
    manifest?: ReproManifest | Record<string, unknown>
  ): AttributionStepResult {
    const name = 'Step 5: Redaction Artifacts Check';

    if (firstDiv) {
      // Check if either production or local value matches privacy redaction mask
      const prodRedacted = isRedactionMask(firstDiv.production_value);
      const localRedacted = isRedactionMask(firstDiv.local_value);

      if (prodRedacted || localRedacted) {
        return {
          step: 5,
          name,
          matched: true,
          category: 'REDACTION_ARTIFACT',
          reason: 'redaction',
          details: `Divergence caused by privacy redaction rule. Not a code defect. (prod_redacted=${prodRedacted}, local_redacted=${localRedacted})`
        };
      }

      // Check if target/path is recorded in redactions manifest
      if (manifest && typeof manifest === 'object') {
        const redactionSummary = (manifest as ReproManifest).redaction_summary;
        const redactionsApplied = (manifest as Record<string, unknown>).redactions_applied as
          | Array<{ path: string; strategy?: string }>
          | undefined;

        if (redactionsApplied && Array.isArray(redactionsApplied)) {
          const matchedRedaction = redactionsApplied.find(
            (r) => r.path && firstDiv.description && firstDiv.description.includes(r.path)
          );
          if (matchedRedaction) {
            return {
              step: 5,
              name,
              matched: true,
              category: 'REDACTION_ARTIFACT',
              reason: 'redaction',
              details: `Divergence caused by privacy redaction rule at path "${matchedRedaction.path}". Not a code defect.`
            };
          }
        }

        if (redactionSummary?.has_redactions && firstDiv.category === 'REDACTION') {
          return {
            step: 5,
            name,
            matched: true,
            category: 'REDACTION_ARTIFACT',
            reason: 'redaction',
            details: 'Divergence caused by privacy redaction rule. Not a code defect.'
          };
        }
      }
    }

    return { step: 5, name, matched: false };
  }

  /**
   * Step 6: Unattributed Divergence (UNATTRIBUTED).
   */
  public checkStep6Unattributed(details?: string): AttributionStepResult {
    return {
      step: 6,
      name: 'Step 6: Unexplained Divergence',
      matched: true,
      category: 'UNATTRIBUTED',
      reason: 'unattributed',
      details: details || 'Divergence cannot be mapped to known categories. Unattributed execution divergence.'
    };
  }

  /**
   * Evaluates all 6 steps sequentially and returns the attribution verdict.
   */
  public classify(input: DivergenceClassificationInput): DivergenceAttributionResult {
    const recordedUnits = extractUnitArray(input.recorded);
    const replayedUnits = extractUnitArray(input.replayed);
    const firstDiv = input.first_divergence_point || input.divergence_points?.[0];

    // Run drift detection on runtime metadata if available
    const capturedMeta = input.runtime_metadata || input.manifest || {};
    const driftResult = this.driftDetector.detectDrift(capturedMeta, input.local_context);

    const stepsEvaluated: AttributionStepResult[] = [];

    // Step 1: Check Inbound Request U-00
    const step1 = this.checkStep1InboundRequest(recordedUnits, replayedUnits, firstDiv);
    stepsEvaluated.push(step1);
    if (step1.matched) {
      return {
        category: step1.category || 'ENVIRONMENT_DRIFT',
        reason: step1.reason || 'incomplete-capture',
        step_matched: 1,
        step_name: step1.name,
        explanation: step1.details || 'Inbound request (U-00) mismatch between production and local replay',
        divergence_index: firstDiv?.index ?? 0,
        divergence_point: firstDiv,
        drift_result: driftResult,
        steps_evaluated: stepsEvaluated
      };
    }

    // Step 2: Check Code Hash / Git Commit SHA / Local Diff
    const step2 = this.checkStep2CodeChange(input, driftResult);
    stepsEvaluated.push(step2);
    if (step2.matched) {
      return {
        category: step2.category || 'CODE_CHANGE',
        reason: step2.reason || 'code',
        step_matched: 2,
        step_name: step2.name,
        explanation: step2.details || 'Local source code or Git commit SHA differs from captured production capsule',
        divergence_index: firstDiv?.index,
        divergence_point: firstDiv,
        drift_result: driftResult,
        steps_evaluated: stepsEvaluated
      };
    }

    // Step 3: Check Environment Variables
    const step3 = this.checkStep3EnvironmentVars(driftResult);
    stepsEvaluated.push(step3);
    if (step3.matched) {
      return {
        category: step3.category || 'ENVIRONMENT_DRIFT',
        reason: step3.reason || 'version-drift',
        step_matched: 3,
        step_name: step3.name,
        explanation: step3.details || 'Environment variable drift detected between production and local workspace',
        divergence_index: firstDiv?.index,
        divergence_point: firstDiv,
        drift_result: driftResult,
        steps_evaluated: stepsEvaluated
      };
    }

    // Step 4: Check Dependency Version Drift
    const step4 = this.checkStep4DependencyDrift(driftResult);
    stepsEvaluated.push(step4);
    if (step4.matched) {
      return {
        category: step4.category || 'ENVIRONMENT_DRIFT',
        reason: step4.reason || 'version-drift',
        step_matched: 4,
        step_name: step4.name,
        explanation: step4.details || 'Dependency version or package-lock drift detected between production and local workspace',
        divergence_index: firstDiv?.index,
        divergence_point: firstDiv,
        drift_result: driftResult,
        steps_evaluated: stepsEvaluated
      };
    }

    // Step 5: Check Redaction Artifacts
    const step5 = this.checkStep5RedactionArtifacts(firstDiv, input.manifest);
    stepsEvaluated.push(step5);
    if (step5.matched) {
      return {
        category: step5.category || 'REDACTION_ARTIFACT',
        reason: step5.reason || 'redaction',
        step_matched: 5,
        step_name: step5.name,
        explanation: step5.details || 'Divergence caused by privacy redaction rule. Not a code defect.',
        divergence_index: firstDiv?.index,
        divergence_point: firstDiv,
        drift_result: driftResult,
        steps_evaluated: stepsEvaluated
      };
    }

    // Auxiliary check for out-of-scope non-determinism (K-runs)
    if (input.k_run_verdicts && input.k_run_verdicts.length > 1) {
      const distinctVerdicts = new Set(input.k_run_verdicts.map((v) => v.status));
      if (distinctVerdicts.size > 1) {
        return {
          category: 'UNATTRIBUTED',
          reason: 'out-of-scope-determinism',
          step_matched: 6,
          step_name: 'Step 6: Non-Deterministic Execution (K-run variance)',
          explanation: `Inconsistent replay outcomes across K=${input.k_run_verdicts.length} runs: ${Array.from(distinctVerdicts).join(', ')}`,
          divergence_index: firstDiv?.index,
          divergence_point: firstDiv,
          drift_result: driftResult,
          steps_evaluated: stepsEvaluated
        };
      }
    }

    // Auxiliary check for incomplete / truncated capture
    if (input.is_truncated === true) {
      return {
        category: 'ENVIRONMENT_DRIFT',
        reason: 'truncated',
        step_matched: 6,
        step_name: 'Step 6: Bounded Capture Truncation',
        explanation: 'Result set exceeded row/byte cap during production capture (ADR-008)',
        divergence_index: firstDiv?.index,
        divergence_point: firstDiv,
        drift_result: driftResult,
        steps_evaluated: stepsEvaluated
      };
    }

    if (input.is_incomplete_capture === true) {
      return {
        category: 'ENVIRONMENT_DRIFT',
        reason: 'incomplete-capture',
        step_matched: 6,
        step_name: 'Step 6: Incomplete Capture',
        explanation: 'Required interaction was missing from capsule (ADR-008, E9)',
        divergence_index: firstDiv?.index,
        divergence_point: firstDiv,
        drift_result: driftResult,
        steps_evaluated: stepsEvaluated
      };
    }

    // Step 6: Unattributed
    const step6 = this.checkStep6Unattributed();
    stepsEvaluated.push(step6);

    return {
      category: step6.category || 'UNATTRIBUTED',
      reason: step6.reason || 'unattributed',
      step_matched: 6,
      step_name: step6.name,
      explanation: step6.details || 'Divergence cannot be mapped to known categories. Unattributed execution divergence.',
      divergence_index: firstDiv?.index,
      divergence_point: firstDiv,
      drift_result: driftResult,
      steps_evaluated: stepsEvaluated
    };
  }
}

/**
 * Functional entrypoint for 6-step divergence classification.
 */
export function classifyDivergence(
  input: DivergenceClassificationInput,
  options?: ClassifierOptions
): DivergenceAttributionResult {
  const classifier = new DivergenceClassifier(options);
  return classifier.classify(input);
}
