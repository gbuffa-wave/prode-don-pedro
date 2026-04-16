import { z } from "zod";

// ─── Shared primitives ─────────────────────────────────────────────
export const uuidSchema = z.string().uuid();
export const matchIdSchema = z.number().int().positive();
export const scoreSchema = z.number().int().min(0).max(30);

// ─── Role (whitelist) ──────────────────────────────────────────────
export const userRoleSchema = z.enum(["player", "admin"]);

// ─── /api/onboarding ───────────────────────────────────────────────
export const onboardingBodySchema = z.object({
  team: z.string().min(1).max(80),
});

// ─── /api/champion ─────────────────────────────────────────────────
export const championBodySchema = z.object({
  code: z.string().min(2).max(5),
});

// ─── /api/admin/match-result ───────────────────────────────────────
export const matchResultBodySchema = z.object({
  matchId: matchIdSchema,
  homeScore: scoreSchema,
  awayScore: scoreSchema,
});

// ─── /api/admin/users (PUT/DELETE) ─────────────────────────────────
export const adminUpdateUserBodySchema = z
  .object({
    userId: uuidSchema,
    team: z.string().min(1).max(80).nullable().optional(),
    role: userRoleSchema.optional(),
  })
  .refine((v) => v.team !== undefined || v.role !== undefined, {
    message: "Debe incluir al menos team o role",
  });

export const adminDeleteUserBodySchema = z.object({
  userId: uuidSchema,
});

// ─── /api/admin/teams ──────────────────────────────────────────────
export const adminCreateTeamBodySchema = z.object({
  name: z.string().min(1).max(80),
  icon: z.string().min(1).max(40).optional(),
});

export const adminUpdateTeamBodySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(80),
  icon: z.string().min(1).max(40),
});

export const adminDeleteTeamBodySchema = z.object({
  id: z.number().int().positive(),
});

// ─── /api/admin/prizes ─────────────────────────────────────────────
export const adminPrizesBodySchema = z.object({
  prizes: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        description: z.string().max(500).nullable().optional(),
        image_url: z.string().url().max(500).nullable().optional(),
      })
    )
    .max(20),
});

// ─── /api/admin/champion ───────────────────────────────────────────
export const adminChampionBodySchema = z.object({
  champion: z
    .object({
      name: z.string().min(1).max(80),
      code: z.string().min(2).max(5),
    })
    .nullable(),
});

// ─── /api/admin/scoring ────────────────────────────────────────────
export const adminScoringBodySchema = z.object({
  rules: z
    .array(
      z.object({
        id: z.number().int().positive(),
        points: z.number().int().min(0).max(1000),
        is_active: z.boolean(),
      })
    )
    .min(1)
    .max(20),
});

// ─── /api/send-reminders ───────────────────────────────────────────
export const sendRemindersBodySchema = z
  .object({
    test: z.boolean().optional(),
  })
  .default({});

// ─── Helper: parsea JSON body y devuelve NextResponse 400 si inválido ─
import { NextResponse } from "next/server";

export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<{ data: z.infer<T> } | { error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    raw = {};
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: "Invalid request body", issues: result.error.issues },
        { status: 400 }
      ),
    };
  }
  return { data: result.data };
}
