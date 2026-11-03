@echo off
chcp 65001 > nul
cd /d "%~dp0"
node update-site.cjs %*
if "%1"=="" pause
