import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';
import { mkdirSync, existsSync } from 'fs';
import { eq, and, like } from 'drizzle-orm';
import { projects, sandboxes } from './schemas.js';
import { HANGAR_DIR, HANGAR_DB_PATH, DRIZZLE_MIGRATIONS_DIR } from './folders.js';
import type { SandboxFilter } from './zod.js';

if (!existsSync(HANGAR_DIR)) mkdirSync(HANGAR_DIR, { recursive: true });

const client = createClient({ url: `file:${HANGAR_DB_PATH}` });
const drizzleDb = drizzle(client);

await migrate(drizzleDb, { migrationsFolder: DRIZZLE_MIGRATIONS_DIR });

export type NewProject = {
  name: string;
  localPath: string;
  repoUrl?: string | null;
  branch?: string | null;
  templateAlias?: string | null;
};

export type NewSandbox = {
  sandboxId: string;
  projectId?: number | null;
  templateId: string;
  vsCodeUrl: string;
  appUrl: string;
  terminalUrl: string;
  openCodeUrl: string;
};

async function upsertProject(data: NewProject) {
  const now = new Date();
  const existing = await drizzleDb.select().from(projects).where(eq(projects.localPath, data.localPath)).get();
  if (existing) {
    return drizzleDb.update(projects).set({ ...data, updatedAt: now }).where(eq(projects.localPath, data.localPath)).returning().get();
  }
  return drizzleDb.insert(projects).values({ ...data, createdAt: now, updatedAt: now }).returning().get();
}

function getProjects() {
  return drizzleDb.select().from(projects);
}

function getProjectByPath(localPath: string) {
  return drizzleDb.select().from(projects).where(eq(projects.localPath, localPath)).get();
}

function getProjectById(id: number) {
  return drizzleDb.select().from(projects).where(eq(projects.id, id)).get();
}

async function insertSandbox(data: NewSandbox) {
  return drizzleDb.insert(sandboxes).values({ ...data, startedAt: new Date(), status: 'running' }).returning().get();
}

function updateSandboxStatus(sandboxId: string, status: 'running' | 'stopped' | 'paused' | 'error') {
  const updates: Record<string, unknown> = { status };
  if (status === 'stopped' || status === 'error') updates.stoppedAt = new Date();
  return drizzleDb.update(sandboxes).set(updates).where(eq(sandboxes.sandboxId, sandboxId)).returning().get();
}

function getSandboxes() {
  return drizzleDb.select().from(sandboxes);
}

function getActiveSandboxes() {
  return drizzleDb.select().from(sandboxes).where(eq(sandboxes.status, 'running'));
}

function getSandboxesByProject(projectId: number) {
  return drizzleDb.select().from(sandboxes).where(eq(sandboxes.projectId, projectId));
}

function getSandboxById(sandboxId: string) {
  return drizzleDb.select().from(sandboxes).where(eq(sandboxes.sandboxId, sandboxId)).get();
}

function filterSandboxes(filter: SandboxFilter) {
  const conditions = [];
  if (filter.status) conditions.push(eq(sandboxes.status, filter.status));
  if (filter.template) conditions.push(like(sandboxes.templateId, `${filter.template}%`));
  if (conditions.length === 0) return drizzleDb.select().from(sandboxes);
  if (conditions.length === 1) return drizzleDb.select().from(sandboxes).where(conditions[0]);
  return drizzleDb.select().from(sandboxes).where(and(...conditions));
}

export const db = {
  raw: drizzleDb,
  projects: {
    upsert: upsertProject,
    getAll: getProjects,
    getByPath: getProjectByPath,
    getById: getProjectById,
  },
  sandboxes: {
    insert: insertSandbox,
    updateStatus: updateSandboxStatus,
    getAll: getSandboxes,
    getActive: getActiveSandboxes,
    getByProject: getSandboxesByProject,
    getById: getSandboxById,
    filter: filterSandboxes,
  },
};
