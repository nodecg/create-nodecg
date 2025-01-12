import { existsSync } from "node:fs";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { sep } from "node:path";

import { afterEach, beforeEach, expect, test } from "vitest";

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
	expect(existsSync(targetDir)).toBe(true);
	expect(await readdir(dir)).toContain("foo");
});

test("does not throw if subdirectory is specified", async () => {
	const targetDir = await createProject("foo/bar");
	expect(existsSync(targetDir)).toBe(true);
	expect(await readdir(dir)).toContain("foo");
});
