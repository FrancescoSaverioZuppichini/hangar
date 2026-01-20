import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { env } from './env.js';
import {
  HANGAR_DIR,
  HANGAR_CONFIG_PATH,
  DEFAULT_CONFIG_PATH,
  projectConfigPath,
  projectHangarDir,
} from './folders.js';
import type { GlobalConfig, ProjectConfig, HangarConfig } from './types.js';

function ensureGlobalDir(): void {
  if (!existsSync(HANGAR_DIR)) mkdirSync(HANGAR_DIR, { recursive: true });
  if (!existsSync(HANGAR_CONFIG_PATH)) writeFileSync(HANGAR_CONFIG_PATH, readFileSync(DEFAULT_CONFIG_PATH, 'utf-8'));
}

function readGlobal(): GlobalConfig {
  ensureGlobalDir();
  return JSON.parse(readFileSync(HANGAR_CONFIG_PATH, 'utf-8'));
}

function readProject(cwd: string): ProjectConfig | null {
  const p = projectConfigPath(cwd);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf-8')) : null;
}

function load(cwd: string = process.cwd()): HangarConfig {
  const global = readGlobal();
  const project = readProject(cwd);

  let sandbox = null;
  if (global.github?.pat && project?.sandbox) {
    const envVars = project.envFiles?.length ? env.loadAll(cwd, project.envFiles) : {};
    sandbox = { ...project.sandbox, githubPat: global.github.pat, envVars, userConfigs: global.userConfigs };
  }

  return { ...global, cwd, project, sandbox };
}

function save(location: 'global' | 'project', data: GlobalConfig | ProjectConfig, cwd: string = process.cwd()): void {
  if (location === 'global') {
    ensureGlobalDir();
    writeFileSync(HANGAR_CONFIG_PATH, JSON.stringify(data, null, 2));
  } else {
    const dir = projectHangarDir(cwd);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(projectConfigPath(cwd), JSON.stringify(data, null, 2));
  }
}

export const config = { load, save };
