const $ = (s) => document.querySelector(s);
const publicIpEl = $('#publicIp');
const hostEl = $('#host');
const portEl = $('#port');
const checkBtn = $('#checkBtn');
const recentEl = $('#recent');
const ipInfoEl = $('#ipInfo');
const ipMapEl = $('#ipMap');

const LS_KEY = 'portTester.recents.v1';

function saveLocal(item) {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    arr.unshift(item);
    if (arr.length > 50) arr.length = 50;
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  } catch {}
}

function loadLocal() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } }

function badge(status) {
  return `<span class="badge ${status==='OPEN'?'open':'closed'}">${status}</span>`;
}

function itemRow(it) {
  const when = new Date(it.at).toLocaleString();
  return `<div class="item ${it.status==='OPEN'?'ok':'err'}"><div class="row space-between"><div class="row gap-12 wrap"><strong>${it.host}</strong>:${it.port} ${badge(it.status)} <span>${it.rttMs}ms</span></div><span class="muted tiny">From: ${it.fromIp||'unknown'} • ${when}</span></div></div>`;
}

async function renderRecent(serverItems) {
  const items = (serverItems && serverItems.length) ? serverItems : loadLocal();
  recentEl.innerHTML = items.map(itemRow).join('') || '<div class="muted">No tests yet.</div>';
}

async function fetchRecent() {
  try { const j = await (await fetch('/api/recent')).json(); if (j.ok) return renderRecent(j.items); } catch {}
  renderRecent();
}

async function fetchIp() {
  try {
    const j = await (await fetch('/api/ip')).json();
    if (j.ok) {
      publicIpEl.textContent = j.ip;
      fetchIpInfo(j.ip);
      return;
    }
  } catch {}
  publicIpEl.textContent = 'unknown';
}

async function fetchIpInfo(ip) {
  try {
    const data = await (await fetch(`https://ip-api.com/json/${ip}`)).json();
    ipInfoEl.textContent = JSON.stringify(data, null, 2);
    if (typeof data.lat === 'number' && typeof data.lon === 'number') {
      ipMapEl.src = `https://staticmap.openstreetmap.de/staticmap.php?center=${data.lat},${data.lon}&zoom=9&size=865x512&markers=${data.lat},${data.lon},red`;
    }
  } catch {
    ipInfoEl.textContent = 'Failed to load.';
  }
}

async function check() {
  const host = hostEl.value.trim(), port = Number(portEl.value);
  if (!host) return alert('Please enter a host');
  if (!Number.isInteger(port) || port<1 || port>65535) return alert('Invalid port');
  checkBtn.disabled=true; checkBtn.textContent='Checking…';
  try {
    const j = await (await fetch('/api/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({host,port})})).json();
    if (j.ok) { saveLocal(j); await fetchRecent(); } else alert(j.error||'Failed');
  } catch { alert('Network error'); }
  checkBtn.disabled=false; checkBtn.textContent='Check Port';
}

checkBtn.addEventListener('click',check);
window.addEventListener('keydown',e=>{if(e.key==='Enter')check();});
fetchIp();fetchRecent();
