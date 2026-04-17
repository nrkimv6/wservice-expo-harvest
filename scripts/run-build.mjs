import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { cwd } from 'node:process';
import { fileURLToPath } from 'node:url';

const projectDir = cwd();
const cloudflareOutputDir = '.svelte-kit/cloudflare';
export const devRuntimeStateRelativePath = path.join('.svelte-kit', 'dev-runtime.json');
const require = createRequire(import.meta.url);
const viteEntry = require.resolve('vite');
const viteRoot = path.dirname(path.dirname(path.dirname(viteEntry)));
const viteBin = path.join(viteRoot, 'bin', 'vite.js');

function toPowerShellLiteral(value) {
	return `'${value.replace(/'/g, "''")}'`;
}

export function getWindowsRepoDevProcesses(projectDirToUse = projectDir) {
	if (process.platform !== 'win32') {
		return [];
	}

	// CommandLine filtering is the first pass, but some Windows node children expose
	// an empty CommandLine. A repo-local runtime marker from run-dev covers that blind spot.
	const script = `
$projectDir = ${toPowerShellLiteral(projectDirToUse)};
Get-CimInstance Win32_Process |
	Where-Object {
		$_.CommandLine -and
		$_.CommandLine -like "*$projectDir*" -and
		$_.CommandLine -match '(?i)(vite\\s+dev|npm\\s+run\\s+dev|pnpm\\s+dev|yarn\\s+dev)'
	} |
	Select-Object -ExpandProperty ProcessId
`.trim();

	const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', script], {
		encoding: 'utf8',
		windowsHide: true
	});

	if (result.error || result.status !== 0) {
		return [];
	}

	return result.stdout
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
}

export function getDevRuntimeStatePath(projectDirToUse = projectDir) {
	return path.join(projectDirToUse, devRuntimeStateRelativePath);
}

export function readDevRuntimeState(projectDirToUse = projectDir) {
	const runtimeStatePath = getDevRuntimeStatePath(projectDirToUse);
	try {
		const raw = readFileSync(runtimeStatePath, 'utf8');
		const parsed = JSON.parse(raw);
		return parsed?.projectDir === projectDirToUse ? parsed : null;
	} catch {
		return null;
	}
}

function cleanupDevRuntimeState(projectDirToUse = projectDir) {
	try {
		rmSync(getDevRuntimeStatePath(projectDirToUse), { force: true });
	} catch {
		// Ignore best-effort cleanup failures.
	}
}

function isPidRunning(pid) {
	if (!Number.isInteger(pid) || pid <= 0) {
		return false;
	}

	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function getTrackedRuntimePids(runtimeState) {
	return [runtimeState?.launcherPid, runtimeState?.vitePid].filter((pid) => Number.isInteger(pid) && pid > 0);
}

export function getRepoDevRuntimeSignal(projectDirToUse = projectDir, isPidRunningFn = isPidRunning) {
	const runtimeState = readDevRuntimeState(projectDirToUse);
	if (!runtimeState) {
		return null;
	}

	const activePids = getTrackedRuntimePids(runtimeState).filter((pid) => isPidRunningFn(pid));
	if (activePids.length === 0) {
		cleanupDevRuntimeState(projectDirToUse);
		return null;
	}

	return {
		source: 'runtime-state',
		activePids,
		runtimeStatePath: getDevRuntimeStatePath(projectDirToUse)
	};
}

export function buildClearFailureMessage() {
	return [
		`[build] Windows detected a running dev server in this repo while preparing ${cloudflareOutputDir}.`,
		'[build] Close the terminal running `npm run dev` and rerun `npm run build`.',
		'[build] If you need the raw Vite path, run `npm run build:raw`.'
	].join('\n');
}

export function looksLikeCloudflareLockError(text) {
	return /(?:EPERM|EACCES|Permission denied)/i.test(text) && /\.svelte-kit[\\/](?:cloudflare|output)/i.test(text);
}

export function findRepoDevServerSignal(projectDirToUse = projectDir) {
	const commandLinePids = getWindowsRepoDevProcesses(projectDirToUse);
	if (commandLinePids.length > 0) {
		return {
			source: 'win32-process',
			activePids: commandLinePids
		};
	}

	// Chosen fallback: repo-local runtime marker written by run-dev.
	// Comparison summary:
	// - process tree: repo scoping is indirect and child lookup is brittle on Windows
	// - TCP port scan: custom ports are possible and port ownership alone is ambiguous
	// - runtime marker: repo scope is explicit, stale files are pruneable, implementation is small
	return getRepoDevRuntimeSignal(projectDirToUse);
}

export function run() {
	const devSignal = findRepoDevServerSignal();
	if (devSignal) {
		process.stderr.write(`${buildClearFailureMessage()}\n`);
		process.exit(1);
	}

	const result = spawnSync(process.execPath, [viteBin, 'build'], {
		cwd: projectDir,
		encoding: 'utf8',
		env: process.env,
		windowsHide: true
	});

	if (result.stdout) {
		process.stdout.write(result.stdout);
	}

	if (result.stderr) {
		process.stderr.write(result.stderr);
	}

	if (result.error) {
		process.stderr.write(`\n[build] ${result.error.message}\n`);
		process.exit(1);
	}

	if (result.status !== 0) {
		const combinedOutput = `${result.stdout || ''}\n${result.stderr || ''}`;
		if (looksLikeCloudflareLockError(combinedOutput)) {
			process.stderr.write(`\n${buildClearFailureMessage()}\n`);
		}
		process.exit(result.status ?? 1);
	}
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
const modulePath = fileURLToPath(import.meta.url);

if (invokedPath === modulePath) {
	run();
}
