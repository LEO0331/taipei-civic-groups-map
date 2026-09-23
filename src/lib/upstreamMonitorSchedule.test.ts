import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflowPath = '.github/workflows/upstream-monitor.yml';

test('upstream monitor schedule stays weekly, read-only, and detection-only', async () => {
  const workflow = await readFile(workflowPath, 'utf8');

  assert.match(workflow, /cron:\s*['"]0 1 \* \* 1['"]/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/);
  assert.match(workflow, /node-version:\s*22/);
  assert.match(workflow, /npm run data:monitor:upstream/);
  assert.match(workflow, /\.tmp\/upstream-monitor-report\.json/);
  assert.match(workflow, /actions\/upload-artifact@v7\.0\.1/);
  assert.match(workflow, /retention-days:\s*30/);

  assert.doesNotMatch(workflow, /npm run data:fetch(?:\s|$)/);
  assert.doesNotMatch(workflow, /git\s+(?:commit|push)/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
  assert.doesNotMatch(workflow, /pages:\s*write/);
});
