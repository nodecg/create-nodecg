import { mkdir } from "node:fs/promises";
import { join } from "node:path";

export async function createProject(projectPath: string) {
	const targetDir = join(process.cwd(), projectPath);
	await mkdir(targetDir, { recursive: true });
	return targetDir;
}
