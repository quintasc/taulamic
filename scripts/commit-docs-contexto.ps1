# Commit docs + scripts de contexto (post 4d42bdb)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

git add docs/agile/CONTEXTO-EJECUCION.md
git add scripts/
git add -u scripts/

git status --short

$msg = @'
Docs: actualizar CONTEXTO-EJECUCION tras push 4d42bdb y scripts commit.

Registra main @ 4d42bdb pusheado y añade scripts opcionales de commit por sprint.
'@

git commit -m $msg
git status --short
Write-Host "`nPush: git push origin main"
