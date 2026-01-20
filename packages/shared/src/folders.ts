import { homedir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const HANGAR_DIR = join(homedir(), '.hangar');
export const HANGAR_CONFIG_PATH = join(HANGAR_DIR, 'config.json');
export const HANGAR_DB_PATH = join(HANGAR_DIR, 'hangar.sqlite');

export const DEFAULT_CONFIG_PATH = join(__dirname, 'default-config.json');
export const DOCKERFILES_DIR = join(__dirname, 'dockerfiles');
export const DEFAULT_DOCKERFILE_PATH = join(DOCKERFILES_DIR, 'default.Dockerfile');
export const DRIZZLE_MIGRATIONS_DIR = join(__dirname, '../drizzle');

export const PROJECT_DIR = '.hangar';
export const PROJECT_CONFIG_FILE = 'config.json';

export const USER_CONFIGS = {
  opencode: {
    config: join(homedir(), '.config', 'opencode'),
    auth: join(homedir(), '.local', 'share', 'opencode', 'auth.json'),
    configFile: join(homedir(), '.config', 'opencode', 'opencode.json'),
  },
  claude: {
    config: join(homedir(), '.claude'),
    md: join(homedir(), '.claude', 'CLAUDE.md'),
  },
} as const;

export function projectConfigPath(cwd: string): string {
  return join(cwd, PROJECT_DIR, PROJECT_CONFIG_FILE);
}

export function projectHangarDir(cwd: string): string {
  return join(cwd, PROJECT_DIR);
}
