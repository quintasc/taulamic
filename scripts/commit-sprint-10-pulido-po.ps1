# Commit Sprint 09-10 — admin móvil, pulido PO y E2E (2026-06-30)
# Ejecutar desde la raíz: .\scripts\commit-sprint-10-pulido-po.ps1

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

# Stage: todo apps/web relevante (excluye .next y node_modules)
git add apps/web/e2e/
git add apps/web/next.config.ts
git add apps/web/src/

# Stage: documentación y scripts
git add docs/
git add scripts/

# Por si quedó algo suelto en apps/web modificado
git add -u apps/web

Write-Host "`n--- Staged (preview) ---"
git status --short

$msg = @'
Admin móvil/iPad: refactor responsive, pulido PO y E2E Sprint 09-10.

Incluye drawer hamburguesa y logo en cabecera, invitados (import UX, tarjetas móvil, filtros), plano (límites numéricos, accesorios con chevrones, room-dimension-fields), distribución táctil, marketing responsive, MobileHorizontalScroll, specs E2E y documentación agile/ux.
'@

git commit -m $msg

Write-Host "`n--- Tras commit ---"
git status --short
Write-Host "`nListo. Revisa y ejecuta: git push origin main"
