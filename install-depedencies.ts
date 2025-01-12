import { appendFile } from "node:fs/promises";

import spawn from "nano-spawn";

export async function installDependencies(
	packageManager: "npm" | "yarn" | "pnpm",
	cwd: string,
) {
	switch (packageManager) {
		case "npm": {
			await spawn("npm", ["install"], { cwd });
			break;
		}
		case "yarn": {
			await spawn("yarn", ["set", "version", "stable"], { cwd });
			await appendFile(`${cwd}/.yarnrc.yml`, "nodeLinker: node-modules\n"); // https://yarnpkg.com/features/linkers
			await spawn("yarn", ["install"], { cwd });
			break;
		}
		case "pnpm": {
			await spawn("pnpm", ["install"], { cwd });
			break;
		}
	}
}
