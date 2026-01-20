import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

function find(cwd: string = process.cwd()): string[] {
  try {
    return readdirSync(cwd)
      .filter(f => f === '.env' || f.startsWith('.env.') || (f.includes('.env.') && !f.startsWith('.')))
      .sort();
  } catch {
    return [];
  }
}

function parse(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf-8')
      .split('\n')
      .filter(l => l.trim() && !l.trim().startsWith('#') && l.includes('='))
      .map(l => {
        const [k, ...v] = l.split('=');
        return [k.trim(), v.join('=').trim().replace(/^["']|["']$/g, '')];
      })
  );
}

function loadAll(cwd: string, files: string[]): Record<string, string> {
  const envs: Record<string, string> = {};
  for (const file of files) Object.assign(envs, parse(join(cwd, file)));
  return envs;
}

export const env = {
  find,
  parse,
  loadAll,
};
