/**
 * Replay & Verification Interactive UX Checklist (UX-02, Story-15, Story-16)
 * Specification: EPIC-05, PRD §7.3, SDD-Repro §5.2
 */

export interface ChecklistItem {
  title: string;
  status: 'SUCCESS' | 'SKIPPED' | 'FAILED';
  detail?: string;
}

/**
 * Renders the step-by-step checklist of replayed inputs prior to final verdict.
 */
export function renderChecklist(items: ChecklistItem[], options: { color?: boolean } = {}): string {
  const useColor = options.color !== false;

  const green = (t: string) => (useColor ? `\x1b[32m${t}\x1b[39m` : t);
  const red = (t: string) => (useColor ? `\x1b[31m${t}\x1b[39m` : t);
  const dim = (t: string) => (useColor ? `\x1b[2m${t}\x1b[22m` : t);
  const bold = (t: string) => (useColor ? `\x1b[1m${t}\x1b[22m` : t);

  const lines: string[] = [bold('Execution Input Checklist (UX-02):')];

  for (const item of items) {
    let icon: string;
    if (item.status === 'SUCCESS') {
      icon = green('[✓]');
    } else if (item.status === 'FAILED') {
      icon = red('[✗]');
    } else {
      icon = dim('[-] ');
    }

    let line = `  ${icon} ${item.title}`;
    if (item.detail) {
      line += ` ${dim(`(${item.detail})`)}`;
    }
    lines.push(line);
  }

  return lines.join('\n');
}
