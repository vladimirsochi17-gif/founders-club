import path from "node:path";
import { readFile } from "node:fs/promises";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config.js";
import { pool } from "./db/pool.js";
import { loadAuth } from "./lib/auth.js";
import { asyncRoute, errorHandler, HttpError } from "./lib/http.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { billingRouter } from "./routes/billing.js";
import { projectsRouter } from "./routes/projects.js";
import { promotionsRouter } from "./routes/promotions.js";
import { publicRouter } from "./routes/public.js";
import { resourcesRouter } from "./routes/resources.js";
import { stateRouter } from "./routes/state.js";
import { knownPage } from "./lib/routes.js";
import { requestsRouter } from "./routes/requests.js";
import { fileStore } from "./lib/storage.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  if (config.PUBLIC_SANDBOX) {
    app.use((_request, response, next) => { response.setHeader("X-Robots-Tag", "noindex,nofollow,noarchive"); next(); });
    app.get("/robots.txt", (_request, response) => { response.type("text/plain").send("User-agent: *\nDisallow: /\n"); });
    app.use("/api/admin", (_request, response) => { response.status(403).json({ error: { code: "sandbox_admin_disabled", message: "Админка недоступна в публичной песочнице." } }); });
  }
  app.set("trust proxy", config.TRUST_PROXY);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", "data:"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'"],
          scriptSrc: ["'self'"],
          upgradeInsecureRequests: config.NODE_ENV === "production" ? [] : null,
        },
      },
      crossOriginResourcePolicy: { policy: "same-origin" },
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "512kb" }));
  app.use(express.urlencoded({ extended: false, limit: "64kb" }));
  app.use(cookieParser());
  app.use(loadAuth);
  app.use("/api", (request, response, next) => {
    response.setHeader("Cache-Control", "no-store");
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      const origin = request.get("origin");
      if (request.get("sec-fetch-site") === "cross-site" ||
          (origin && origin !== new URL(config.APP_ORIGIN).origin)) {
        next(new HttpError(403, "Запрос с другого сайта запрещён.", "invalid_origin"));
        return;
      }
    }
    next();
  });
  app.get("/uploads/:key", asyncRoute(async (request, response) => {
    const key = request.params.key as string;
    if (!/^[a-f0-9-]{36}\.(png|jpg|webp)$/.test(key))
      throw new HttpError(404, "Файл не найден.", "not_found");
    const result = await pool.query(
      `select pm.mime_type from project_media pm join projects p on p.id = pm.project_id
       where pm.storage_key = $1 and p.deleted_at is null and
       (p.status = 'published' or p.owner_id = $2 or $3::boolean)`,
      [key, request.auth?.id || null, !!request.auth && ["moderator", "admin", "superadmin"].includes(request.auth.role)],
    );
    if (!result.rowCount) throw new HttpError(404, "Файл не найден.", "not_found");
    response.setHeader("Cache-Control", "private, no-store");
    response.type(result.rows[0].mime_type);
    await fileStore.send(key, response);
  }));

  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      limit: 240,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );

  app.get("/api/health", async (_request, response, next) => {
    try {
      const database = await pool.query<{ now: Date }>("select now()");
      response.json({
        data: {
          status: "ok",
          database: "ok",
          databaseTime: database.rows[0].now,
          version: process.env.npm_package_version || "0.1.0",
          uptimeSeconds: Math.floor(process.uptime()),
        },
      });
    } catch (error) {
      next(error);
    }
  });

  app.use("/api/auth", authRouter);
  app.use("/api/state", stateRouter);
  app.use("/api/public", publicRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/resources", resourcesRouter);
  app.use("/api/billing", billingRouter);
  app.use("/api/promotions", promotionsRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/requests", requestsRouter);

  app.use("/api", (_request, response) => {
    response
      .status(404)
      .json({
        error: { code: "not_found", message: "API-маршрут не найден." },
      });
  });

  if (config.NODE_ENV === "production" || config.SERVE_STATIC) {
    const webRoot = path.resolve(process.cwd(), "dist", "web");
    app.get("/robots.txt", (_request, response) => {
      response.type("text/plain").send(
        `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /admin\nDisallow: /checkout\nDisallow: /auth\nSitemap: ${config.APP_ORIGIN}/sitemap.xml\n`,
      );
    });
    app.get(
      "/sitemap.xml",
      asyncRoute(async (_request, response) => {
        const projectRows = await pool.query<{ slug: string; updated_at: Date }>(
          "select slug::text, updated_at from projects where status = 'published' and deleted_at is null order by slug",
        );
        const staticPaths = [
          "/",
          "/projects",
          "/projects/new",
          "/projects/trending",
          "/wall",
          "/vault",
          "/arsenal",
          "/kits",
          "/club",
          "/pricing",
          "/faq",
          "/about",
          "/journal",
        ];
        const urls = [
          ...staticPaths.map((route) => ({ route, updated: null as Date | null })),
          ...projectRows.rows.map((project) => ({
            route: `/p/${encodeURIComponent(project.slug)}`,
            updated: project.updated_at,
          })),
        ];
        const xml = urls
          .map(
            ({ route, updated }) =>
              `<url><loc>${config.APP_ORIGIN}${route}</loc>${
                updated ? `<lastmod>${updated.toISOString()}</lastmod>` : ""
              }</url>`,
          )
          .join("");
        response
          .type("application/xml")
          .send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`);
      }),
    );
    app.use(
      express.static(webRoot, {
        index: false,
        maxAge: "1y",
        immutable: true,
        setHeaders(response, filePath) {
          if (!/-[a-zA-Z0-9_-]{8,}\.[a-z0-9]+$/.test(path.basename(filePath)))
            response.setHeader("Cache-Control", "no-cache");
        },
      }),
    );
    app.use((request, response, next) => {
      if (request.method !== "GET" || !request.accepts("html")) {
        next();
        return;
      }
      void (async () => {
        let title = "Founders Club — проекты независимых авторов";
        let description =
          "Каталог независимых проектов, библиотека инструментов и сообщество авторов.";
        let statusCode = request.path !== "/404" && knownPage(request.path) ? 200 : 404;
        if (request.path.startsWith("/p/")) {
          let slug: string;
          try { slug = decodeURIComponent(request.path.split("/")[2] || ""); }
          catch { throw new HttpError(400, "Некорректный адрес.", "invalid_path"); }
          const project = await pool.query<{ name: string; short_description: string }>(
            "select name, short_description from projects where slug = $1 and status = 'published' and deleted_at is null",
            [slug],
          );
          if (project.rowCount) {
            title = `${project.rows[0].name} — Founders Club`;
            description = project.rows[0].short_description;
          } else statusCode = 404;
        } else if (request.path.startsWith("/projects")) {
          title = "Каталог проектов — Founders Club";
        } else if (request.path.startsWith("/pricing")) {
          title = "Тарифы — Founders Club";
        } else if (request.path.startsWith("/vault")) {
          title = "Design Vault — Founders Club";
        }
        const privateRoute = /^(\/dashboard|\/admin|\/checkout|\/auth|\/account|\/settings|\/login|\/signup|\/recover|\/verify|\/onboarding|\/_review|\/projects\/create)/.test(
          request.path,
        );
        const escape = (value: string) =>
          value.replace(/[&<>"']/g, (character) =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
              character
            ]!,
          );
        const template = await readFile(path.join(webRoot, "index.html"), "utf8");
        const html = template
          .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
          .replace(
            /<meta name="description" content=".*?"\s*\/>/,
            `<meta name="description" content="${escape(description)}" />`,
          )
          .replace(
            "</head>",
            `<link rel="canonical" href="${config.APP_ORIGIN}${escape(request.path)}" /><meta name="robots" content="${
              config.PUBLIC_SANDBOX || privateRoute || statusCode !== 200 ? "noindex,nofollow" : "index,follow"
            }" /></head>`,
          );
        response.setHeader("Cache-Control", "no-cache");
        const sandboxBanner = '<aside aria-label="Тестовый режим" style="padding:10px 16px;background:#171717;color:#fff;text-align:center;font:13px/1.5 system-ui,sans-serif">Песочница · Используйте вымышленный email. Код показывается на экране, письма не отправляются. Вход привязан к этому браузеру. Оплата тестовая, без списаний. Данные могут быть удалены.</aside>';
        response.status(statusCode).type("html").send(config.PUBLIC_SANDBOX ? html.replace('<body>', '<body>' + sandboxBanner) : html);
      })().catch(next);
    });
  }

  app.use(errorHandler);
  return app;
}
