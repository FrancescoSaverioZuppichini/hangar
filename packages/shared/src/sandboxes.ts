import { Sandbox, Template, waitForPort } from 'e2b';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import {
  DOCKERFILES_DIR,
  DEFAULT_DOCKERFILE_PATH,
  USER_CONFIGS,
  projectHangarDir,
} from './folders.js';
import type { BuildConfig, SandboxInstance } from './types.js';

export interface BuildResult {
  templateId: string;
  alias: string;
}

export interface ListItem {
  sandboxId: string;
  template: string;
  startedAt: Date;
}

function extractOwnerRepo(url: string): string {
  const httpsMatch = url.match(/github\.com\/([^/]+\/[^/.]+)/);
  if (httpsMatch) return httpsMatch[1].replace('.git', '');
  const sshMatch = url.match(/git@github\.com:([^/]+\/[^/.]+)/);
  if (sshMatch) return sshMatch[1].replace('.git', '');
  throw new Error(`Cannot parse GitHub URL: ${url}`);
}

function wrapSandbox(sbx: Sandbox): SandboxInstance {
  return {
    sandboxId: sbx.sandboxId,
    urls: {
      vscode: `https://${sbx.getHost(8080)}`,
      app: `https://${sbx.getHost(3000)}`,
      terminal: `https://${sbx.getHost(7681)}`,
      opencode: `https://${sbx.getHost(4096)}?folder=/home/user/app`
    },
    kill: () => sbx.kill(),
    pause: () => sbx.betaPause(),
    runCommand: async (cmd: string) => {
      const result = await sbx.commands.run(cmd);
      return { exitCode: result.exitCode, stdout: result.stdout, stderr: result.stderr };
    }
  };
}

async function start(alias: string, command?: string, background?: boolean): Promise<SandboxInstance> {
  const sbx = await Sandbox.create(alias);
  if (command) {
    if (background) {
      sbx.commands.run(command, { background: true });
    } else {
      await sbx.commands.run(command);
    }
  }
  return wrapSandbox(sbx);
}

async function list(templateFilter?: string): Promise<ListItem[]> {
  const paginator = Sandbox.list({ query: { state: ['running'] } });
  const result: ListItem[] = [];
  do {
    const items = await paginator.nextItems();
    for (const s of items) {
      if (!templateFilter || s.name === templateFilter || s.name?.startsWith(templateFilter)) {
        result.push({ sandboxId: s.sandboxId, template: s.templateId, startedAt: s.startedAt });
      }
    }
  } while (paginator.hasNext);
  return result;
}

async function get(sandboxId: string): Promise<SandboxInstance> {
  const sbx = await Sandbox.connect(sandboxId);
  return wrapSandbox(sbx);
}

async function pause(sandboxId: string): Promise<void> {
  const sbx = await Sandbox.connect(sandboxId);
  await sbx.betaPause();
}

async function resume(sandboxId: string, command?: string, background?: boolean): Promise<SandboxInstance> {
  const sbx = await Sandbox.connect(sandboxId);
  if (command) {
    if (background) {
      sbx.commands.run(command, { background: true });
    } else {
      await sbx.commands.run(command);
    }
  }
  return wrapSandbox(sbx);
}

async function inspect(sandboxId: string): Promise<SandboxInstance> {
  return get(sandboxId);
}

async function kill(sandboxId: string): Promise<boolean> {
  return Sandbox.kill(sandboxId);
}

async function build(config: BuildConfig, cwd: string, onLog?: (log: string) => void): Promise<BuildResult> {
  const hangarDir = projectHangarDir(cwd);
  const startupDest = join(hangarDir, 'startup.sh');
  const userConfigsDir = join(hangarDir, 'user-configs');

  mkdirSync(hangarDir, { recursive: true });
  cpSync(join(DOCKERFILES_DIR, 'startup.sh'), startupDest);

  const dockerfilePath = config.dockerfilePath && existsSync(config.dockerfilePath)
    ? config.dockerfilePath
    : DEFAULT_DOCKERFILE_PATH;

  const dockerfileContent = readFileSync(dockerfilePath, 'utf-8')
    .replace('COPY startup.sh', 'COPY .hangar/startup.sh');

  const authUrl = `https://${config.githubPat}@github.com/${extractOwnerRepo(config.repoUrl)}.git`;

  try {
    let builder = Template({ fileContextPath: cwd })
      .fromDockerfile(dockerfileContent)
      .runCmd(`cd /home/user/app && git init && git remote add origin ${authUrl} && git fetch origin ${config.branch} && git checkout -f ${config.branch}`)
      .runCmd('cd /home/user/app && bun install || npm install || yarn install || true');

    if (existsSync(USER_CONFIGS.claude.md)) {
      const claudeDestDir = join(userConfigsDir, 'claude');
      mkdirSync(claudeDestDir, { recursive: true });
      cpSync(USER_CONFIGS.claude.md, join(claudeDestDir, 'CLAUDE.md'));
      builder = builder.copy('.hangar/user-configs/claude/CLAUDE.md', '/home/user/.claude/CLAUDE.md');
    }

    if (existsSync(USER_CONFIGS.opencode.auth) || existsSync(USER_CONFIGS.opencode.configFile)) {
      const opencodeDestDir = join(userConfigsDir, 'opencode');
      mkdirSync(opencodeDestDir, { recursive: true });
      if (existsSync(USER_CONFIGS.opencode.auth)) {
        cpSync(USER_CONFIGS.opencode.auth, join(opencodeDestDir, 'auth.json'));
        builder = builder.copy('.hangar/user-configs/opencode/auth.json', '/home/user/.local/share/opencode/auth.json');
      }
      if (existsSync(USER_CONFIGS.opencode.configFile)) {
        cpSync(USER_CONFIGS.opencode.configFile, join(opencodeDestDir, 'opencode.json'));
        builder = builder.copy('.hangar/user-configs/opencode/opencode.json', '/home/user/.config/opencode/opencode.json');
      }
    }

    if (config.envVars && Object.keys(config.envVars).length > 0) {
      builder = builder.setEnvs(config.envVars);
    }

    const template = builder.setStartCmd('bash -c /opt/startup.sh', waitForPort(8080));
    const result = await Template.build(template, {
      alias: config.alias,
      cpuCount: config.cpuCount || 2,
      memoryMB: config.memoryMb || 2048,
      skipCache: true,
      onBuildLogs: (log) => { if (onLog) onLog(log.message); },
    });

    rmSync(startupDest, { force: true });
    if (existsSync(userConfigsDir)) rmSync(userConfigsDir, { recursive: true, force: true });
    return { templateId: result.templateId, alias: config.alias };
  } catch (err: any) {
    rmSync(startupDest, { force: true });
    if (existsSync(userConfigsDir)) rmSync(userConfigsDir, { recursive: true, force: true });
    throw err;
  }
}

async function status(): Promise<{ synced: number }> {
  const { db } = await import('./db.js');
  const dbActive = await db.sandboxes.getActive();
  if (dbActive.length === 0) return { synced: 0 };

  const e2bRunning = new Set<string>();
  const paginator = Sandbox.list({ query: { state: ['running'] } });
  do {
    const items = await paginator.nextItems();
    items.forEach(s => e2bRunning.add(s.sandboxId));
  } while (paginator.hasNext);

  let synced = 0;
  for (const sandbox of dbActive) {
    if (!e2bRunning.has(sandbox.sandboxId)) {
      await db.sandboxes.updateStatus(sandbox.sandboxId, 'stopped');
      synced++;
    }
  }
  return { synced };
}

export const sandboxes = {
  start,
  list,
  inspect,
  kill,
  get,
  pause,
  resume,
  build,
  status,
};
