import { URL } from 'url';
import qs from 'querystring';

import { ProjectFlavor } from './config';

type ExpoGoParams = {
  host: string;
  owner: string;
  slug: string;
  releaseChannel?: string;
};

function getExpoGoParams(manifestURL: string): ExpoGoParams {
  const url = new URL(manifestURL);
  const [owner, slug] = url.pathname.replace('/@', '').split('/', 2);

  return {
    owner,
    slug,
    host: url.hostname,
    releaseChannel: url.searchParams.get('release-channel') || undefined,
  };
}

const generateQRCodeBaseURL = 'https://qr.expo.dev';

export function createQRCodeURL(projectFlavor: ProjectFlavor, manifestURL: string, scheme: string): string {
  if (projectFlavor === ProjectFlavor.DevelopmentClient) {
    return `${generateQRCodeBaseURL}/development-client?appScheme=${scheme}&url=${manifestURL}`;
  } else if (projectFlavor === ProjectFlavor.ExpoGo) {
    const params = getExpoGoParams(manifestURL);
    return `${generateQRCodeBaseURL}/expo-go?${qs.stringify(params)}`;
  }

  throw new Error('Unknown project flavor.');
}
