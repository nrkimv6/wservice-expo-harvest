import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { cwd } from 'node:process';

const projectDir = cwd();
const cloudflareOutputDir = '.svelte-kit/cloudflare';
const require = createRequire(import.meta.url);
const viteEntry = require.resolve('vite');
const viteRoot = path.dirname(path.dirname(path.dirname(viteEntry)));
const viteBin = path.join(viteRoot, 'bin', 'vite.js');

function toPowerShellLiteral(value) {
	return `'${value.replace(/'/g, "''")}'`;
}

function getWindowsRepoDevProcesses() {
	if (process.platform !== 'win32') {
		return [];
	}

	const script = `
$projectDir = ${toPowerShellLiteral(projectDir)};
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

function buildClearFailureMessage() {
	return [
		`[build] Windows detected a running dev server in this repo while preparing ${cloudflareOutputDir}.`,
		'[build] Close the terminal running `npm run dev` and rerun `npm run build`.',
		'[build] If you need the raw Vite path, run `npm run build:raw`.'
	].join('\n');
}

function looksLikeCloudflareLockError(text) {
	return /(?:EPERM|EACCES|Permission denied)/i.test(text) && /\.svelte-kit[\\/](?:cloudflare|output)/i.test(text);
}

function run() {
	const devPids = getWindowsRepoDevProcesses();
	if (devPids.length > 0) {
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

run();
