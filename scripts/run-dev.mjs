import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const defaultPort = 5173;
const devRuntimeStatePath = resolve('.svelte-kit', 'dev-runtime.json');
const args = process.argv.slice(2);
const { host, port, forwardArgs } = parseCliArgs(args);
const internalPort = await findAvailablePort(port + 1);

const splashServer = http.createServer((request, response) => {
	response.writeHead(200, {
		'content-type': 'text/html; charset=utf-8',
		'cache-control': 'no-store'
	});
	response.end(renderSplashHtml(internalPort));
});

await listen(splashServer, port, host);

const viteChild = spawn(
	process.execPath,
	[
		resolve('node_modules', 'vite', 'bin', 'vite.js'),
		'dev',
		'--host',
		host,
		'--port',
		String(internalPort),
		'--strictPort',
		...forwardArgs
	],
	{
		stdio: 'inherit',
		env: process.env
	}
);

persistDevRuntimeState();

let splashClosed = false;

const closeSplashServer = () =>
	new Promise((resolveClose) => {
		if (splashClosed) {
			resolveClose();
			return;
		}

		splashClosed = true;
		splashServer.close(() => resolveClose());
	});

const shutdown = async (signal) => {
	await closeSplashServer();
	if (!viteChild.killed) {
		viteChild.kill(signal);
	}
};

const clearDevRuntimeState = () => {
	try {
		const existing = JSON.parse(readFileSync(devRuntimeStatePath, 'utf8'));
		if (existing?.launcherPid !== process.pid) {
			return;
		}
	} catch {
		// Ignore parse/read failures and best-effort remove the stale marker.
	}

	try {
		rmSync(devRuntimeStatePath, { force: true });
	} catch {
		// Ignore cleanup failures; the build wrapper prunes stale markers.
	}
};

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, () => {
		void shutdown(signal);
	});
}

process.on('exit', clearDevRuntimeState);

viteChild.on('exit', async (code, signal) => {
	await closeSplashServer();
	clearDevRuntimeState();
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}
	process.exit(code ?? 0);
});

console.log(
	`[dev] Splash placeholder listening on http://${formatDisplayHost(host)}:${port} while Vite boots.`
);

function parseCliArgs(inputArgs) {
	let host = '127.0.0.1';
	let port = defaultPort;
	const forwardArgs = [];

	for (let index = 0; index < inputArgs.length; index += 1) {
		const arg = inputArgs[index];

		if (arg === '--host') {
			const nextValue = inputArgs[index + 1];
			if (!nextValue || nextValue.startsWith('-')) {
				host = '0.0.0.0';
				continue;
			}
			host = nextValue;
			index += 1;
			continue;
		}

		if (arg.startsWith('--host=')) {
			host = arg.slice('--host='.length) || '0.0.0.0';
			continue;
		}

		if (arg === '--port' || arg === '-p') {
			const nextValue = inputArgs[index + 1];
			const parsedPort = Number(nextValue);
			if (Number.isInteger(parsedPort) && parsedPort > 0) {
				port = parsedPort;
				index += 1;
				continue;
			}
		}

		if (arg.startsWith('--port=')) {
			const parsedPort = Number(arg.slice('--port='.length));
			if (Number.isInteger(parsedPort) && parsedPort > 0) {
				port = parsedPort;
				continue;
			}
		}

		if (arg === '--open') {
			const nextValue = inputArgs[index + 1];
			if (nextValue && !nextValue.startsWith('-')) {
				index += 1;
			}
			continue;
		}

		if (arg.startsWith('--open=')) {
			continue;
		}

		forwardArgs.push(arg);
	}

	return { host, port, forwardArgs };
}

function persistDevRuntimeState() {
	mkdirSync(resolve('.svelte-kit'), { recursive: true });
	writeFileSync(
		devRuntimeStatePath,
		JSON.stringify(
			{
				projectDir: resolve('.'),
				host,
				port,
				internalPort,
				launcherPid: process.pid,
				vitePid: viteChild.pid,
				updatedAt: new Date().toISOString()
			},
			null,
			2
		),
		'utf8'
	);
}

function findAvailablePort(startPort) {
	return new Promise((resolvePort, rejectPort) => {
		const tryPort = (candidatePort) => {
			const tester = net.createServer();
			tester.unref();
			tester.once('error', (error) => {
				if (error.code === 'EADDRINUSE') {
					tryPort(candidatePort + 1);
					return;
				}
				rejectPort(error);
			});
			tester.listen(candidatePort, '127.0.0.1', () => {
				const address = tester.address();
				tester.close(() => {
					if (address && typeof address === 'object') {
						resolvePort(address.port);
						return;
					}
					rejectPort(new Error('Unable to resolve an internal dev port.'));
				});
			});
		};

		tryPort(startPort);
	});
}

function listen(server, portToUse, hostToUse) {
	return new Promise((resolveListen, rejectListen) => {
		server.once('error', rejectListen);
		server.listen(portToUse, hostToUse, () => {
			server.removeListener('error', rejectListen);
			resolveListen();
		});
	});
}

function renderSplashHtml(internalPortToUse) {
	return `<!doctype html>
<html lang="ko">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
		<meta name="theme-color" content="#050505" />
		<title>Starting dev server</title>
		<style>
			html,
			body {
				margin: 0;
				min-height: 100%;
				background: #050505;
			}
		</style>
	</head>
	<body>
		<script>
			const target = () =>
				\`\${window.location.protocol}//\${window.location.hostname}:${internalPortToUse}\${window.location.pathname}\${window.location.search}\${window.location.hash}\`;

			const tryRedirect = async () => {
				try {
					await fetch(target(), { cache: 'no-store', mode: 'no-cors' });
					window.location.replace(target());
					return;
				} catch {}

				window.setTimeout(tryRedirect, 250);
			};

			void tryRedirect();
		</script>
	</body>
</html>`;
}

function formatDisplayHost(hostToUse) {
	return hostToUse === '0.0.0.0' ? 'localhost' : hostToUse;
}
