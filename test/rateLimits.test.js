'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { durationLabel, windowsFrom, compactText } = require('../lib/rateLimits');

test('etiqueta ventanas conocidas', () => {
  assert.equal(durationLabel(300), '5h');
  assert.equal(durationLabel(10080), 'semana');
});

test('extrae porcentajes restantes del protocolo Codex', () => {
  const windows = windowsFrom({ result: { rateLimits: {
    primary: { usedPercent: 32, windowDurationMins: 300, resetsAt: 1 },
    secondary: { usedPercent: 8, windowDurationMins: 10080, resetsAt: 2 }
  } } });
  assert.deepEqual(windows.map(w => w.remaining), [68, 92]);
  assert.equal(compactText(windows), '$(sparkle) Codex 5h: 68% | semana: 92%');
});

test('limita resultados invalidos al rango cero-cien', () => {
  const windows = windowsFrom({ rateLimits: { primary: { usedPercent: 120, windowDurationMins: 60 } } });
  assert.equal(windows[0].remaining, 0);
});
