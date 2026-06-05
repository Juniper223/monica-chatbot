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
var _pendingItems = [];
var TYPE_BADGES = {
  new: '<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600">New application</span>',
  update: '<span style="background:#ede9fe;color:#7c3aed;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600">Update</span>',
  resubmission: '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600">Resubmission</span>',
};
var STATUS_BADGES = {
  new: '<span style="background:#f1f5f9;color:#64748b;padding:2px 8px;border-radius:99px;font-size:11px">New</span>',
  in_review: '<span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:99px;font-size:11px">In review</span>',
  awaiting_resubmission: '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:99px;font-size:11px">Awaiting resubmission</span>',
  superseded: '<span style="background:#f1f5f9;color:#94a3b8;padding:2px 8px;border-radius:99px;font-size:11px">Superseded</span>',
  rejected: '<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:99px;font-size:11px">Rejected</span>',
};

async function loadPending() {
  var r = await fetch('/admin/api/pending?pw=' + PW);
  _pendingItems = await r.json();
  var active = _pendingItems.filter(function(i) { return i.meta && i.meta.status !== 'superseded' && i.meta.status !== 'rejected'; });
  var btn = document.getElementById('pending-tab-btn');
  if (btn) btn.textContent = active.length ? 'Pending (' + active.length + ')' : 'Pending';
  var el = document.getElementById('pending-list');
  if (!el) return;
  if (!_pendingItems.length) { el.innerHTML = '<p style="color:#94a3b8;font-size:14px;padding:20px 0">No pending submissions.</p>'; return; }
  el.innerHTML = _pendingItems.map(function(item) {
    var meta = item.meta || {};
    var isSuperseded = meta.status === 'superseded' || meta.status === 'rejected';
    var title = meta.title || (item.submission||{}).title || item.title || '(untitled)';
    var typeBadge = TYPE_BADGES[meta.type || item.type || 'update'] || '';
    var statusBadge = STATUS_BADGES[meta.status || 'new'] || '';
    var date = meta.submitted_at ? meta.submitted_at.slice(0,10) : '';
    var assignBadge = meta.assigned_to
      ? '<span style="margin-left:8px;background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;padding:2px 8px;border-radius:99px;font-size:11px">&#9679; ' + esc(meta.assigned_to) + '</span>'
      : '<span style="margin-left:8px;background:#fef2f2;color:#991b1b;border:1px solid #fca5a5;padding:2px 8px;border-radius:99px;font-size:11px">Unassigned</span>';
    return '<div style="background:' + (isSuperseded?'#fafafa':'#fff') + ';border-radius:10px;padding:16px 20px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.06);' + (isSuperseded?'opacity:.5':'') + '">' +
      '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
        '<strong style="font-size:14px">' + esc(title) + '</strong>' + typeBadge + statusBadge + assignBadge +
        (date ? '<span style="font-size:12px;color:#94a3b8;margin-left:4px">' + date + '</span>' : '') +
        '<div style="margin-left:auto">' +
          (!isSuperseded ? '<button class="btn sm" onclick="openPendingReview(' + JSON.stringify(item.id) + ')">Review</button>' : '') +
        '</div>' +
      '</div></div>';
  }).join('');
}


function closePendingModal() { var el = document.getElementById('pending-overlay'); if (el) el.classList.remove('open'); }
function openPendingReview(id) {
  var item = _pendingItems.find(function(i) { return i.id === id; });
  if (!item) return;
  var meta = item.meta || {};
  var sub = item.submission || item;
  var FIELD_LABELS = {title:'Clinic name',website:'Website',phone:'Phone',email:'Email',address:'Address',postcode:'Postcode',gender_model:'Gender',capacity:'Beds',detox_on_site:'Detox on site',dual_diagnosis:'Dual diagnosis',twelve_step:'12-step',is_faith_based:'Faith-based',faith_tradition:'Faith tradition',named_modalities:'Therapies',description:'Description',setting:'Setting',waiting_time:'Waiting time',languages:'Languages',price_per_week_from:'Price from',price_per_week_to:'Price to',insurance_networks:'Insurance',google_reviews_url:'Google reviews',trustpilot_url:'Trustpilot',facebook_url:'Facebook',instagram_url:'Instagram',linkedin_url:'LinkedIn',nhs_ff_score:'NHS F&F score',accreditations_other:'Other accreditations'};
  var ARRAY_FIELDS = ['treatment_types','addictions_treated','mental_health_conditions','funding_types','accreditations'];
  var fieldRows = '';
  Object.keys(FIELD_LABELS).concat(ARRAY_FIELDS).forEach(function(f) {
    var rawVal = sub[f];
    if (rawVal === undefined || rawVal === null || rawVal === '') return;
    var displayVal = Array.isArray(rawVal) ? rawVal.join(', ') : String(rawVal);
    var label = FIELD_LABELS[f] || f;
    fieldRows += '<div style="margin-bottom:10px"><label style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:3px">' + esc(label) + '</label>' +
      (f === 'description' ? '<textarea id="pr-' + f + '" rows="4" style="width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:7px;font-size:13px;font-family:inherit;resize:vertical">' + esc(displayVal) + '</textarea>' : '<input id="pr-' + f + '" value="' + esc(displayVal) + '" style="width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:7px;font-size:13px;font-family:inherit">') + '</div>';
  });
  var teamMembers = (_settingsCache && _settingsCache.team_members ? _settingsCache.team_members : 'Jennifer').split(',').map(function(s){return s.trim();});
  var memberOptions = '<option value="">Unassigned</option>' + teamMembers.map(function(m){return '<option value="'+esc(m)+'"'+(meta.assigned_to===m?' selected':'')+'>'+esc(m)+'</option>';}).join('');
  var html = '<div style="padding-bottom:14px;border-bottom:1px solid #f1f5f9;margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap">' + (TYPE_BADGES[meta.type||'update']||'') + (STATUS_BADGES[meta.status||'new']||'') + '<span style="font-size:12px;color:#94a3b8">'+(meta.submitted_at||'').slice(0,16).replace('T',' ')+'</span></div>' +
    (meta.feedback_message ? '<div style="margin-bottom:14px;background:#fef3c7;border-left:3px solid #f59e0b;padding:10px 12px;border-radius:0 8px 8px 0;font-size:13px;color:#92400e"><strong>Previous feedback sent:</strong> '+esc(meta.feedback_message)+'</div>' : '') +
    '<div style="display:grid;grid-template-columns:1fr 260px;gap:20px"><div><p style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px">Submitted data <span style="font-weight:400;color:#94a3b8;text-transform:none">(edit before approving)</span></p>' + fieldRows + '</div>' +
    '<div><p style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Assignment</p><select id="pr-assign" style="width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:7px;font-size:13px;font-family:inherit;margin-bottom:6px">' + memberOptions + '</select>' + (meta.assigned_at ? '<p style="font-size:12px;color:#94a3b8;margin-bottom:14px">Claimed '+meta.assigned_at.slice(0,10)+'</p>' : '') +
    '<hr style="border:none;border-top:1px solid #f1f5f9;margin:12px 0"><p style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Internal notes</p><textarea id="pr-internal-notes" rows="3" placeholder="Team-only notes, never sent to clinic..." style="width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:7px;font-size:13px;font-family:inherit;resize:vertical">'+esc(meta.internal_notes||'')+'</textarea>' +
    '<hr style="border:none;border-top:1px solid #f1f5f9;margin:12px 0"><p style="font-size:12px;font-weight:600;color:#f59e0b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Trust fields</p><div style="margin-bottom:6px"><label style="font-size:11px;color:#64748b;display:block;margin-bottom:2px">Regulatory body</label><select id="pr-reg-body" style="width:100%;padding:7px 9px;border:1.5px solid #fbbf24;border-radius:7px;font-size:12px;font-family:inherit"><option value="">-</option><option value="CQC">CQC</option><option value="CIW">CIW (Wales)</option><option value="Care Inspectorate Scotland">Care Inspectorate Scotland</option><option value="HIS">HIS (Scotland)</option><option value="RQIA">RQIA (N. Ireland)</option></select></div><div style="margin-bottom:6px"><label style="font-size:11px;color:#64748b;display:block;margin-bottom:2px">Rating</label><select id="pr-reg-rating" style="width:100%;padding:7px 9px;border:1.5px solid #fbbf24;border-radius:7px;font-size:12px;font-family:inherit"><option value="">-</option><option value="Outstanding">Outstanding</option><option value="Exceptional">Exceptional (HIS)</option><option value="Good">Good</option><option value="Requires Improvement">Requires Improvement</option><option value="Inadequate">Inadequate</option></select></div><div style="margin-bottom:6px"><label style="font-size:11px;color:#64748b;display:block;margin-bottom:2px">Treats under-18s</label><select id="pr-under18" style="width:100%;padding:7px 9px;border:1.5px solid #fbbf24;border-radius:7px;font-size:12px;font-family:inherit"><option value="no">No (18+)</option><option value="yes">Yes</option><option value="unconfirmed">Unconfirmed</option></select></div><div><label style="font-size:11px;color:#64748b;display:block;margin-bottom:2px">Minimum age</label><input id="pr-min-age" type="number" value="18" style="width:100%;padding:7px 9px;border:1.5px solid #fbbf24;border-radius:7px;font-size:12px;font-family:inherit"></div></div></div>' +
    '<hr style="border:none;border-top:1px solid #f1f5f9;margin:16px 0"><p style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:10px">Actions</p>' +
    '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;margin-bottom:10px"><p style="font-size:13px;font-weight:600;color:#166534;margin-bottom:6px">&#10003; Approve and publish</p><textarea id="pr-edit-summary" rows="2" placeholder="Note to clinic about edits (optional, leave blank if approving as submitted)..." style="width:100%;padding:8px 10px;border:1.5px solid #bbf7d0;border-radius:7px;font-size:13px;font-family:inherit;resize:vertical;margin-bottom:6px"></textarea><textarea id="pr-internal-edit-log" rows="2" placeholder="Internal edit log (not sent to clinic)..." style="width:100%;padding:8px 10px;border:1.5px solid #bbf7d0;border-radius:7px;font-size:13px;font-family:inherit;resize:vertical;margin-bottom:8px"></textarea><button class="btn" style="background:#166534" onclick="submitApprove(' + JSON.stringify(id) + ')">Approve and go live</button></div>' +
    '<div style="background:#fefce8;border:1px solid #fde047;border-radius:10px;padding:14px;margin-bottom:10px"><p style="font-size:13px;font-weight:600;color:#854d0e;margin-bottom:6px">&#8635; Request changes</p><textarea id="pr-feedback" rows="3" placeholder="What needs to be changed or clarified? This message is sent to the clinic with a link to re-edit their submission..." style="width:100%;padding:8px 10px;border:1.5px solid #fde047;border-radius:7px;font-size:13px;font-family:inherit;resize:vertical;margin-bottom:8px"></textarea><button class="btn" style="background:#854d0e" onclick="submitRequestChanges(' + JSON.stringify(id) + ')">Send feedback and keep in pending</button></div>' +
    '<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:14px"><p style="font-size:13px;font-weight:600;color:#991b1b;margin-bottom:6px">&#10005; Reject</p><textarea id="pr-reject-reason" rows="2" placeholder="Reason for rejection (sent to the clinic)..." style="width:100%;padding:8px 10px;border:1.5px solid #fca5a5;border-radius:7px;font-size:13px;font-family:inherit;resize:vertical;margin-bottom:8px"></textarea><button class="btn danger" onclick="submitReject(' + JSON.stringify(id) + ')">Reject submission</button></div>';
  document.getElementById('pending-modal-title').textContent = meta.title || sub.title || 'Review submission';
  document.getElementById('pending-modal-body').innerHTML = html;
  document.getElementById('pending-modal-footer').innerHTML = '<button class="btn secondary" onclick="saveAssignment(' + JSON.stringify(id) + ')">' + 'Save assignment + notes</button> <button class="btn secondary" onclick="closePendingModal()">Close</button>';
  document.getElementById('pending-overlay').classList.add('open');
}

function collectEdits(sub) {
  var ARRAY_FIELDS = ['treatment_types','addictions_treated','mental_health_conditions','funding_types','accreditations'];
  var result = Object.assign({}, sub);
  Object.keys(result).forEach(function(f) {
    var el = document.getElementById('pr-' + f);
    if (!el) return;
    result[f] = ARRAY_FIELDS.indexOf(f) >= 0 ? el.value.split(',').map(function(s){return s.trim();}).filter(Boolean) : el.value;
  });
  return result;
}

async function saveAssignment(id) {
  var assignTo = (document.getElementById('pr-assign')||{}).value || '';
  await fetch('/admin/api/pending?pw='+PW, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'assign',id:id,assigned_to:assignTo||null})});
  loadPending();
  document.getElementById('pending-overlay').classList.remove('open');
}

async function submitApprove(id) {
  var item = _pendingItems.find(function(i){return i.id===id;});
  if (!item) return;
  var sub = item.submission || item;
  var editedData = collectEdits(sub);
  var editSummary = (document.getElementById('pr-edit-summary')||{}).value || '';
  var trustFields = {
    regulatory_body: (document.getElementById('pr-reg-body')||{}).value || '',
    regulatory_rating: (document.getElementById('pr-reg-rating')||{}).value || '',
    treats_under_18s: (document.getElementById('pr-under18')||{}).value || 'no',
    min_age: (document.getElementById('pr-min-age')||{}).value || '18',
  };
  var r = await fetch('/admin/api/pending?pw='+PW, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'approve',id:id,clinic_data:editedData,trust_fields:trustFields,edit_summary:editSummary})});
  var d = await r.json();
  if (d.ok) {
    document.getElementById('pending-overlay').classList.remove('open');
    allClinics = await fetch('/admin/api/clinics?pw='+PW).then(function(r){return r.json();});
    renderClinics(allClinics);
    loadPending();
  }
}

async function submitRequestChanges(id) {
  var feedback = (document.getElementById('pr-feedback')||{}).value || '';
  if (!feedback.trim()) { alert('Please write a feedback message for the clinic.'); return; }
  var r = await fetch('/admin/api/pending?pw='+PW, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'request_changes',id:id,feedback_message:feedback})});
  var d = await r.json();
  if (d.ok) {
    document.getElementById('pending-overlay').classList.remove('open');
    if (d.form_link) { showLink('Resubmission link for clinic', d.form_link, null); }
    loadPending();
  }
}

async function submitReject(id) {
  var reason = (document.getElementById('pr-reject-reason')||{}).value || '';
  if (!confirm('Reject this submission? The clinic will be notified.')) return;
  var r = await fetch('/admin/api/pending?pw='+PW, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'reject',id:id,reject_reason:reason})});
  var d = await r.json();
  if (d.ok) { document.getElementById('pending-overlay').classList.remove('open'); loadPending(); }
}

async function rejectPending(id) { submitReject(id); }

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

// ---- Conversations ----
var _convos = [];

async function loadConvos() {
  var r = await fetch('/admin/api/conversations?pw=' + PW);
  _convos = await r.json();
  var el = document.getElementById('convos-list');
  if (!el) return;
  var btn = document.getElementById('convos-tab-btn');
  if (btn) btn.textContent = 'Conversations (' + _convos.length + ')';
  if (!_convos.length) { el.innerHTML = '<p style="color:#94a3b8;font-size:14px;padding:20px 0">No conversations recorded yet.</p>'; return; }
  el.innerHTML = _convos.map(function(c, i) {
    var date = c.ts ? c.ts.replace('T', ' ').slice(0, 16) : '';
    var preview = (c.q || '').slice(0, 90) + ((c.q || '').length > 90 ? '...' : '');
    return '<div class="convo-card" id="convo-' + i + '">' +
      '<div class="convo-head" onclick="toggleConvo(' + i + ')" style="cursor:pointer">' +
        '<div style="flex:1"><span style="font-size:12px;color:#94a3b8;margin-right:10px">' + date + '</span>' +
        '<span style="font-size:13px;color:#1e293b">' + esc(preview) + '</span></div>' +
        '<span id="toggle-' + i + '" style="color:#94a3b8;font-size:12px;flex-shrink:0;padding-left:12px">&#9656;</span>' +
      '</div>' +
      '<div id="body-' + i + '" style="display:none;padding:16px 0 4px;border-top:1px solid #f1f5f9;margin-top:10px">' +
        '<div style="background:#f8fafc;border-radius:8px;padding:12px 14px;margin-bottom:10px">' +
          '<div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Visitor</div>' +
          '<div style="font-size:13px;line-height:1.6">' + esc(c.q || '') + '</div>' +
        '</div>' +
        '<div style="background:#eef2ff;border-radius:8px;padding:12px 14px">' +
          '<div style="font-size:11px;font-weight:600;color:#4f5fe8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Monica</div>' +
          '<div style="font-size:13px;line-height:1.7" id="monica-' + i + '"></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  // Render Monica text with basic markdown after DOM is built
  _convos.forEach(function(c, i) {
    var el2 = document.getElementById('monica-' + i);
    if (el2) el2.innerHTML = renderMonicaText(c.a || '');
  });
}

function renderMonicaText(text) {
  if (!text) return '';
  // Parse links [text](url) manually — no regex to avoid template literal escaping issues
  var out = '';
  var i = 0;
  while (i < text.length) {
    if (text[i] === '[') {
      var cb = text.indexOf(']', i);
      if (cb > i && text[cb + 1] === '(') {
        var cp = text.indexOf(')', cb + 2);
        if (cp > cb + 2) {
          var linkText = esc(text.slice(i + 1, cb));
          var linkUrl = text.slice(cb + 2, cp);
          if (linkUrl.slice(0, 4) === 'http') {
            out += '<a href="' + esc(linkUrl) + '" target="_blank" style="color:#4f5fe8;font-weight:500">' + linkText + ' &#8599;</a>';
            i = cp + 1; continue;
          }
        }
      }
    }
    out += esc(text[i]);
    i++;
  }
  // Bold **text** — split on ** and alternate
  var boldParts = out.split('**');
  out = boldParts.map(function(p, idx) { return idx % 2 === 1 ? '<strong>' + p + '</strong>' : p; }).join('');
  // Newlines
  out = out.split('\\n\\n').join('</p><p style="margin-top:8px">');
  out = out.split('\\n').join('<br>');
  return '<p>' + out + '</p>';
}

function toggleConvo(i) {
  var body = document.getElementById('body-' + i);
  var toggle = document.getElementById('toggle-' + i);
  var open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  toggle.innerHTML = open ? '&#9656;' : '&#9662;';
}

function exportConvos() {
  if (!_convos.length) { alert('No conversations to export.'); return; }
  var lines = ['# Monica Conversations Export', ''];
  _convos.forEach(function(c) {
    var date = c.ts ? c.ts.replace('T', ' ').slice(0, 16) : '';
    lines.push('---', '', '**' + date + '**', '', '**Visitor:** ' + (c.q || ''), '', '**Monica:** ' + (c.a || ''), '');
  });
  var blob = new Blob([lines.join('\\n')], { type: 'text/markdown' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'monica-conversations.md'; a.click();
}

// ---- Settings ----
var _settingsCache = null;
var TEMPLATE_KEYS = ['submission_received','changes_requested','approved','approved_with_edits','rejected','portal_login'];
var TEMPLATE_LABELS = {submission_received:'Submission received (to clinic)',changes_requested:'Changes requested (to clinic)',approved:'Approved as submitted (to clinic)',approved_with_edits:'Approved with edits (to clinic)',rejected:'Rejected (to clinic)',portal_login:'Portal login details (to clinic)'};

async function loadSettings() {
  var r = await fetch('/admin/api/settings?pw=' + PW);
  _settingsCache = await r.json();
  var fields = ['notification_email','google_chat_webhook','from_email','reply_to','team_members'];
  fields.forEach(function(f) { var el = document.getElementById('s-' + f); if (el) el.value = _settingsCache[f] || ''; });
  var tl = document.getElementById('template-list');
  if (tl) {
    tl.innerHTML = TEMPLATE_KEYS.map(function(key) {
      var tmpl = (_settingsCache.templates || {})[key] || {};
      return '<div style="margin-bottom:18px;background:#f8fafc;border-radius:10px;padding:16px"><p style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:10px">' + esc(TEMPLATE_LABELS[key]||key) + '</p>' +
        '<div style="margin-bottom:8px"><label style="font-size:11px;color:#64748b;display:block;margin-bottom:3px">Subject</label><input data-tmpl="' + key + '" data-field="subject" value="' + esc(tmpl.subject||'') + '" style="width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:7px;font-size:13px;font-family:inherit"></div>' +
        '<div><label style="font-size:11px;color:#64748b;display:block;margin-bottom:3px">Body</label><textarea data-tmpl="' + key + '" data-field="body" rows="5" style="width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:7px;font-size:13px;font-family:inherit;resize:vertical">' + esc(tmpl.body||'') + '</textarea></div></div>';
    }).join('');
  }
}

async function saveSettings() {
  var fields = ['notification_email','google_chat_webhook','from_email','reply_to','team_members'];
  var updates = {};
  fields.forEach(function(f) { var el = document.getElementById('s-' + f); if (el) updates[f] = el.value; });
  updates.templates = {};
  document.querySelectorAll('[data-tmpl]').forEach(function(el) {
    var key = el.getAttribute('data-tmpl'); var field = el.getAttribute('data-field');
    if (!updates.templates[key]) updates.templates[key] = {};
    updates.templates[key][field] = el.value;
  });
  var r = await fetch('/admin/api/settings?pw=' + PW, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(updates)});
  var d = await r.json();
  if (d.ok) {
    _settingsCache = Object.assign({}, _settingsCache, updates);
    var saved = document.getElementById('settings-saved');
    if (saved) { saved.style.display='inline'; setTimeout(function(){saved.style.display='none';},2000); }
  }
}

// Load settings early so team members list is ready for pending assignment
loadSettings();

`;
