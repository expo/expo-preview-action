import { warning, info } from '@actions/core';
import { Android, Ios } from 'uri-scheme';
import { PlatformSpecificProjectConfig, ProjectFlavor } from './config';
import { pathExists } from 'fs-extra';
import * as path from 'path';
import { getConfig } from '@expo/config';

async function isBare(config: PlatformSpecificProjectConfig): Promise<boolean> {
  if (config.manifestPath || config.infoPlist) {
    return true;
  }

  const androidDir = await pathExists(path.join(config.projectRoot || '.', 'android'));
  const iosDir = await pathExists(path.join(config.projectRoot || '.', 'ios'));

  return androidDir || iosDir;
}

async function discoverSchemesFromNativeProjects(config: PlatformSpecificProjectConfig): Promise<string[]> {
  try {
    const basicOptions = {
      projectRoot: config.projectRoot || '.',
    };
    const iOSSchemes: string[] = await Ios.getAsync({ ...basicOptions, infoPath: config.infoPlist });
    const androidSchemes: string[] = await Android.getAsync({
      ...basicOptions,
      manifestPath: config.manifestPath,
    });
    const commonSchemes = androidSchemes.filter(x => iOSSchemes.includes(x));
    return commonSchemes;
  } catch (exception) {
    warning(exception);
    // We cannot find common schemes. So we return empty array
    return [];
  }
}

export async function chooseScheme(config: PlatformSpecificProjectConfig & { scheme?: string }): Promise<string> {
  if (config.projectFlavor === ProjectFlavor.ExpoGo) {
    return 'exp';
  }

  if (config.scheme) {
    return config.scheme;
  }

  if (await isBare(config)) {
    info('Trying to guess scheme present in the bare React Native project...');
    const commonSchemes = await discoverSchemesFromNativeProjects(config);
    info(`Common schemes:
	\t${commonSchemes.join('\n\t')}`);

    return commonSchemes[0] || 'exp';
  }

  try {
    info('Trying to get scheme from Expo config...');
    const appJson = getConfig(config.projectRoot || '.');
    return appJson.exp.scheme || 'exp';
  } catch (exception) {
    warning(exception);
    return 'exp';
  }
}
