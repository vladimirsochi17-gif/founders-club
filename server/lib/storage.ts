import { access, mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { HttpError } from './http.js';

function checkedKey(key: string) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,199}$/.test(key) || key.includes('..'))
    throw new HttpError(400, 'Некорректное имя файла.', 'invalid_storage_key');
  return key;
}

export function createFileStore(options: {
  provider: 'local' | 'supabase'; directory: string; url: string; secret: string; bucket: string;
}) {
  const client = options.provider === 'supabase' ? createClient(options.url, options.secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init,
      signal: init?.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
    }) },
  }) : null;
  const bucket = client?.storage.from(options.bucket);
  const local = (key: string) => path.resolve(options.directory, checkedKey(key));
  const unavailable = () => new HttpError(503, 'Хранилище файлов временно недоступно.', 'storage_unavailable');
  return {
    async verify() {
      if (!client) return;
      const { data, error } = await client.storage.getBucket(options.bucket);
      if (error || !data || data.public) throw new Error('Configure an existing PRIVATE Supabase storage bucket before starting the server');
    },
    async put(key: string, data: Buffer, mime: string) {
      checkedKey(key);
      if (data.length > 5 * 1024 * 1024) throw new HttpError(413, 'Изображение превышает 5 МБ после обработки.', 'file_too_large');
      if (bucket) {
        const { error } = await bucket.upload(key, data, { contentType: mime, upsert: false, cacheControl: '0' });
        if (error) throw unavailable();
      } else {
        await mkdir(options.directory, { recursive: true });
        await writeFile(local(key), data, { flag: 'wx', mode: 0o640 });
      }
    },
    async remove(key: string) {
      checkedKey(key);
      if (bucket) {
        const { error } = await bucket.remove([key]);
        if (error) throw unavailable();
      } else await unlink(local(key)).catch((error: NodeJS.ErrnoException) => { if (error.code !== 'ENOENT') throw error; });
    },
    async exists(key: string) {
      checkedKey(key);
      if (bucket) {
        const { data, error } = await bucket.exists(key);
        if (error) throw unavailable();
        return data;
      }
      try { await access(local(key)); return true; }
      catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false; throw error; }
    },
    async send(key: string, response: Response, download = false) {
      checkedKey(key);
      if (bucket) {
        if (download) {
          const { data, error } = await bucket.createSignedUrl(key, 60, { download: key });
          if (error || !data) throw unavailable();
          response.redirect(302, data.signedUrl);
        } else {
          const { data, error } = await bucket.download(key);
          if (error || !data) throw unavailable();
          response.send(Buffer.from(await data.arrayBuffer()));
        }
      } else if (download) response.download(local(key));
      else response.sendFile(local(key));
    },
  };
}

export const fileStore = createFileStore({ provider: config.STORAGE_PROVIDER, directory: config.UPLOAD_DIR,
  url: config.SUPABASE_URL, secret: config.SUPABASE_SERVICE_ROLE_KEY, bucket: config.SUPABASE_STORAGE_BUCKET });
