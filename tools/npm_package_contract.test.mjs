import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));
const packageDir = join(root, 'packages', 'rt');

test('npm package exports typed interpolation and TinySR entry points', async () => {
  const packageJson = JSON.parse(await readFile(join(packageDir, 'package.json'), 'utf8'));

  assert.deepEqual(packageJson.exports['.'], {
    types: './index.d.ts',
    default: './rt.js',
  });
  assert.deepEqual(packageJson.exports['./sr'], {
    types: './sr.d.ts',
    default: './sr.js',
  });
  assert.ok(packageJson.files.includes('index.d.ts'));
  assert.ok(packageJson.files.includes('sr.d.ts'));

  await Promise.all([
    access(join(packageDir, packageJson.exports['.'].types)),
    access(join(packageDir, packageJson.exports['./sr'].types)),
  ]);
});
