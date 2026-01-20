import { z } from 'zod';

export const SandboxStatusSchema = z.enum(['running', 'stopped', 'paused', 'error']);
export type SandboxStatus = z.infer<typeof SandboxStatusSchema>;

export const SandboxFilterSchema = z.object({
  status: SandboxStatusSchema.optional(),
  template: z.string().optional(),
});
export type SandboxFilter = z.infer<typeof SandboxFilterSchema>;
