import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const harnessPath = path.join(root, 'web', 'exact_gt_collision.html');
const manifestPath = path.join(root, 'tools', 'heavy_scene_gate_manifest.json');
const webRuntimePath = path.join(root, 'web', 'rt', 'rt.js');
const extensionRuntimePath = path.join(root, 'extension', 'rt', 'rt.js');

const [harness, manifestBytes, webRuntime, extensionRuntime] = await Promise.all([
  readFile(harnessPath, 'utf8'),
  readFile(manifestPath),
  readFile(webRuntimePath),
  readFile(extensionRuntimePath),
]);
const manifest = JSON.parse(manifestBytes);
const sha256 = value => createHash('sha256').update(value).digest('hex');

test('heavy-scene manifest freezes the low-rung workload and fixture roles', () => {
  assert.equal(manifest.gateId, 'v7s-heavy-scene-r480-v1');
  assert.deepEqual(
    {
      rung: manifest.workload.rung,
      modelResolution: manifest.workload.modelResolution,
      outputResolution: manifest.workload.outputResolution,
      sourceFps: manifest.workload.sourceFps,
      outputFps: manifest.workload.outputFps,
      timesteps: manifest.workload.timesteps,
    },
    {
      rung: '480',
      modelResolution: '848x480',
      outputResolution: '1280x720',
      sourceFps: 10,
      outputFps: 240,
      timesteps: 'k/24, k=1..23',
    },
  );
  assert.deepEqual(manifest.workload.blockingFixtures, [
    'collision',
    'crossing',
    'merge_zoom',
    'rotate_thin',
    'anime_hair_occlusion',
  ]);
  assert.deepEqual(manifest.workload.diagnosticFixtures, [
    'acceleration',
    'bounce',
    'anime_line_pan',
  ]);
});

test('harness exercises 848x480 inference into 1280x720 output with staged runtimes', () => {
  assert.match(harness, /480:\s*Object\.freeze\(\[848, 480\]\)/);
  assert.match(harness, /720:\s*Object\.freeze\(\[1280, 720\]\)/);
  assert.match(harness, /createRT\(device,\s*\{[\s\S]*?w:\s*MODEL_WIDTH,[\s\S]*?h:\s*MODEL_HEIGHT/);
  assert.match(harness, /size:\s*\[WIDTH, HEIGHT\]/);
  assert.match(harness, /await import\(RUNTIME_SOURCE_URL\.href\)/);
  assert.match(harness, /'\/__framegen_heavy__\/baseline\.js'/);
  assert.doesNotMatch(harness, /import\s+\{\s*createRT\s*\}\s+from\s+'\.\/rt\/rt\.js'/);
});

test('anime-like fixtures cover pan, line art, hair, occlusion, and a small contour', () => {
  for (const fixture of [...manifest.workload.blockingFixtures, ...manifest.workload.diagnosticFixtures]) {
    assert.match(harness, new RegExp(`\\b${fixture}: \\{`));
  }
  assert.match(harness, /anime_line_pan:[\s\S]*?gateRole:\s*'diagnostic-stress'/);
  assert.match(harness, /anime_hair_occlusion:[\s\S]*?gateRole:\s*'blocking-relative'/);
  assert.match(harness, /\{ id: 'earring',[^\n]*color: \[77, 217, 242\] \}/);
  assert.match(harness, /coverage:\s*\['anime-line-art', 'fast-pan', 'large-motion', 'thin-edge'\]/);
  assert.match(harness, /coverage:\s*\['anime-line-art', 'hair', 'occlusion', 'nonrigid-motion', 'thin-edge'\]/);
});

test('quality scoring is phase-complete, local, contour-aware, and linear-time in boundary pixels', () => {
  assert.match(harness, /for \(let frame = 1; frame < STEPS; frame\+\+\)/);
  assert.match(harness, /function distanceTransform1d\(/);
  assert.match(harness, /function nearestBoundaryDistances\(sourceMask, targetMask\)/);
  assert.doesNotMatch(harness, /for \(const \[otherX, otherY\] of targetPoints\)/);
  assert.match(harness, /function worstTileMetric\(/);
  assert.match(harness, /localError:\s*worstTileAggregate/);
  assert.match(harness, /cardinalExtentErrorPx/);
  assert.match(harness, /outwardCardinalErrorPx/);
  assert.match(harness, /p95:\s*percentile\(values, 0\.95\)/);
  assert.match(harness, /groundTruthPng:[\s\S]*?generatedPng:[\s\S]*?errorMapPng:/);
  assert.match(harness, /GT-vs-GT metric sanity check failed/);
});

test('manifest binds the shipping weights and mirrored runtimes', async () => {
  const [weights, weightsManifest] = await Promise.all([
    readFile(path.join(root, manifest.sources.weights.path)),
    readFile(path.join(root, manifest.sources.weightsManifest.path)),
  ]);
  assert.equal(sha256(weights), manifest.sources.weights.sha256);
  assert.equal(sha256(weightsManifest), manifest.sources.weightsManifest.sha256);
  assert.deepEqual(webRuntime, extensionRuntime);
});

test('policy has both aggregate and non-compensating local guardrails', () => {
  assert.ok(manifest.policy.lowerIsBetter.some(item => item.metric === 'local.worstTileMae'));
  assert.ok(manifest.policy.higherIsBetter.some(item => item.metric === 'edge.meanF1'));
  assert.ok(manifest.policy.contour.some(item =>
    item.field === 'outwardCardinalErrorPx' && item.statistic === 'maximum'));
  assert.equal(manifest.policy.worstPerFrameEdgeF1Delta, -0.03);
  assert.deepEqual(manifest.policy.zeroCountMetrics, [
    'tracking.trackMissCount',
    'tracking.identitySwitchProxyEvents',
  ]);
});
