import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, { message: 'Please enter your email.' }).email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
