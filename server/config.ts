import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  SERVE_STATIC: z
    .string()
    .transform((value) => value === "1" || value === "true")
    .default(false),
  PORT: z.coerce.number().int().positive().default(8787),
  APP_ORIGIN: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default(
      "postgres://founders:founders_local@localhost:54329/founders_club",
    ),
  DATABASE_SCHEMA: z.enum(["public", "founders_sandbox"]).default("public"),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(12).default(4),
  SUPABASE_PROJECT_REF: z.string().regex(/^[a-z]{20}$/).or(z.literal("")).default(""),
  STORAGE_PROVIDER: z.enum(["local", "supabase"]).default("local"),
  SUPABASE_URL: z.url().or(z.literal("")).default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(""),
  SUPABASE_STORAGE_BUCKET: z.string().regex(/^[a-z0-9-]+$/).default("founders-media"),
  SESSION_COOKIE_NAME: z.string().min(1).default("fc_session"),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  AUTH_HASH_SECRET: z
    .string()
    .min(24)
    .default("development-only-secret-change-me"),
  LOCAL_AUTH_DEV_CODE: z
    .string()
    .regex(/^\d{6}$/)
    .or(z.literal(""))
    .default("123456"),
  PAYMENTS_MODE: z.enum(["mock", "disabled"]).default("mock"),
  SEED_DEMO: z
    .string()
    .transform((value) => value === "1" || value === "true")
    .default(true),
  FOUNDER_PROJECT_LIMIT: z.coerce.number().int().min(1).default(1),
  PLUS_PROJECT_LIMIT: z.coerce.number().int().min(1).default(3),
  UPLOAD_DIR: z.string().min(1).default("./data/uploads"),
  TELEGRAM_BOT_USERNAME: z.string().default(""),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .string()
    .transform((value) => value === "1" || value === "true")
    .default(false),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM: z.string().default("Founders Club <noreply@localhost>"),
  TRUST_PROXY: z.coerce.number().int().min(0).max(2).default(0),
  PUBLIC_SANDBOX: z.string().transform(value => value === "true").default(false),
});

export const config = schema
  .superRefine((value, ctx) => {
    const database = new URL(value.DATABASE_URL);
    const isolatedSupabase = value.DATABASE_SCHEMA === "founders_sandbox" &&
      !!value.SUPABASE_PROJECT_REF &&
      (database.hostname === `db.${value.SUPABASE_PROJECT_REF}.supabase.co` ||
       (database.hostname.endsWith(".pooler.supabase.com") && decodeURIComponent(database.username).endsWith(`.${value.SUPABASE_PROJECT_REF}`)));
    if (value.PUBLIC_SANDBOX && (value.NODE_ENV === "production" ||
        (!database.pathname.endsWith("_sandbox") && !isolatedSupabase) || value.SMTP_HOST)) {
      ctx.addIssue({ code: "custom", path: ["PUBLIC_SANDBOX"], message: "Public sandbox requires an isolated sandbox database/schema, no SMTP and non-production mode" });
    }
    if (value.STORAGE_PROVIDER === "supabase" && (!value.SUPABASE_SERVICE_ROLE_KEY ||
        value.SUPABASE_URL !== `https://${value.SUPABASE_PROJECT_REF}.supabase.co`)) {
      ctx.addIssue({ code: "custom", path: ["STORAGE_PROVIDER"], message: "Configure the matching Supabase project URL and a server-only secret key" });
    }
    if (value.NODE_ENV === "production" && value.SEED_DEMO)
      ctx.addIssue({ code: "custom", path: ["SEED_DEMO"], message: "Demo seeding is forbidden in production" });
    const origin = new URL(value.APP_ORIGIN);
    if (origin.pathname !== "/" || origin.search || origin.hash || origin.username || origin.password ||
        !["http:", "https:"].includes(origin.protocol) ||
        ((value.NODE_ENV === "production" || value.PUBLIC_SANDBOX) && origin.protocol !== "https:")) {
      ctx.addIssue({ code: "custom", path: ["APP_ORIGIN"], message: "Use a plain origin; production requires HTTPS" });
    }
    if (
      (value.NODE_ENV === "production" || value.PUBLIC_SANDBOX) &&
      value.AUTH_HASH_SECRET === "development-only-secret-change-me"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["AUTH_HASH_SECRET"],
        message: "Set a unique AUTH_HASH_SECRET in production or public sandbox",
      });
    }
    if (value.NODE_ENV === "production" && !value.SMTP_HOST) {
      ctx.addIssue({
        code: "custom",
        path: ["SMTP_HOST"],
        message: "SMTP is required for production authentication",
      });
    }
    if (value.NODE_ENV === "production" && value.PAYMENTS_MODE === "mock") {
      ctx.addIssue({
        code: "custom",
        path: ["PAYMENTS_MODE"],
        message: "Mock payments are forbidden in production",
      });
    }
  })
  .parse(process.env);
export const isProduction = config.NODE_ENV === "production";
