# Commit 2/2 — Sprint 10: pulido PO post-validación piloto
# Ejecutar DESPUÉS de commit-sprint-09-mobile-refactor.ps1

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

git add `
  apps/web/src/components/admin/admin-shell.tsx `
  apps/web/src/components/admin/setup-nav-bar.tsx `
  apps/web/src/components/admin/guests/guests-import-section.tsx `
  apps/web/src/components/admin/guests/guest-template-file-row.tsx `
  apps/web/src/components/admin/guests/v2/guest-drawer-v2.tsx `
  apps/web/src/components/ui/upload-zone.tsx `
  apps/web/next.config.ts `
  apps/web/e2e/mej-13-ui-copy.spec.ts `
  docs/agile/CONTEXTO-EJECUCION.md `
  docs/agile/sprint-10-plan.md `
  docs/agile/evidencias-piloto/sesion-2026-06-30-implementacion-po.md `
  docs/agile/github-project-sprint-10.md `
  docs/agile/roadmap-mvp-julio.md `
  scripts/

Write-Host "`n--- Commit 2 staged ---"
git status --short

$msg = @'
Pulido PO móvil/iPad (Sprint 10): invitados, cabecera y setup nav.

Feedback validación piloto 24 jun: import Excel (jerarquía botones, quitar fichero), logo en cabecera sin duplicar drawer, nombre evento alineado, Anterior visible en footer, drawer z-index; smoke E2E MEJ-13 D y docs Sprint 10.
'@

git commit -m $msg

Write-Host "`n--- Tras commit 2 ---"
git status --short
Write-Host "`nListo. Push: git push --force-with-lease origin main  (solo si reescribiste historial)"
