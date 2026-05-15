import { existsSync, readFileSync, rmSync } from "node:fs";
import { request } from "node:http";
import { basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const pnpmExecPath = process.env.npm_execpath;
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const config = {
	host: process.env.DEPLOY_HOST || "39.102.120.197",
	user: process.env.DEPLOY_USER || "root",
	remoteRoot: process.env.DEPLOY_REMOTE_ROOT || "/var/www/blog",
	domain: process.env.DEPLOY_DOMAIN || "sentooyi.top",
	archiveName: "firefly-dist.tar.gz",
};

const args = new Set(process.argv.slice(2));
const skipBuild = args.has("--skip-build");

function log(message) {
	console.log(`\n==> ${message}`);
}

function run(command, commandArgs, options = {}) {
	const result = spawnSync(command, commandArgs, {
		stdio: "inherit",
		shell: false,
		...options,
	});

	if (result.error) {
		throw result.error;
	}

	if (result.status !== 0) {
		throw new Error(`${command} ${commandArgs.join(" ")} failed`);
	}
}

function readText(path) {
	return readFileSync(path, "utf-8");
}

function ensureSafeRemoteRoot(remoteRoot) {
	const normalized = remoteRoot.replace(/\/+$/, "");
	if (!normalized.startsWith("/var/www/") || normalized.split("/").length < 4) {
		throw new Error(
			`Refusing to deploy to unsafe remote root: ${remoteRoot}. Expected /var/www/<site>.`,
		);
	}
}

function remoteTarget() {
	return `${config.user}@${config.host}`;
}

function ssh(remoteCommand) {
	run("ssh", [remoteTarget(), remoteCommand]);
}

function verifySiteUrl() {
	const siteConfigPath = resolve("src/config/siteConfig.ts");
	const content = readText(siteConfigPath);
	const expected = `site_url: "http://${config.domain}"`;
	if (!content.includes(expected)) {
		console.warn(
			`Warning: site_url does not appear to be http://${config.domain}. RSS and sitemap may use another canonical URL.`,
		);
	}
}

function httpCheck(pathname) {
	return new Promise((resolveCheck, reject) => {
		const url = `http://${config.domain}${pathname}`;
		const req = request(url, { timeout: 15000 }, (res) => {
			let body = "";
			res.setEncoding("utf8");
			res.on("data", (chunk) => {
				body += chunk;
			});
			res.on("end", () => {
				if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 400) {
					reject(new Error(`${url} returned HTTP ${res.statusCode}`));
					return;
				}
				resolveCheck(body);
			});
		});

		req.on("timeout", () => {
			req.destroy(new Error(`${url} timed out`));
		});
		req.on("error", reject);
		req.end();
	});
}

async function main() {
	ensureSafeRemoteRoot(config.remoteRoot);
	verifySiteUrl();

	if (!skipBuild) {
		log("Building Firefly");
		if (pnpmExecPath) {
			run(process.execPath, [pnpmExecPath, "run", "build"]);
		} else {
			run(pnpmCommand, ["run", "build"]);
		}
	}

	if (!existsSync("dist/index.html")) {
		throw new Error("dist/index.html was not found. Run pnpm run build first.");
	}

	const archivePath = resolve(config.archiveName);

	log("Creating deployment archive");
	rmSync(archivePath, { force: true });
	run("tar", ["-C", "dist", "-czf", archivePath, "."]);

	log("Checking SSH connection");
	ssh("whoami && hostname");

	log("Uploading archive");
	run("scp", [archivePath, `${remoteTarget()}:/tmp/${config.archiveName}`]);

	log(`Publishing to ${config.remoteRoot}`);
	const nginxConfig = [
		"server {",
		"        listen 80 default_server;",
		"        listen [::]:80 default_server;",
		"",
		`        root ${config.remoteRoot};`,
		"        index index.html index.htm;",
		"",
		`        server_name ${config.domain} www.${config.domain};`,
		"",
		"        location / {",
		"                try_files $uri $uri/ /404.html;",
		"        }",
		"}",
	].join("\n");

	const remoteScript = [
		"set -e",
		"rm -rf /tmp/firefly-dist",
		"mkdir -p /tmp/firefly-dist",
		`tar -xzf /tmp/${config.archiveName} -C /tmp/firefly-dist`,
		`mkdir -p ${config.remoteRoot}`,
		`find ${config.remoteRoot} -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +`,
		`cp -a /tmp/firefly-dist/. ${config.remoteRoot}/`,
		`chown -R www-data:www-data ${config.remoteRoot}`,
		`chmod -R u=rwX,g=rX,o=rX ${config.remoteRoot}`,
		`cat > /etc/nginx/sites-available/default <<'NGINX_CONFIG'\n${nginxConfig}\nNGINX_CONFIG`,
		"nginx -t",
		"systemctl reload nginx",
		`rm -rf /tmp/firefly-dist /tmp/${config.archiveName}`,
		`test -f ${config.remoteRoot}/index.html`,
		`test -f ${config.remoteRoot}/rss.xml`,
		`test -f ${config.remoteRoot}/sitemap-index.xml`,
	].join("\n");

	ssh(remoteScript);

	log("Cleaning local archive");
	rmSync(archivePath, { force: true });

	log("Verifying public pages");
	const [home, rss, sitemap] = await Promise.all([
		httpCheck("/"),
		httpCheck("/rss.xml"),
		httpCheck("/sitemap-index.xml"),
	]);

	if (!home.includes("Aeghur")) {
		throw new Error("Homepage check failed: expected Aeghur in HTML.");
	}
	if (!rss.includes(`http://${config.domain}/`)) {
		throw new Error("RSS check failed: canonical domain was not found.");
	}
	if (!sitemap.includes(`http://${config.domain}/`)) {
		throw new Error("Sitemap check failed: canonical domain was not found.");
	}

	console.log(`\nDeployed ${basename(resolve("."))} to http://${config.domain}/`);
}

main().catch((error) => {
	console.error(`\nDeploy failed: ${error.message}`);
	process.exit(1);
});
