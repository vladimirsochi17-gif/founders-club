import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const manifest = new URL('../routes.json', import.meta.url);
const routes: string[] = existsSync(manifest)
  ? JSON.parse(readFileSync(manifest, 'utf8'))
  : [...readFileSync(path.resolve('src/components/generated/screenRoutes.ts'), 'utf8').matchAll(/route: "([^"]+)"/g)].map(match => match[1]);
const patterns = routes.filter(route => route.startsWith('/')).map(route => new RegExp('^' + route.replace(' (mobile)', '').split('?')[0]
  .split('/').map(part => part.startsWith(':') ? '[^/]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('/') + '$'));
export const knownPage = (pathname: string) => pathname === '/_review' || patterns.some(pattern => pattern.test(pathname));
