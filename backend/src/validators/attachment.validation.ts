import { z } from 'zod';

export const AttachmentIdParamSchema = z.object({
  id: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: 'ID must be a valid number',
  }),
});
