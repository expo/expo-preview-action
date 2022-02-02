import { getExecOutput } from "@actions/exec"
import { PublishConfig } from "./config"

export function findManifestUrl(text: string): string {
	const regex = /📝 {2}Manifest: ([^ ]*)/;
	const match = (text.match(regex) || [])[1];
	if (!match) {
		throw new Error("Couldn't extract manifest URL.");
	}

	return match;
}

export function findProjectPage(text: string): string {
	const regex = /⚙️ {3}Project page: ([^ ]*)/;

	const match = (text.match(regex) || [])[1];
	if (!match) {
		throw new Error("Couldn't extract project page URL.");
	}

	return match;
}

export async function publish(config: PublishConfig): Promise<{ manifestURL: string; projectPageURL: string }> {
	const { exitCode, stderr, stdout } = await getExecOutput(
		`${config.cliPath} publish --release-channel=${config.channel}`,
		undefined,
		{ cwd: config.projectRoot }
	);
	if (exitCode !== 0) {
		throw new Error(stderr);
	}
	const manifestURL = findManifestUrl(stdout);
	const projectPageURL = findProjectPage(stdout);

	return { manifestURL, projectPageURL };
}
