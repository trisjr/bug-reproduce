/**
 * `repro list` Command Handler
 * Specification: EPIC-05, Story-16, SDD-Repro §5.2
 */

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { readCapsule } from '@repro/core';
import type { ListOptions, ListResult, CapsuleListItem } from '../types.ts';
import { getDefaultCapsulesDirectory, formatBytes, listLocalCapsuleFiles } from '../utils/storage.ts';
import { renderTable } from '../utils/table.ts';

/**
 * Executes the `repro list` command.
 */
export async function listCommand(options: ListOptions = {}): Promise<ListResult> {
  const directory = getDefaultCapsulesDirectory(options.dir);
  const files = await listLocalCapsuleFiles(directory);

  const items: CapsuleListItem[] = [];

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const idFallback = fileName.replace(/\.(repro\.tar\.gz|tar\.gz|repro)$/, '');

    let sizeBytes = 0;
    try {
      const stats = await fs.stat(filePath);
      sizeBytes = stats.size;
    } catch {
      // Ignore
    }

    try {
      const capsule = await readCapsule(filePath);
      const manifest = capsule.manifest;

      items.push({
        id: manifest.capsule_id || idFallback,
        filePath,
        service: manifest.app_name || 'unknown',
        environment: manifest.environment || 'local',
        createdAt: manifest.created_at || new Date().toISOString(),
        sizeBytes,
        sizeFormatted: formatBytes(sizeBytes),
        status: 'VALID',
        triggerReason: manifest.trigger?.reason || 'MANUAL',
      });
    } catch (error) {
      const errMsg = (error as Error).message || '';
      const isEncrypted = errMsg.includes('KeyCustody') || errMsg.includes('DEK') || errMsg.includes('encrypted');
      const isShredded = errMsg.includes('shredded') || errMsg.includes('410');

      items.push({
        id: idFallback,
        filePath,
        service: 'unknown',
        environment: 'unknown',
        createdAt: 'unknown',
        sizeBytes,
        sizeFormatted: formatBytes(sizeBytes),
        status: isShredded ? 'SHREDDED' : isEncrypted ? 'ENCRYPTED' : 'CORRUPTED',
      });
    }
  }

  // Filter by service if requested
  let filtered = items;
  if (options.service) {
    const serviceFilter = options.service.toLowerCase();
    filtered = filtered.filter((i) => i.service.toLowerCase().includes(serviceFilter));
  }

  // Limit results
  if (options.limit && options.limit > 0) {
    filtered = filtered.slice(0, options.limit);
  }

  const result: ListResult = {
    capsules: filtered,
    total: filtered.length,
    directory,
  };

  // Output formatting
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (filtered.length === 0) {
      console.log(`No capsules found in "${directory}".`);
    } else {
      console.log(`\nFound ${filtered.length} capsule(s) in ${directory}:\n`);
      const tableText = renderTable(
        [
          { header: 'ID', key: 'id', minWidth: 16 },
          { header: 'SERVICE', key: 'service', minWidth: 12 },
          { header: 'ENVIRONMENT', key: 'environment', minWidth: 12 },
          { header: 'CREATED AT', key: 'createdAt', minWidth: 20 },
          { header: 'SIZE', key: 'sizeFormatted', minWidth: 10, align: 'right' },
          { header: 'STATUS', key: 'status', minWidth: 10 },
        ],
        filtered,
        { color: options.noColor ? false : true }
      );
      console.log(tableText);
      console.log();
    }
  }

  return result;
}
