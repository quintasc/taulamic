# Reescribe 4d42bdb (commit único ya pusheado) en 2 commits Sprint 09 + 10
# ATENCIÓN: requiere force push. Ejecutar solo si nadie más ha basado trabajo en 4d42bdb.

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

$parent = 'ba651c4'
$bad = '4d42bdb'

Write-Host "Parent: $parent"
Write-Host "Reemplazando commit unico: $bad"
Write-Host ""

git log -1 --oneline $bad
Write-Host ""
$confirm = Read-Host "Continuar con reset --soft? (s/N)"
if ($confirm -ne 's') { exit 0 }

git reset --soft $parent
Write-Host "`nWorking tree restaurado. Creando 2 commits...`n"

& "$PSScriptRoot\commit-sprint-09-mobile-refactor.ps1"
& "$PSScriptRoot\commit-sprint-10-pulido-po.ps1"

Write-Host "`n--- Historial local ---"
git log -2 --oneline

Write-Host "`nSi todo OK:"
Write-Host "  git push --force-with-lease origin main"
