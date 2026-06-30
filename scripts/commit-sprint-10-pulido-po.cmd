@echo off
cd /d "%~dp0.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0commit-sprint-10-pulido-po.ps1"
pause
