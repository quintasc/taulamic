# Commit 1/2 — Sprint 09: refactor admin móvil (ADR-019, Fase 1)
# Uso tras: git reset --soft ba651c4  (ver commit-split-two.ps1)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

git add `
  apps/web/src/components/admin/admin-sidebar.tsx `
  apps/web/src/components/admin/index.ts `
  apps/web/src/components/admin/distribution/ `
  apps/web/src/components/admin/floor-plan/ `
  apps/web/src/components/admin/guests/shared/ `
  apps/web/src/components/admin/guests/v2/guest-mobile-card.tsx `
  apps/web/src/components/admin/guests/v2/guests-filter-chips.ts `
  apps/web/src/components/admin/guests/v2/guests-filter-dropdown.tsx `
  apps/web/src/components/admin/guests/v2/guests-panel-v2.tsx `
  apps/web/src/components/admin/tables/ `
  apps/web/src/components/marketing/ `
  apps/web/src/components/icons.tsx `
  apps/web/src/components/ui/mobile-horizontal-scroll.tsx `
  apps/web/src/components/ui/index.ts `
  apps/web/src/lib/floor-plan-setup.ts `
  apps/web/src/lib/guest-pointer-drag.ts `
  apps/web/e2e/floor-plan-mobile.spec.ts `
  apps/web/e2e/guests-mobile-cards.spec.ts `
  apps/web/e2e/marketing-landing.spec.ts `
  apps/web/e2e/helpers/pilot-flow.ts `
  docs/adr/ADR-019-responsive-y-mobile-invitado.md `
  docs/agile/refactor-ui-mobile-admin.md `
  docs/agile/backlog-mejoras-post-piloto.md `
  docs/agile/sprint-09-cierre.md `
  docs/agile/sprint-09-plan.md `
  docs/agile/evidencias-mej-13-validacion.md `
  docs/agile/guion-validacion-mej-13-ui.md `
  docs/agile/observabilidad-y-e2e-web-piloto.md `
  docs/sdd/SDD-02-backlog-inicial.md `
  docs/ux/frontend-component-system.md `
  docs/ux/guia-estilo-taulamic.md

Write-Host "`n--- Commit 1 staged ---"
git status --short

$msg = @'
Refactor admin móvil (Sprint 09): drawer, tarjetas, plano y E2E.

AdminSidebarPanel reutilizable; invitados/mesas en cards < lg; plano con controles móviles, room-dimension-fields y MobileHorizontalScroll (chevrones accesorios); drag táctil distribución; marketing responsive; specs E2E móvil y docs refactor Fase 1.
'@

git commit -m $msg
Write-Host "`nCommit 1 listo. Ejecuta: .\scripts\commit-sprint-10-pulido-po.ps1"
