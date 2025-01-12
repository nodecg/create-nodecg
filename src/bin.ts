#! /usr/bin/env node

import { cp, readdir, rename, stat } from "node:fs/promises";
import { isAbsolute, join, sep } from "node:path";

import { confirm, input, select } from "@inquirer/prompts";
import filenamify from "filenamify";
import { replaceInFile } from "replace-in-file";
import validateNpmPackageName from "validate-npm-package-name";

import { createProject } from "./create-project.ts";
import { commitInitialFiles, initializeGit } from "./git.ts";
import { installDependencies } from "./install-depedencies.ts";
import { getLatestVersion } from "./npm.ts";

const templateName = await select<"Basic" | "TypeScript">({
	message: "Select a template",
	choices: ["Basic", "TypeScript"],
	default: "TypeScript",
});
const templateDir = templateName.toLowerCase();

const projectName = await input({
	message: "The new project name",
	required: true,
	validate: async (input) => {
		if (input.trim() === "") {
			return "Project name cannot be empty";
		}
		if (isAbsolute(input)) {
			return "Absolute path is not allowed";
		}
		const pathStats = await stat(input).catch(() => null);
		if (pathStats) {
			if (pathStats.isDirectory()) {
				return "Directory already exists";
			}
			return "File with same path already exists";
		}

		return true;
	},
});

const bundleName = await input({
	message: "The new bundle name",
	required: true,
	default: filenamify(projectName, { replacement: "-" }),
	validate: (input) => {
		const { errors, validForNewPackages } = validateNpmPackageName(input);
		if (!validForNewPackages) {
			return errors ? `Invalid name: ${errors.join(", ")}` : "Invalid name";
		}
		return true;
	},
});

const shouldInitializeGit = await confirm({ message: "Initialize git repo?" });

const packageManager = await select<"npm" | "yarn" | "pnpm" | "others">({
	message: "Select package manager",
	choices: ["npm", "yarn", "pnpm", "others"],
	default: "npm",
});

const projectPath = await createProject(projectName);

await cp(
	join(import.meta.dirname, "../templates", templateDir),
	projectPath + sep,
	{ recursive: true },
);

const replaceFiles = (await readdir(projectPath)).filter((file) =>
	file.startsWith("__"),
);
await Promise.all(
	replaceFiles.map(async (file) => {
		await rename(
			join(projectPath, file),
			join(projectPath, file.replace(/^__/, "")),
		);
	}),
);

const [nodecgVersion, typescriptVersion] = await Promise.all([
	getLatestVersion("nodecg", "pr796"),
	getLatestVersion("typescript"),
]);
await replaceInFile({
	files: join(projectPath, "package.json"),
	from: ["${NAME}", "${NODECG_VERSION}", "${TYPESCRIPT_VERSION}"],
	to: [bundleName, nodecgVersion, "~" + typescriptVersion],
});

if (packageManager !== "others") {
	await installDependencies(packageManager, projectPath);
}

if (shouldInitializeGit) {
	await initializeGit(projectPath);
	await commitInitialFiles(projectPath);
}
