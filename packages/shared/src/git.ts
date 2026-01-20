import { execSync } from 'child_process';
import type { GitInfo, GitHubRepoInfo } from './types.js';

function execGit(args: string, cwd: string): string | null {
  try {
    return execSync(`git ${args}`, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

function parseRepoName(url: string): string {
  const match = url.match(/[/:]([^/]+)\/([^/.]+)(?:\.git)?$/);
  return match ? match[2] : url;
}

function parseGitHubUrl(url: string): GitHubRepoInfo | null {
  const httpsMatch = url.match(/github\.com\/([^/]+)\/([^/.]+)/);
  if (httpsMatch) return { owner: httpsMatch[1], repo: httpsMatch[2].replace('.git', '') };
  const sshMatch = url.match(/git@github\.com:([^/]+)\/([^/.]+)/);
  if (sshMatch) return { owner: sshMatch[1], repo: sshMatch[2].replace('.git', '') };
  return null;
}

async function validatePat(pat: string, owner: string, repo: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `Bearer ${pat}`, Accept: 'application/vnd.github+json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

function getInfo(cwd: string = process.cwd()): GitInfo {
  const isRepo = execGit('rev-parse --is-inside-work-tree', cwd) === 'true';
  if (!isRepo) return { isRepo: false, remoteUrl: null, repoName: null, currentBranch: null };

  const remoteUrl = execGit('remote get-url origin', cwd);
  const currentBranch = execGit('rev-parse --abbrev-ref HEAD', cwd);
  const repoName = remoteUrl ? parseRepoName(remoteUrl) : null;

  return { isRepo, remoteUrl, repoName, currentBranch };
}

export const git = {
  getInfo,
  parseGitHubUrl,
  validatePat,
};
