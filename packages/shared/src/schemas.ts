import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  localPath: text().notNull().unique(),
  repoUrl: text(),
  branch: text(),
  templateAlias: text(),
  createdAt: int({ mode: 'timestamp' }).notNull(),
  updatedAt: int({ mode: 'timestamp' }).notNull(),
});

export const sandboxes = sqliteTable('sandboxes', {
  id: int().primaryKey({ autoIncrement: true }),
  sandboxId: text().notNull().unique(),
  projectId: int().references(() => projects.id),
  templateId: text().notNull(),
  status: text().notNull().default('running'),
  vsCodeUrl: text().notNull(),
  appUrl: text().notNull(),
  terminalUrl: text().notNull(),
  openCodeUrl: text().notNull(),
  startedAt: int({ mode: 'timestamp' }).notNull(),
  stoppedAt: int({ mode: 'timestamp' }),
});
