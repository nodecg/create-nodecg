import validateNpmPackageName from "validate-npm-package-name";

export async function getLatestVersion(packageName: string, tag = "latest") {
	if (!validateNpmPackageName(packageName).validForNewPackages) {
		throw new Error(`Invalid package name: ${packageName}`);
	}
	const res = await fetch(`https://registry.npmjs.org/${packageName}/${tag}`);
	if (!res.ok) {
		throw new Error(`Failed to fetch package info: ${res.statusText}`);
	}
	const data = (await res.json()) as { name: string; version: string };
	return data.version;
}
