import spawn from "nano-spawn";

export async function initializeGit(cwd: string) {
	await spawn("git", ["init", "--initial-branch=main"], { cwd });
}

export async function commitInitialFiles(cwd: string) {
	await spawn("git", ["add", "."], { cwd });
	await spawn("git", ["commit", "-m", "Initial commit"], { cwd });
}
