import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { sep } from "node:path";
import test, { afterEach, beforeEach } from "node:test";

import { createProject } from "./create-project.ts";

let dir: string;

beforeEach(async () => {
	dir = await mkdtemp(tmpdir() + sep);
	process.chdir(dir);
});

afterEach(async () => {
	await rm(dir, { recursive: true });
});

test("correct", async () => {
	const targetDir = await createProject("foo");
	assert.ok(existsSync(targetDir));
	assert.ok((await readdir(dir)).includes("foo"));
});

test("does not throw if subdirectory is specified", async () => {
	const targetDir = await createProject("foo/bar");
	assert.ok(existsSync(targetDir));
	assert.ok((await readdir(dir)).includes("foo"));
});
