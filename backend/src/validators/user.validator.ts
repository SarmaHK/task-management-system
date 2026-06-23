import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
  roleId: z.union([z.string(), z.number()]).transform((val) => Number(val)).refine((val) => [1, 2, 3].includes(val), {
    message: 'Invalid role ID provided',
  }),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
