import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "request_error",
  ) {
    super(message);
  }
}

export function asyncRoute(
  handler: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<unknown>,
) {
  return (request: Request, response: Response, next: NextFunction) => {
    void Promise.resolve(handler(request, response, next)).catch(next);
  };
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (response.headersSent) { _next(error); return; }
  const transportError = error as { status?: number; type?: string };
  if (transportError.type === "entity.parse.failed" || transportError.status === 413) {
    response.status(transportError.status === 413 ? 413 : 400).json({ error: {
      code: "invalid_body", message: "Некорректный или слишком большой запрос.",
    } });
    return;
  }
  if (!(error instanceof HttpError) && transportError.status === 404) {
    response.status(404).json({ error: { code: "not_found", message: "Файл не найден." } });
    return;
  }
  if (error instanceof multer.MulterError) {
    response.status(400).json({
      error: {
        code: "upload_error",
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Файл превышает лимит 5 МБ."
            : error.code === "LIMIT_FILE_COUNT"
              ? "Можно загрузить не больше 8 файлов."
              : "Не удалось принять файлы.",
      },
    });
    return;
  }
  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: "validation_error",
        message: "Проверьте заполненные поля.",
        fields: error.flatten().fieldErrors,
      },
    });
    return;
  }
  if (error instanceof HttpError) {
    response
      .status(error.status)
      .json({ error: { code: error.code, message: error.message } });
    return;
  }
  console.error(error);
  response
    .status(500)
    .json({
      error: { code: "internal_error", message: "Внутренняя ошибка сервера." },
    });
}
