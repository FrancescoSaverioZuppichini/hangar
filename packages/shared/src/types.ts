export interface GlobalConfig {
  ui?: {
    port?: number;
  };
  github?: {
    pat?: string;
  };
  e2b?: {
    apiKey?: string;
  };
  defaults?: {
    template?: string;
    timeoutMinutes?: number;
    autoBranch?: boolean;
  };
  userConfigs?: Record<string, string>;
}

export interface SandboxConfig {
  alias: string;
  repoUrl: string;
  branch: string;
  dockerfilePath?: string;
  cpuCount?: number;
  memoryMb?: number;
}

export interface BuildConfig extends SandboxConfig {
  githubPat: string;
  envVars?: Record<string, string>;
  userConfigs?: Record<string, string>;
}

export interface ProjectConfig {
  repo?: {
    url?: string;
    defaultBranch?: string;
  };
  envFiles?: string[];
  sandbox?: SandboxConfig;
  ui?: GlobalConfig['ui'];
  github?: GlobalConfig['github'];
  e2b?: GlobalConfig['e2b'];
  defaults?: GlobalConfig['defaults'];
}

export interface HangarConfig extends GlobalConfig {
  cwd: string;
  project: ProjectConfig | null;
  sandbox: BuildConfig | null;
}

export interface SandboxInstance {
  sandboxId: string;
  urls: {
    vscode: string;
    app: string;
    terminal: string;
    opencode: string;
  };
  kill: () => Promise<void>;
  pause: () => Promise<boolean>;
  runCommand: (cmd: string) => Promise<{ exitCode: number; stdout: string; stderr: string }>;
}

export interface GitInfo {
  isRepo: boolean;
  remoteUrl: string | null;
  repoName: string | null;
  currentBranch: string | null;
}

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
}
