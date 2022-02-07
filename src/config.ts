export enum ProjectFlavor {
  DevelopmentClient,
  ExpoGo,
}

export type ProjectConfig = {
  projectRoot?: string;
  projectFlavor: ProjectFlavor;
};

export type PublishConfig = ProjectConfig & {
  channel: string;
  cliPath: string;
  scheme?: string;
};

export type PlatformSpecificProjectConfig = ProjectConfig & {
  manifestPath?: string;
  infoPlist?: string;
};

export type GithubConfig = {
  token: string;
};

export type Config = PlatformSpecificProjectConfig & PublishConfig & GithubConfig;
