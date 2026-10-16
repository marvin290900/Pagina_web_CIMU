import { z } from 'zod';
import { MODULES, SECTIONS, ROLE_LABELS } from './roles.js';
export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z.string().min(12, 'Usa al menos 12 caracteres').refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'La contraseña supera los 72 bytes admitidos por bcrypt');
export const assignmentSchema = z.object({
  role: z.enum(Object.keys(ROLE_LABELS)),
  modules: z.array(z.enum(MODULES)).max(MODULES.length).default([]),
  sections: z.array(z.enum(['*', ...SECTIONS])).max(SECTIONS.length + 1).default([]),
}).strict().superRefine((value, ctx) => {
  if (value.role !== 'administrador' && !value.modules.length) ctx.addIssue({ code: 'custom', message: 'Selecciona al menos un módulo' });
  if (value.role !== 'administrador' && value.modules.includes('gaceta') && !value.sections.length) ctx.addIssue({ code: 'custom', message: 'Selecciona las secciones de Gaceta' });
});
export const accountSchema = z.object({ email: emailSchema, name: z.string().trim().min(2).max(120), assignments: z.array(assignmentSchema).min(1).max(12) }).strict();
export const updateAccountSchema = z.object({ name: z.string().trim().min(2).max(120), status: z.enum(['active', 'disabled', 'invited']), assignments: z.array(assignmentSchema).min(1).max(12), version: z.number().int().nonnegative() }).strict();
export const idSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/);
