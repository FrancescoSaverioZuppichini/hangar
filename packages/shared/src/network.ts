import { createServer } from 'net';

export async function findAvailablePort(start: number, max = 10): Promise<number> {
  for (let i = 0; i < max; i++) {
    const port = start + i;
    const available = await new Promise<boolean>(resolve => {
      const server = createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => { server.close(); resolve(true); });
      server.listen(port);
    });
    if (available) return port;
  }
  throw new Error(`No available port found between ${start} and ${start + max - 1}`);
}

export const network = { findAvailablePort };
