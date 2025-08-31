const express = require('express');
const net = require('net');
const path = require('path');
const helmet = require('helmet');

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10kb' }));

const MAX_RECENTS = 50;
let recentTests = [];

function addRecent(entry) {
  recentTests.unshift(entry);
  if (recentTests.length > MAX_RECENTS) recentTests.length = MAX_RECENTS;
}

function getClientIp(req) {
  const xfwd = req.headers['x-forwarded-for'];
  if (xfwd) return String(xfwd).split(',')[0].trim();
  const ip = req.socket?.remoteAddress || '';
  return ip.startsWith('::ffff:') ? ip.substring(7) : ip;
}

const HOST_RE = /^(?:\[(?:[A-Fa-f0-9:]+)\]|[A-Za-z0-9_.-]+)$/;

app.post('/api/check', (req, res) => {
  try {
    const { host, port, timeoutMs = 3000 } = req.body || {};
    if (!host || !HOST_RE.test(host)) return res.status(400).json({ ok: false, error: 'Invalid host/IP.' });
    const p = Number(port);
    if (!Number.isInteger(p) || p < 1 || p > 65535) return res.status(400).json({ ok: false, error: 'Invalid port.' });

    const started = Date.now();
    let resolved = false;
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);

    socket.once('connect', () => {
      resolved = true;
      socket.destroy();
      const entry = { host, port: p, status: 'OPEN', rttMs: Date.now() - started, fromIp: getClientIp(req), at: new Date().toISOString() };
      addRecent(entry);
      res.json({ ok: true, ...entry });
    });

    const onClose = (label) => () => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      const entry = { host, port: p, status: 'CLOSED', rttMs: Date.now() - started, reason: label, fromIp: getClientIp(req), at: new Date().toISOString() };
      addRecent(entry);
      res.json({ ok: true, ...entry });
    };

    socket.once('timeout', onClose('timeout'));
    socket.once('error', onClose('error'));

    const targetHost = host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
    socket.connect({ host: targetHost, port: p });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Server error', detail: e?.message });
  }
});

app.get('/api/recent', (req, res) => res.json({ ok: true, items: recentTests }));
app.get('/api/ip', (req, res) => res.json({ ok: true, ip: getClientIp(req) }));

app.use('/', express.static(path.join(__dirname, '..', 'web')));
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`▶ Port Tester server on :${PORT}`));
