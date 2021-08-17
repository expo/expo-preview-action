import { ProjectFlavor } from './config';

const generateQRCodeBaseURLForGo = 'https://api.qrserver.com/v1/create-qr-code';
const generateQRCodeBaseURLForBare = 'https://us-central1-exponentjs.cloudfunctions.net';

export function createQRCodeURL(projectFlavor: ProjectFlavor, manifestURL: string, scheme: string): string {
	if (projectFlavor === ProjectFlavor.DevelopmentClient) {
		return `${generateQRCodeBaseURLForBare}/generateQRCode/development-client?appScheme=${scheme}&url=${manifestURL}`;
	} else if (projectFlavor === ProjectFlavor.ExpoGo) {
		return `${generateQRCodeBaseURLForGo}?size=512x512&data=${manifestURL.replace('https://', 'exp://')}`;
	}

	throw new Error('Unknown project flavor.');
}
