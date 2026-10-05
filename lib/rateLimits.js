'use strict';

function remaining(window) {
  if (!window || !Number.isFinite(window.usedPercent)) return null;
  return Math.max(0, Math.min(100, 100 - window.usedPercent));
}

function durationLabel(minutes) {
  if (!Number.isFinite(minutes)) return 'periodo';
  if (minutes === 300) return '5h';
  if (minutes === 10080) return 'semana';
  if (minutes % 1440 === 0) return `${minutes / 1440}d`;
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  return `${minutes}m`;
}

function windowsFrom(response) {
  const root = response && response.result ? response.result : response;
  const byId = root && root.rateLimitsByLimitId;
  const snapshot = (byId && (byId.codex || Object.values(byId)[0])) || (root && root.rateLimits);
  if (!snapshot) return [];
  return [snapshot.primary, snapshot.secondary].filter(Boolean).map(w => ({
    label: durationLabel(w.windowDurationMins),
    remaining: remaining(w),
    used: w.usedPercent,
    resetsAt: w.resetsAt
  })).filter(w => w.remaining !== null);
}

function compactText(windows) {
  if (!windows.length) return '$(sparkle) Codex: sin datos';
  return `$(sparkle) Codex ${windows.map(w => `${w.label}: ${w.remaining}%`).join(' | ')}`;
}

module.exports = { remaining, durationLabel, windowsFrom, compactText };
