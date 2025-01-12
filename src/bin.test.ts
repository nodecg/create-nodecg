import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { EOL, tmpdir } from "node:os";
import { join, sep } from "node:path";
import type { Readable } from "node:stream";

import { afterEach, beforeEach, test } from "vitest";

const runBin = () => {
	const { stdin, stdout, stderr } = execFile("node", [
		"--experimental-strip-types",
		join(import.meta.dirname, "bin.ts"),
	]);
	if (!stdin || !stdout || !stderr) {
		throw new Error("stdio is null");
	}
	return { stdin, stdout, stderr };
};

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

let dir: string;

beforeEach(async () => {
	dir = await mkdtemp(tmpdir() + sep);
	process.chdir(dir);
});

afterEach(async () => {
	await rm(dir, { recursive: true });
});

test("correct", async () => {
	const { stdout, stdin } = runBin();
	await waitForLine(stdout, "template");
	stdin.write(EOL);
});
