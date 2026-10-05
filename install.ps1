$ErrorActionPreference = 'Stop'
$source = Split-Path -Parent $MyInvocation.MyCommand.Path
$target = Join-Path $env:USERPROFILE '.vscode\extensions\yoan-local.codex-usage-status-0.1.0'

if (Test-Path $target) { Remove-Item $target -Recurse -Force }
New-Item -ItemType Directory -Path $target -Force | Out-Null
Copy-Item (Join-Path $source '*') $target -Recurse -Force

Write-Host ''
Write-Host 'Codex Usage Status instalado correctamente.' -ForegroundColor Green
Write-Host 'Ahora reinicia VS Code o ejecuta: Developer: Reload Window'
