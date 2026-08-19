# OpenApple local launcher. Double-click launch.bat, or:
#   powershell -ExecutionPolicy Bypass -File .\launch.ps1
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$NodeVersion = "v22.18.0"
$Tools = Join-Path $PSScriptRoot ".tools"
$PortableNodeDir = Join-Path $Tools "node"
$Url = "http://127.0.0.1:8080/"

function Find-NodeExe {
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($cmd -and $cmd.Source) { return $cmd.Source }
  $portable = Join-Path $PortableNodeDir "node.exe"
  if (Test-Path $portable) { return $portable }
  return $null
}

function Install-PortableNode {
  $zipName = "node-$NodeVersion-win-x64.zip"
  $url = "https://nodejs.org/dist/$NodeVersion/$zipName"
  New-Item -ItemType Directory -Force -Path $Tools | Out-Null
  $zip = Join-Path $Tools $zipName
  Write-Host "Node.js not found. Downloading portable $NodeVersion (~30 MB)..."
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
  $extract = Join-Path $Tools "extract"
  if (Test-Path $extract) { Remove-Item -Recurse -Force $extract }
  Expand-Archive -Path $zip -DestinationPath $extract
  $inner = Get-ChildItem $extract -Directory | Select-Object -First 1
  if (-not $inner) { throw "Node zip did not contain a folder" }
  if (Test-Path $PortableNodeDir) { Remove-Item -Recurse -Force $PortableNodeDir }
  Move-Item $inner.FullName $PortableNodeDir
  Remove-Item $zip -Force
  Remove-Item $extract -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "Portable Node installed at $PortableNodeDir"
}

$node = Find-NodeExe
if (-not $node) {
  Install-PortableNode
  $node = Join-Path $PortableNodeDir "node.exe"
}
if (-not (Test-Path $node)) { throw "Could not find or install Node.js" }

$nodeDir = Split-Path -Parent $node
$env:Path = "$nodeDir;$env:Path"
$npm = Join-Path $nodeDir "npm.cmd"
if (-not (Test-Path $npm)) { $npm = "npm" }

Write-Host "Using Node: $(& $node -v)"

if (-not (Test-Path (Join-Path $PSScriptRoot "node_modules"))) {
  Write-Host "Installing dependencies (first run, a few minutes)..."
  & $npm install
  if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
}

Write-Host "Starting OpenApple at $Url"
Start-Job -ScriptBlock {
  Start-Sleep -Seconds 5
  Start-Process $using:Url
} | Out-Null

& $npm run dev
if ($LASTEXITCODE -ne 0) {
  Write-Host "Dev server exited. If port 8080 is busy, close the other app and try again."
  exit $LASTEXITCODE
}
