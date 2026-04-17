import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
	buildClearFailureMessage,
	devRuntimeStateRelativePath,
	getRepoDevRuntimeSignal,
	looksLikeCloudflareLockError,
	readDevRuntimeState
} from './run-build.mjs';

function createTempProject() {
	const projectDir = mkdtempSync(path.join(os.tmpdir(), 'expo-harvest-build-'));
	mkdirSync(path.join(projectDir, '.svelte-kit'), { recursive: true });
	return projectDir;
}

test('readDevRuntimeState returns repo-local marker payload', () => {
	const projectDir = createTempProject();
	const runtimeStatePath = path.join(projectDir, devRuntimeStateRelativePath);

	writeFileSync(
		runtimeStatePath,
		JSON.stringify({
			projectDir,
			launcherPid: 111,
			vitePid: 222
		}),
		'utf8'
	);

	assert.deepEqual(readDevRuntimeState(projectDir), {
		projectDir,
		launcherPid: 111,
		vitePid: 222
	});

	rmSync(projectDir, { recursive: true, force: true });
});

test('getRepoDevRuntimeSignal uses active runtime marker pids', () => {
	const projectDir = createTempProject();
	const runtimeStatePath = path.join(projectDir, devRuntimeStateRelativePath);

	writeFileSync(
		runtimeStatePath,
		JSON.stringify({
			projectDir,
			launcherPid: 111,
			vitePid: 222
		}),
		'utf8'
	);

	const signal = getRepoDevRuntimeSignal(projectDir, (pid) => pid === 222);
	assert.equal(signal?.source, 'runtime-state');
	assert.deepEqual(signal?.activePids, [222]);

	rmSync(projectDir, { recursive: true, force: true });
});

test('getRepoDevRuntimeSignal prunes stale runtime markers', () => {
	const projectDir = createTempProject();
	const runtimeStatePath = path.join(projectDir, devRuntimeStateRelativePath);

	writeFileSync(
		runtimeStatePath,
		JSON.stringify({
			projectDir,
			launcherPid: 111,
			vitePid: 222
		}),
		'utf8'
	);

	assert.equal(getRepoDevRuntimeSignal(projectDir, () => false), null);
	assert.equal(existsSync(runtimeStatePath), false);

	rmSync(projectDir, { recursive: true, force: true });
});

test('build failure helpers keep Windows cloudflare guidance intact', () => {
	assert.match(buildClearFailureMessage(), /build:raw/);
	assert.equal(
		looksLikeCloudflareLockError('EPERM: Permission denied, unlink .svelte-kit\\cloudflare\\_worker.js'),
		true
	);
});
