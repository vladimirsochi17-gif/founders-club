import { readFile, writeFile } from 'node:fs/promises';
const source = await readFile('src/components/generated/screenRoutes.ts', 'utf8');
const routes = [...source.matchAll(/route: "([^"]+)"/g)].map(match => match[1]).filter(route => route.startsWith('/'));
await writeFile('dist/server/routes.json', JSON.stringify(routes));
