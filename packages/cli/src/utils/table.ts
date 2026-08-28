/**
 * Pure Node.js Terminal Table Formatter (Zero External Dependencies)
 * Specification: EPIC-05, Story-16, SDD-Repro §5.2
 */

export interface TableColumn {
  header: string;
  key?: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  maxWidth?: number;
}

/**
 * Strips ANSI escape sequences for accurate string length computation.
 */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Visual padding helper.
 */
function pad(str: string, width: number, align: 'left' | 'right' | 'center' = 'left'): string {
  const visibleLength = stripAnsi(str).length;
  if (visibleLength >= width) return str;
  const deficit = width - visibleLength;

  if (align === 'right') {
    return ' '.repeat(deficit) + str;
  }
  if (align === 'center') {
    const left = Math.floor(deficit / 2);
    const right = deficit - left;
    return ' '.repeat(left) + str + ' '.repeat(right);
  }
  return str + ' '.repeat(deficit);
}

/**
 * Truncates string visual length if exceeding maxWidth.
 */
function truncate(str: string, maxWidth: number): string {
  const clean = stripAnsi(str);
  if (clean.length <= maxWidth) return str;
  if (maxWidth <= 3) return clean.slice(0, maxWidth);
  return clean.slice(0, maxWidth - 3) + '...';
}

/**
 * Renders a structured text table for CLI output.
 */
export function renderTable(
  columns: TableColumn[],
  rows: Array<Record<string, unknown> | unknown[]>,
  options: { color?: boolean } = {}
): string {
  if (columns.length === 0) return '';

  const useColor = options.color !== false;
  const bold = (t: string) => (useColor ? `\x1b[1m${t}\x1b[22m` : t);
  const dim = (t: string) => (useColor ? `\x1b[2m${t}\x1b[22m` : t);

  // Compute column widths
  const widths: number[] = columns.map((col) => {
    let w = stripAnsi(col.header).length;
    if (col.minWidth && col.minWidth > w) w = col.minWidth;
    return w;
  });

  // Calculate based on row content
  const stringRows: string[][] = rows.map((row) => {
    return columns.map((col, colIdx) => {
      let cellValue: unknown;
      if (Array.isArray(row)) {
        cellValue = row[colIdx];
      } else if (col.key && col.key in row) {
        cellValue = row[col.key];
      } else {
        cellValue = '';
      }

      const str = cellValue === undefined || cellValue === null ? '' : String(cellValue);
      const truncated = col.maxWidth ? truncate(str, col.maxWidth) : str;
      const vLen = stripAnsi(truncated).length;
      if (vLen > widths[colIdx]) {
        widths[colIdx] = vLen;
      }
      return truncated;
    });
  });

  // Render Header
  const headerCells = columns.map((col, i) => {
    return bold(pad(col.header, widths[i], col.align || 'left'));
  });
  const headerLine = headerCells.join('  ');

  // Render Separator
  const separatorLine = dim(widths.map((w) => '─'.repeat(w)).join('  '));

  // Render Rows
  const renderedRows = stringRows.map((row) => {
    return row
      .map((cell, i) => {
        return pad(cell, widths[i], columns[i].align || 'left');
      })
      .join('  ');
  });

  return [headerLine, separatorLine, ...renderedRows].join('\n');
}
