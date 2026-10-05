'use strict';

const vscode = require('vscode');
const { spawn } = require('child_process');
const { windowsFrom, compactText } = require('./lib/rateLimits');

let item;
let timer;
let lastWindows = [];
let refreshing = false;

function readRateLimits(codexPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(codexPath, ['app-server', '--listen', 'stdio://'], {
      windowsHide: true,
      shell: process.platform === 'win32'
    });
    let buffer = '';
    let stderr = '';
    const timeout = setTimeout(() => finish(new Error('Codex no respondio en 20 segundos')), 20000);

    function finish(error, value) {
      clearTimeout(timeout);
      if (!child.killed) child.kill();
      error ? reject(error) : resolve(value);
    }

    function send(message) {
      child.stdin.write(`${JSON.stringify(message)}\n`);
    }

    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', finish);
    child.on('exit', code => {
      if (code && !lastWindows.length) finish(new Error(stderr.trim() || `Codex termino con codigo ${code}`));
    });
    child.stdout.on('data', chunk => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim()) continue;
        let message;
        try { message = JSON.parse(line); } catch { continue; }
        if (message.id === 1 && message.result) {
          send({ method: 'initialized' });
          // Omit params for compatibility with Codex versions where this RPC
          // still expects a unit value instead of the newer optional map.
          send({ id: 2, method: 'account/rateLimits/read' });
        } else if (message.id === 2) {
          if (message.error) finish(new Error(message.error.message || 'No se pudieron leer los limites'));
          else finish(null, windowsFrom(message));
        }
      }
    });

    send({
      id: 1,
      method: 'initialize',
      params: {
        clientInfo: { name: 'codex_usage_status', title: 'Codex Usage Status', version: '0.1.0' },
        capabilities: { experimentalApi: false }
      }
    });
  });
}

function tooltip(windows) {
  if (!windows.length) return 'No hay datos. Haz clic para actualizar.';
  const lines = ['Consumo disponible de Codex'];
  for (const w of windows) {
    const reset = w.resetsAt ? new Date(w.resetsAt * 1000).toLocaleString() : 'no informado';
    lines.push(`${w.label}: ${w.remaining}% disponible (${w.used}% usado) · reinicio: ${reset}`);
  }
  lines.push('Haz clic para ver el detalle.');
  return lines.join('\n');
}

async function refresh(showErrors = false) {
  if (refreshing) return;
  refreshing = true;
  item.text = '$(sync~spin) Codex';
  try {
    const config = vscode.workspace.getConfiguration('codexUsage');
    lastWindows = await readRateLimits(config.get('codexPath', 'codex'));
    item.text = compactText(lastWindows);
    item.tooltip = tooltip(lastWindows);
    item.backgroundColor = undefined;
  } catch (error) {
    item.text = '$(warning) Codex: sin conexion';
    item.tooltip = `${error.message}\nComprueba que Codex CLI este instalado y que hayas iniciado sesion.`;
    item.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    if (showErrors) vscode.window.showErrorMessage(`Codex Usage: ${error.message}`);
  } finally {
    refreshing = false;
  }
}

function schedule() {
  if (timer) clearInterval(timer);
  const minutes = vscode.workspace.getConfiguration('codexUsage').get('refreshMinutes', 5);
  timer = setInterval(() => refresh(false), Math.max(1, minutes) * 60000);
}

function activate(context) {
  item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = 'codexUsage.showDetails';
  item.text = '$(sparkle) Codex';
  item.tooltip = 'Consultando limites de Codex...';
  item.show();
  context.subscriptions.push(
    item,
    vscode.commands.registerCommand('codexUsage.refresh', () => refresh(true)),
    vscode.commands.registerCommand('codexUsage.showDetails', async () => {
      if (!lastWindows.length) return refresh(true);
      const detail = lastWindows.map(w => `${w.label}: ${w.remaining}% disponible`).join(' · ');
      const choice = await vscode.window.showInformationMessage(`Codex — ${detail}`, 'Actualizar ahora');
      if (choice) refresh(true);
    }),
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('codexUsage')) { schedule(); refresh(false); }
    })
  );
  schedule();
  refresh(false);
}

function deactivate() {
  if (timer) clearInterval(timer);
}

module.exports = { activate, deactivate };
