import { readFile } from "node:fs/promises";

const baseUrl = (process.argv[2] || "http://localhost:8787").replace(/\/$/, "");
const source = await readFile(
  new URL("../src/components/generated/screenRoutes.ts", import.meta.url),
  "utf8",
);
const routes = [...source.matchAll(/route:\s*"([^"]+)"/g)]
  .map((match) => match[1].replace(" (mobile)", ""))
  .filter((route) => route.startsWith("/"))
  .map((route) =>
    route
      .replaceAll(":slug", "mindflow")
      .replaceAll(":handle", "alexdev")
      .replaceAll(":id", "demo-01"),
  );
const unique = [...new Set(routes)];
const failures = [];

for (const route of unique) {
  const response = await fetch(baseUrl + route, { redirect: "manual" });
  const expected = route === '/404' ? 404 : 200;
  if (response.status !== expected) failures.push({ route, status: response.status, expected });
}

for (const route of ['/not-a-real-page', '/p/not-a-real-project', '/api/not-a-real-endpoint', '/uploads/not-a-file.png']) {
  const response = await fetch(baseUrl + route);
  if (response.status !== 404) failures.push({ route, status: response.status, expected: 404 });
}
const login = await (await fetch(baseUrl + '/login')).text();
if (!login.includes('noindex,nofollow')) failures.push({ route:'/login', error:'private page must be noindex' });

if (failures.length) {
  console.error(JSON.stringify({ checked: unique.length, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ checked: unique.length, status: "ok" }, null, 2));
