import { getExecOutput } from '@actions/exec';

import { PublishConfig } from './config';

export function findManifestUrl(text: string): string {
	const regex = /📝 {2}Manifest: ([^ ]*)/;
	const match = (text.match(regex) || [])[1];
	if (!match) {
		throw new Error("Couldn't extract manifest URL.");
	}

	return match;
}

export async function publish(config: PublishConfig): Promise<string> {
	const { exitCode, stderr, stdout } = await getExecOutput(
		`${config.cliPath} publish --release-channel=${config.channel}`,
		undefined,
		{ cwd: config.projectRoot },
	);
	if (exitCode !== 0) {
		throw new Error(stderr);
	}

	return findManifestUrl(stdout);
}
