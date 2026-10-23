$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

npm run check
if ($LASTEXITCODE -ne 0) { throw "Code checks failed" }
docker compose up -d --build
if ($LASTEXITCODE -ne 0) { throw "Container build/start failed" }

$health = $null
for ($attempt = 0; $attempt -lt 30; $attempt += 1) {
  try {
    $health = Invoke-RestMethod "http://localhost:8787/api/health"
    break
  } catch {
    Start-Sleep -Seconds 1
  }
}
if (-not $health -or $health.data.status -ne "ok" -or $health.data.database -ne "ok") {
  throw "Founders Club health check failed"
}

node scripts/smoke-routes.mjs http://localhost:8787
if ($LASTEXITCODE -ne 0) {
  throw "Route smoke test failed"
}
Write-Host "Founders Club verified: application and PostgreSQL are healthy."
