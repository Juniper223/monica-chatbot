// Admin panel JavaScript — separate file so it is never inside a template literal
// Exported as a string for inclusion in the admin HTML via <script> tag

export const ADMIN_JS = `
const PW = __PW__;
let allClinics = __CLINICS__;

function showTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function costBadge(cost) {
  if (!cost) return '<span style="color:#94a3b8">-</span>';
  var l = cost.toLowerCase();
  if (l.includes('nhs') && l.includes('private')) return '<span class="badge both">NHS + Private</span>';
  if (l.includes('nhs')) return '<span class="badge nhs">NHS</span>';
  if (l.includes('private')) return '<span class="badge private">Private</span>';
  return '<span style="font-size:12px;color:#64748b">' + esc(cost.slice(0,20)) + '</span>';
}

function renderClinics(list) {
  var tbody = document.getElementById('clinic-tbody');
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty">No clinics found</td></tr>'; return; }
  tbody.innerHTML = list.map(function(c) {
    return '<tr>' +
      '<td><strong>' + esc(c.title||'') + '</strong>' +
      (c.website ? '<br><a href="' + esc(c.website) + '" target="_blank" style="font-size:11px;color:#64748b">' + esc(c.website.replace(/https?:\\/\\//, '').replace(/\\/$/, '').slice(0,40)) + '</a>' : '') +
      '</td>' +
      '<td style="color:#64748b">' + esc(parseList(c.locations||c.postcode||'').split(',')[0].trim().slice(0,30)) + '</td>' +
      '<td>' + costBadge(c.cost) + '</td>' +
      '<td style="font-size:12px">' + (c.regulatory_rating ? esc(c.regulatory_rating) : '<span style="color:#94a3b8">-</span>') + '</td>' +
      '<td style="font-size:11px;color:#64748b">' + (c.treats_under_18s && c.treats_under_18s !== 'no' ? '<span style="color:#7c3aed;font-weight:600">' + esc(c.treats_under_18s) + '</span>' : '18+') + '</td>' +
      '<td>' +
        '<button class="btn sm" onclick="openModal(' + c.id + ')">Edit</button> ' +
        (c.slug && c.portal_password ? '<button class="btn sm secondary" onclick="copyLogin(' + c.id + ')" title="Copy portal login URL">Login</button> ' : '') +
        '<button class="btn sm secondary" onclick="genLink(' + c.id + ')" title="One-time update link (30 days)">Link</button> ' +
        '<button class="btn sm danger" onclick="del(' + c.id + ')">Del</button>' +
      '</td>' +
      '</tr>';
  }).join('');
}

function filterClinics() {
  var q = document.getElementById('clinic-search').value.toLowerCase();
  renderClinics(allClinics.filter(function(c) {
    return (c.title||'').toLowerCase().includes(q) ||
      (c.address||'').toLowerCase().includes(q) ||
      (c.locations||'').toLowerCase().includes(q);
  }));
}

var FIELDS = ['id','slug','portal_password','title','website','phone','address','postcode','locations','cost','payment',
  'gender_model','capacity','detox_on_site','dual_diagnosis','twelve_step','is_faith_based','faith_tradition',
  'has_family_programme','mother_child_service','setting','price_per_week_from','price_per_week_to',
  'rehab_type','named_modalities','addictions_treated','pricing_clean','ai_summary','description',
  'min_age','treats_under_18s','regulatory_body','regulatory_rating','last_inspection_date'];

var LIST_FIELDS = new Set(['locations','cost','payment','insurance_networks','named_modalities','addictions_treated','rehab_type','accessibility']);

function parseList(val) {
  if (!val) return '';
  var s = String(val).trim();
  if (!s.startsWith('[')) return s;
  return s.slice(1, -1).split(',').map(function(p) { return p.trim().replace(/^['"]|['"]$/g, ''); }).filter(Boolean).join(', ');
}

function openModal(id) {
  var c = id ? (allClinics.find(function(x) { return x.id === id; }) || {}) : {};
  document.getElementById('modal-title').textContent = id ? 'Edit clinic' : 'Add clinic';
  FIELDS.forEach(function(f) {
    var el = document.getElementById('f-'+f);
    if (!el) return;
    var raw = c[f] != null ? c[f] : '';
    el.value = LIST_FIELDS.has(f) ? parseList(raw) : raw;
  });
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('f-title').focus();
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }
function maybeClose(e) { if (e.target === document.getElementById('modal-overlay')) closeModal(); }

async function saveClinic(e) {
  e.preventDefault();
  var clinic = {};
  FIELDS.forEach(function(f) { var el = document.getElementById('f-'+f); if (el) clinic[f] = el.value.trim(); });
  if (clinic.id) clinic.id = parseInt(clinic.id); else delete clinic.id;
  var btn = document.getElementById('save-btn');
  btn.textContent = 'Saving...'; btn.disabled = true;
  try {
    var r = await fetch('/admin/api/clinics?pw=' + PW, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(clinic) });
    var d = await r.json();
    if (d.ok) {
      if (clinic.id) { var idx = allClinics.findIndex(function(c) { return c.id === clinic.id; }); if (idx >= 0) allClinics[idx] = Object.assign({}, allClinics[idx], clinic); }
      else { clinic.id = d.id; allClinics.push(clinic); }
      closeModal(); renderClinics(allClinics);
    } else alert('Save failed');
  } catch(err) { alert('Save failed: ' + err.message); }
  finally { btn.textContent = 'Save clinic'; btn.disabled = false; }
}

async function del(id) {
  var c = allClinics.find(function(x) { return x.id === id; });
  if (!confirm('Delete "' + (c ? c.title : id) + '"? Cannot be undone.')) return;
  try {
    await fetch('/admin/api/clinics?pw=' + PW + '&id=' + id, { method: 'DELETE' });
    allClinics = allClinics.filter(function(x) { return x.id !== id; });
    renderClinics(allClinics);
  } catch(err) { alert('Delete failed: ' + err.message); }
}

// ---- CSV export/import ----
var CSV_FIELDS = ['id','title','website','phone','address','postcode','locations','cost','payment',
  'gender_model','capacity','dual_diagnosis','mother_child_service','price_per_week_from','price_per_week_to',
  'min_age','treats_under_18s','regulatory_body','regulatory_rating','last_inspection_date',
  'setting','rehab_type','detox_on_site','is_faith_based','faith_tradition','has_family_programme',
  'named_modalities','addictions_treated','pricing_clean','ai_summary','description'];

function csvEscape(v) {
  var s = String(v == null ? '' : v).replace(/\\[|\\]/g,'').replace(/^['"]|['"]$/g,'');
  return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g,'""') + '"' : s;
}

function exportCSV() {
  var rows = [CSV_FIELDS.join(',')];
  allClinics.forEach(function(c) { rows.push(CSV_FIELDS.map(function(f) { return csvEscape(c[f] != null ? c[f] : ''); }).join(',')); });
  var blob = new Blob([rows.join('\\n')], { type: 'text/csv' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'clinics.csv';
  a.click();
}

async function importCSV(event) {
  var file = event.target.files[0];
  if (!file) return;
  var text = await file.text();
  var lines = text.split('\\n').filter(function(l) { return l.trim(); });
  var headers = lines[0].split(',').map(function(h) { return h.trim().replace(/^"|"$/g,''); });
  function parseRow(line) {
    var values = [], cur = '', inQ = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"' && !inQ) inQ = true;
      else if (ch === '"' && inQ && line[i+1] === '"') { cur += '"'; i++; }
      else if (ch === '"' && inQ) inQ = false;
      else if (ch === ',' && !inQ) { values.push(cur); cur = ''; }
      else cur += ch;
    }
    values.push(cur);
    return values;
  }
  var clinics = lines.slice(1).map(function(line) {
    var vals = parseRow(line);
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = vals[i] != null ? vals[i] : ''; });
    if (obj.id) obj.id = parseInt(obj.id);
    return obj;
  }).filter(function(c) { return c.title; });
  var status = document.getElementById('import-status');
  status.style.display = 'block';
  status.textContent = 'Importing ' + clinics.length + ' clinics...';
  status.style.color = '#d97706';
  var ok = 0, fail = 0;
  for (var clinic of clinics) {
    try {
      var r = await fetch('/admin/api/clinics?pw=' + PW, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(clinic) });
      var d = await r.json();
      if (d.ok) ok++; else fail++;
    } catch { fail++; }
  }
  allClinics = await fetch('/admin/api/clinics?pw=' + PW).then(function(r) { return r.json(); });
  renderClinics(allClinics);
  status.textContent = 'Import complete: ' + ok + ' saved' + (fail ? ', ' + fail + ' failed' : '') + '.';
  status.style.color = fail ? '#ef4444' : '#16a34a';
  event.target.value = '';
}

// ---- Pending queue ----
async function loadPending() {
  var r = await fetch('/admin/api/pending?pw=' + PW);
  var items = await r.json();
  var btn = document.getElementById('pending-tab-btn');
  if (btn) btn.textContent = items.length ? 'Pending (' + items.length + ')' : 'Pending';
  var el = document.getElementById('pending-list');
  if (!el) return;
  if (!items.length) { el.innerHTML = '<p style="color:#94a3b8;font-size:14px;padding:20px 0">No pending submissions.</p>'; return; }
  el.innerHTML = items.map(function(item) {
    var title = item.title || '(untitled)';
    var isNew = item.type !== 'update';
    var typeBadge = isNew
      ? '<span style="margin-left:10px;background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600">New clinic</span>'
      : '<span style="margin-left:10px;background:#ede9fe;color:#7c3aed;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600">Update</span>';
    var date = item.submitted_at ? item.submitted_at.slice(0,10) : '';
    return '<div style="background:#fff;border-radius:10px;padding:16px 20px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.07);display:flex;align-items:center;gap:16px">' +
      '<div style="flex:1"><strong style="font-size:14px">' + esc(title) + '</strong>' + typeBadge +
      (date ? '<span style="margin-left:8px;font-size:12px;color:#94a3b8">' + date + '</span>' : '') + '</div>' +
      '<button class="btn sm" onclick="reviewPending(\\'' + item.id + '\\')">Review</button> ' +
      '<button class="btn sm danger" onclick="rejectPending(\\'' + item.id + '\\')">Reject</button></div>';
  }).join('');
}

async function reviewPending(id) {
  var items = await fetch('/admin/api/pending?pw=' + PW).then(function(r) { return r.json(); });
  var item = items.find(function(i) { return i.id === id; });
  if (!item) return;
  document.getElementById('pending-modal-title').textContent = (item.type === 'update' ? 'Update: ' : 'New clinic: ') + (item.title || '');
  var rows = Object.entries(item)
    .filter(function(e) { return !['id','type','submitted_at','clinic_id'].includes(e[0]); })
    .map(function(e) {
      var val = Array.isArray(e[1]) ? e[1].join(', ') : String(e[1]||'');
      return '<tr><td style="font-size:12px;color:#64748b;padding:4px 8px;width:180px">' + esc(e[0]) + '</td><td style="font-size:13px;padding:4px 8px">' + esc(val) + '</td></tr>';
    }).join('');
  document.getElementById('pending-modal-body').innerHTML = '<table style="width:100%;border-collapse:collapse"><tbody>' + rows + '</tbody></table>';
  document.getElementById('pending-modal-footer').innerHTML =
    '<button class="btn secondary" onclick="document.getElementById(\\'pending-overlay\\').classList.remove(\\'open\\')">Cancel</button> ' +
    '<button class="btn danger" onclick="rejectPending(\\'' + id + '\\');document.getElementById(\\'pending-overlay\\').classList.remove(\\'open\\')">Reject</button> ' +
    '<button class="btn" onclick="approvePending(\\'' + id + '\\')">Approve &amp; publish</button>';
  document.getElementById('pending-overlay').classList.add('open');
}

async function approvePending(id) {
  var items = await fetch('/admin/api/pending?pw=' + PW).then(function(r) { return r.json(); });
  var item = items.find(function(i) { return i.id === id; });
  if (!item) return;
  var r = await fetch('/admin/api/pending?pw=' + PW, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ action: 'approve', id: id, clinic_data: item })
  });
  var d = await r.json();
  if (d.ok) {
    document.getElementById('pending-overlay').classList.remove('open');
    allClinics = await fetch('/admin/api/clinics?pw=' + PW).then(function(r) { return r.json(); });
    renderClinics(allClinics);
    loadPending();
  }
}

async function rejectPending(id) {
  if (!confirm('Reject and delete this submission?')) return;
  await fetch('/admin/api/pending?pw=' + PW, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ action: 'reject', id: id })
  });
  loadPending();
}

// ---- Link generation ----
function copyLogin(id) {
  var clinic = allClinics.find(function(c) { return c.id === id; });
  if (!clinic || !clinic.slug || !clinic.portal_password) return;
  var base = window.location.origin;
  var url = base + '/form/' + clinic.slug + '?pw=' + encodeURIComponent(clinic.portal_password);
  navigator.clipboard.writeText(url).then(function() {
    showLink('Portal login for ' + (clinic.title || clinic.slug), url, null);
  });
}

async function genLink(clinicId) {
  var r = await fetch('/admin/api/generate-link?pw=' + PW + '&id=' + clinicId + '&days=30');
  var d = await r.json();
  showLink('Update link (30 days)', d.link, d.expiry);
}

async function generateNewLink() {
  var r = await fetch('/admin/api/generate-link?pw=' + PW + '&days=7');
  var d = await r.json();
  showLink('New clinic application link (7 days)', d.link, d.expiry);
}

function showLink(title, link, expiry) {
  document.getElementById('link-modal-title').textContent = title;
  var exNote = expiry ? 'Expires ' + new Date(expiry).toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'}) + '.' : 'Permanent link (password-based).';
  document.getElementById('link-modal-body').innerHTML =
    '<p style="font-size:13px;color:#64748b;margin-bottom:12px">Send this to the clinic. ' + exNote + '</p>' +
    '<textarea id="link-text" style="width:100%;height:72px;font-size:11.5px;font-family:monospace;padding:10px;border:1.5px solid #e2e8f0;border-radius:8px;resize:none;color:#334155" readonly>' + esc(link) + '</textarea>' +
    '<div style="display:flex;gap:8px;margin-top:10px">' +
    '<button class="btn" style="flex:1" onclick="navigator.clipboard.writeText(document.getElementById(\\'link-text\\').value).then(function(){ this.textContent=\\'Copied!\\'; }.bind(this))">Copy link</button>' +
    '<a href="' + esc(link) + '" target="_blank" class="btn secondary" style="flex:1;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center">Open to test &rarr;</a>' +
    '</div>';
  document.getElementById('link-overlay').classList.add('open');
}

renderClinics(allClinics);
loadPending();
`;
