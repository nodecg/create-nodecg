import { mkdtemp, readFile, rm } from "node:fs/promises";
import { EOL, tmpdir } from "node:os";
import { join } from "node:path";
import type { Readable } from "node:stream";
import { afterEach } from "node:test";

import spawn from "nano-spawn";
import { beforeEach, describe, expect, test } from "vitest";

const waitForLine = (stdout: Readable, matcher?: RegExp | string) => {
	return new Promise<string>((resolve, reject) => {
		const onData = (data: string) => {
			if (matcher) {
				if (typeof matcher === "string") {
					if (!data.includes(matcher)) {
						return;
					}
				} else {
					if (!matcher.test(data)) {
						return;
					}
				}
			}
			stdout.removeListener("data", onData);
			stdout.removeListener("close", onClose);
			resolve(data);
		};
		const onClose = () => {
			stdout.removeListener("data", onData);
			stdout.removeListener("close", onClose);
			reject(new Error("stdout closed"));
		};
		stdout.addListener("data", onData);
		stdout.addListener("close", onClose);
	});
};

const runBin = async () => {
	const childProcess = spawn(
		join(import.meta.dirname, "node_modules/.bin/tsx"),
		[join(import.meta.dirname, "src/bin.ts")],
	);
	void (async () => {
		for await (const data of childProcess.stdout) {
			console.log(data);
		}
	})();
	const nodeChildProcess = await childProcess.nodeChildProcess;
	if (
		!nodeChildProcess.stdin ||
		!nodeChildProcess.stdout ||
		!nodeChildProcess.stderr
	) {
		throw new Error("stdio is null");
	}
	return {
		stdin: nodeChildProcess.stdin,
		stdout: nodeChildProcess.stdout,
		stderr: nodeChildProcess.stderr,
		waitForExit: async () => {
			await childProcess;
		},
	};
};

describe("CLI E2E Test", { timeout: 120_000 }, () => {
	let dir: string | null = null;

	beforeEach(async () => {
		dir = await mkdtemp(tmpdir() + "/");
		process.chdir(dir);
	});

	afterEach(async () => {
		if (dir) {
			await rm(dir, { recursive: true, force: true }).catch();
		}
	});

	test("Vanilla", async () => {
		if (!dir) {
			throw new Error("dir is null");
		}
		const { stdout, stdin, waitForExit } = await runBin();
		await waitForLine(stdout, "Select a template");
		stdin.write(EOL);
		await waitForLine(stdout, "The new project name");
		stdin.write("project" + EOL);
		await waitForLine(stdout, "The new bundle name");
		stdin.write(EOL);
		await waitForLine(stdout, "Initialize git repo?");
		stdin.write(EOL);
		await waitForLine(stdout, "Select package manager");
		stdin.write(EOL);
		await waitForExit();

		const packageJson = JSON.parse(
			await readFile(join(dir, "project/package.json"), "utf-8"),
		) as object;
		expect(packageJson).toMatchObject({ name: "project" });
		expect(Object.keys(packageJson)).toContain("nodecg");
	});
});
