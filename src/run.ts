import { Config, ProjectFlavor } from './config';
import { group, getInput, setOutput, info } from '@actions/core';
import { publish } from './publish';
import { chooseScheme } from './scheme';
import { createQRCodeURL } from './url';
import { needNewDevClientBuild } from './github';
function undefinedIfEmpty(string: string): string | undefined {
	return string || undefined;
}

function parseProjectFlavor(flavor: string): ProjectFlavor | undefined {
	if (flavor === 'expo-go') {
		return ProjectFlavor.ExpoGo;
	} else if (flavor === 'development-client') {
		return ProjectFlavor.DevelopmentClient;
	}

	if (flavor) {
		throw new Error(`Invalid "project-flavor" value. available options: 'expo-go' or 'development-client'.`);
	}

	return undefined;
}

export async function run(): Promise<void> {
	const config: Config = {
		projectFlavor: parseProjectFlavor(getInput('project-flavor')) || ProjectFlavor.DevelopmentClient,
		channel: getInput('channel'),
		cliPath: getInput('expo-cli-path') || 'expo',
		scheme: undefinedIfEmpty(getInput('scheme')),
		projectRoot: undefinedIfEmpty(getInput('project-root')),
		manifestPath: undefinedIfEmpty(getInput('android-manifest-path')),
		infoPlist: undefinedIfEmpty(getInput('ios-info-plist-path')),
		token: getInput('token', { required: true }),
	};

	const scheme = await group('Choose scheme', async () => {
		const scheme = await chooseScheme(config);
		info(`Chosen scheme: ${scheme}`);
		return scheme;
	});

	const needToRebuildDevClient = await group('Check if a new version of the development client is required', () =>
		needNewDevClientBuild(config)
	);

	const manifestURL = await group('Publish application', () => publish(config));

	const QRCodeURL = await group('Create QRCode', () => {
		const qrCode = createQRCodeURL(config.projectFlavor, manifestURL, scheme);
		info(`QR Code is available under: ${qrCode}`);
		return Promise.resolve(qrCode);
	});

	setOutput('EXPO_MANIFEST_URL', manifestURL);
	setOutput('EXPO_QR_CODE_URL', QRCodeURL);
	setOutput('EXPO_NEW_BUILD_IS_REQUIRED', needToRebuildDevClient);
	setOutput(
		'EXPO_NEW_BUILD_IS_REQUIRED_MESSAGE',
		needToRebuildDevClient
			? `<strong>⚠️ Warning</strong>: To open this preview, you may need to rebuild your native application.`
			: ''
	);
}
