import { defineConfig } from 'drizzle-kit';
import { homedir } from 'os';
import { join } from 'path';

export default defineConfig({
  schema: './src/schemas.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: `file:${join(homedir(), '.hangar', 'hangar.sqlite')}`,
  },
});
