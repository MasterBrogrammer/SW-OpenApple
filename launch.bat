@echo off
cd /d "%~dp0"
title OpenApple
echo OpenApple — Apple IIe in the browser
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch.ps1"
if errorlevel 1 (
  echo.
  echo Launch failed. Need a network connection the first time so Node.js can be downloaded.
  pause
)
