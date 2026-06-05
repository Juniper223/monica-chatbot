// Clinic portal form — glassmorphism design
// Standalone JS module — no template-literal escaping issues

const FAVICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAATlBMVEVHcEz////////////////////////////////////y8vMvNEJNUVxjZm93eoGOkJamp6zU1dcAAAQBDCQAABvk5OYOFiq6u7+ChIsSGi5EqP93AAAACnRSTlMAMYbC7P9fFt4948i2xQAAAQtJREFUeAFc0lEOhCAMRVFUnjqgjpaiuv+NTpupErw/kpyAAXBPTdt5wHdt4971Ane+r2gYUTUOxT4IcZLmefmuG7RPMQRKGkvESy46QHHfd9aSfOkL4L/yaMjrcaxnJGFagVGthyFt0HJUBdAL+hfiYBlnwMve8cZJZwYAjWtfuEWZyBOk1nU3MmehiZLYFSB1zhvy+hCddowOf+QAzEKJ+Btg3RgQEgtNB0qyrBVl2pSL6LKdjbKeEao618JSXCpsXQProLQzn7lg48pPt4t1H/PN3g7eWmhXtsV7u7K7jZPyrpNHu+xSiCyaSHR4nkkpJsW1ekRPmRLFrVj9NM/rqJ7mb7gSNd7sAADlMRjEoLQZNQAAAABJRU5ErkJggg==';

const LOGO_URL = 'https://rehab-online.org.uk/wp-content/uploads/2026/04/rehab-online-logo.svg';

const SECTIONS = [
  { id: 's1',  label: 'Basics'       },
  { id: 's2',  label: 'Treatments'   },
  { id: 's3',  label: 'Addictions'   },
  { id: 's4',  label: 'Mental health'},
  { id: 's5',  label: 'Funding'      },
  { id: 's6',  label: 'Eligibility'  },
  { id: 's7',  label: 'Ethos'        },
  { id: 's8',  label: 'Media'        },
  { id: 's9',  label: 'Reviews'      },
  { id: 's10', label: 'About'        },
];

export function buildFormPage({ clinic = null, token, expiry, error = null }) {
  const isUpdate = !!clinic;

  function val(f, fallback = '') { return clinic ? (clinic[f] || fallback) : fallback; }
  function checked(f, v) {
    const s = val(f, '');
    if (Array.isArray(s)) return s.includes(v) ? 'checked' : '';
    return s.split(',').map(x => x.trim().toLowerCase()).includes(v.toLowerCase()) ? 'checked' : '';
  }
  function sel(f, v) { return val(f) === v ? 'selected' : ''; }
  function radio(name, value, label, defaultChecked = false) {
    const chk = val(name) === value || (defaultChecked && !val(name));
    return `<label class="pill-radio ${chk ? 'active' : ''}"><input type="radio" name="${name}" value="${value}"${chk ? ' checked' : ''}> ${label}</label>`;
  }

  const TREATMENT_TYPES = [
    ['residential', 'Residential rehabilitation'],
    ['detox', 'Standalone detox'],
    ['outpatient', 'Outpatient / day programme'],
    ['online', 'Online / remote programme'],
  ];
  const ADDICTIONS = [
    ['alcohol','Alcohol'], ['cocaine','Cocaine'], ['heroin_opioids','Heroin / opioids'],
    ['cannabis','Cannabis'], ['prescription','Prescription drugs'], ['gambling','Gambling'],
    ['stimulants','Stimulants (MDMA, meth, ketamine)'], ['eating_disorders','Eating disorders'],
    ['sex_addiction','Sex / porn addiction'], ['other','Other'],
  ];
  const MENTAL_HEALTH = [
    ['dual_diagnosis','Dual diagnosis'], ['ptsd_trauma','PTSD / trauma'],
    ['depression','Depression'], ['anxiety','Anxiety'], ['personality_disorder','Personality disorder'],
    ['psychosis','Psychosis'], ['other','Other'],
  ];
  const FUNDING_TYPES = [
    ['private','Private (self-pay)'], ['insurance','Private medical insurance'],
    ['nhs_free','NHS / publicly funded'], ['charitable','Charitable / bursary'],
  ];
  const ACCREDITATIONS = [
    ['cqc_registered','CQC registered'], ['his_registered','HIS registered (Scotland)'],
    ['ciw_registered','CIW registered (Wales)'], ['ukrn','UKRN member'],
    ['iqips','IQiPS accredited'], ['ukna','UKNA member'], ['bism','BISM member'],
  ];

  function checkboxGroup(field, options) {
    return `<div class="pill-group">${options.map(([v, l]) =>
      `<label class="pill-check ${checked(field, v) ? 'active' : ''}"><input type="checkbox" name="${field}" value="${v}" ${checked(field, v)}> ${l}</label>`
    ).join('')}</div>`;
  }

  const progressDots = SECTIONS.map((s, i) =>
    `<a class="prog-dot" href="#${s.id}" data-target="${s.id}">
      <span class="prog-num">${i + 1}</span>
      <span class="prog-label">${s.label}</span>
    </a>`
  ).join('');

  const descVal = (val('description') || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${isUpdate ? 'Update your listing' : 'Apply for a listing'} | Rehab Online</title>
<link rel="icon" href="${FAVICON}">
<style>
:root {
  --bg-from: #060b22;
  --bg-to: #141a5b;
  --glass: rgba(255,255,255,0.055);
  --glass-border: rgba(255,255,255,0.12);
  --glass-hover: rgba(255,255,255,0.09);
  --accent: #4f5fe8;
  --accent2: #7c3aed;
  --text: #f0f4ff;
  --muted: rgba(255,255,255,0.5);
  --active-pill: rgba(79,95,232,0.25);
  --active-border: rgba(79,95,232,0.6);
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: system-ui,-apple-system,'Segoe UI',sans-serif;
  background: linear-gradient(145deg, var(--bg-from) 0%, var(--bg-to) 60%, #1a1060 100%);
  min-height: 100vh;
  color: var(--text);
  padding-bottom: 80px;
}

/* ---- Progress bar ---- */
.progress-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  background: rgba(6,11,34,0.82);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--glass-border);
  padding: 0 20px;
  overflow-x: auto;
  scrollbar-width: none;
}
.progress-bar::-webkit-scrollbar { display: none; }
.progress-inner {
  display: flex; align-items: stretch; gap: 2px;
  min-width: max-content; height: 52px;
}
.prog-dot {
  display: flex; align-items: center; gap: 7px;
  padding: 0 14px; text-decoration: none; color: var(--muted);
  font-size: 12px; font-weight: 500; transition: all .2s; white-space: nowrap;
  border-bottom: 2px solid transparent; position: relative;
}
.prog-dot:hover { color: var(--text); }
.prog-dot.active { color: var(--text); border-bottom-color: var(--accent); }
.prog-num {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--glass); border: 1px solid var(--glass-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0; transition: all .2s;
}
.prog-dot.active .prog-num {
  background: var(--accent); border-color: var(--accent); color: #fff;
}
.prog-dot.done .prog-num { background: rgba(34,197,94,.2); border-color: rgba(34,197,94,.5); color: rgba(34,197,94,1); }

/* ---- Hero header ---- */
.hero {
  padding: 90px 20px 40px;
  max-width: 760px; margin: 0 auto;
  text-align: center;
}
.hero img { height: 44px; margin-bottom: 24px; filter: brightness(0) invert(1); }
.hero h1 { font-size: clamp(22px,4vw,32px); font-weight: 700; margin-bottom: 10px; }
.hero p { font-size: 15px; color: var(--muted); max-width: 520px; margin: 0 auto; line-height: 1.6; }

/* ---- Notice ---- */
.notice {
  max-width: 760px; margin: 0 auto 8px; padding: 0 20px;
}
.notice-inner {
  background: rgba(251,191,36,.08); border: 1px solid rgba(251,191,36,.25);
  border-radius: 10px; padding: 12px 16px;
  font-size: 13px; color: rgba(253,230,138,1); line-height: 1.5;
}
.error-box {
  background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3);
  border-radius: 10px; padding: 12px 16px; font-size: 13px;
  color: rgba(252,165,165,1); margin: 0 20px 16px; max-width: 720px;
}

/* ---- Sections ---- */
.container { max-width: 760px; margin: 0 auto; padding: 0 20px; }
.section {
  background: var(--glass);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 28px; margin-bottom: 16px;
  transition: border-color .3s;
}
.section:focus-within { border-color: rgba(79,95,232,.35); }
.section-head {
  display: flex; align-items: center; gap: 12px; margin-bottom: 22px;
}
.section-num {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff;
  box-shadow: 0 4px 12px rgba(79,95,232,.35);
}
.section h2 { font-size: 16px; font-weight: 600; color: var(--text); }

/* ---- Fields ---- */
.field { margin-bottom: 18px; }
.field:last-child { margin-bottom: 0; }
.field > label {
  display: block; font-size: 12px; font-weight: 600;
  color: var(--muted); text-transform: uppercase; letter-spacing: .06em;
  margin-bottom: 8px;
}
input[type=text], input[type=email], input[type=tel], input[type=url],
input[type=number], select, textarea {
  width: 100%; padding: 10px 14px;
  background: rgba(255,255,255,0.07);
  border: 1px solid var(--glass-border);
  border-radius: 9px; font-size: 14px; font-family: inherit;
  color: var(--text); outline: none;
  transition: background .2s, border-color .2s, box-shadow .2s;
  -webkit-appearance: none;
}
input::placeholder, textarea::placeholder { color: rgba(255,255,255,.3); }
select option { background: #141a5b; color: #fff; }
input:focus, select:focus, textarea:focus {
  background: rgba(255,255,255,.1);
  border-color: rgba(99,179,237,.55);
  box-shadow: 0 0 0 3px rgba(99,179,237,.1);
}
textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.hint { font-size: 12px; color: var(--muted); margin-top: 6px; line-height: 1.5; }

/* ---- Pill checkboxes and radios ---- */
.pill-group { display: flex; flex-wrap: wrap; gap: 8px; }
.pill-check, .pill-radio {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 14px; border-radius: 99px; cursor: pointer;
  background: var(--glass); border: 1px solid var(--glass-border);
  font-size: 13px; color: var(--text); transition: all .15s;
  user-select: none; white-space: nowrap;
}
.pill-check:hover, .pill-radio:hover {
  background: var(--glass-hover); border-color: rgba(255,255,255,.22);
}
.pill-check.active, .pill-radio.active {
  background: var(--active-pill); border-color: var(--active-border); color: #fff;
}
.pill-check input, .pill-radio input { display: none; }
.check-mark {
  width: 16px; height: 16px; border-radius: 4px; flex-shrink: 0;
  border: 1.5px solid var(--glass-border); display: flex; align-items: center;
  justify-content: center; font-size: 10px;
}
.pill-check.active .check-mark { background: var(--accent); border-color: var(--accent); }
.radio-dot {
  width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
  border: 1.5px solid var(--glass-border);
}
.pill-radio.active .radio-dot { background: var(--accent); border-color: var(--accent); }

/* ---- Photo upload ---- */
.upload-zone {
  border: 2px dashed var(--glass-border); border-radius: 12px;
  padding: 28px 20px; text-align: center; cursor: pointer;
  transition: border-color .2s, background .2s;
}
.upload-zone:hover { border-color: rgba(79,95,232,.5); background: rgba(79,95,232,.05); }
.upload-zone.dragover { border-color: var(--accent); background: rgba(79,95,232,.1); }
.upload-icon { font-size: 32px; margin-bottom: 8px; }
.upload-zone p { font-size: 14px; color: var(--muted); line-height: 1.5; }
.upload-zone strong { color: var(--text); }
.photo-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(120px,1fr)); gap: 10px; margin-top: 14px; }
.photo-thumb {
  aspect-ratio: 4/3; object-fit: cover; border-radius: 8px;
  border: 1px solid var(--glass-border);
}
.logo-thumb {
  max-height: 80px; max-width: 200px; object-fit: contain;
  border-radius: 8px; border: 1px solid var(--glass-border);
  padding: 8px; background: rgba(255,255,255,.05); margin-top: 10px;
}

/* ---- Char counter ---- */
.char-count { font-size: 12px; color: var(--muted); text-align: right; margin-top: 5px; }
.char-count.warn { color: #fbbf24; }
.char-count.over { color: #f87171; }

/* ---- Submit ---- */
.submit-section { text-align: center; padding: 8px 0 20px; }
.submit-section p { font-size: 13px; color: var(--muted); margin-bottom: 20px; line-height: 1.6; max-width: 520px; margin-left: auto; margin-right: auto; }
.btn-submit {
  display: inline-flex; align-items: center; gap: 10px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff; border: none; padding: 16px 48px;
  border-radius: 99px; font-size: 16px; font-weight: 600;
  cursor: pointer; transition: opacity .2s, transform .15s;
  box-shadow: 0 8px 32px rgba(79,95,232,.4);
  letter-spacing: .01em;
}
.btn-submit:hover { opacity: .9; transform: translateY(-1px); }
.btn-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; }

@media(max-width:600px) {
  .two-col { grid-template-columns: 1fr; }
  .prog-label { display: none; }
  .section { padding: 20px; }
}
</style>
</head>
<body>

<!-- Progress bar -->
<nav class="progress-bar" id="progress-bar">
  <div class="progress-inner">${progressDots}</div>
</nav>

<!-- Hero -->
<div class="hero">
  <img src="${LOGO_URL}" alt="Rehab Online" onerror="this.style.display='none'">
  <h1>${isUpdate ? `Update your listing` : `Apply for a listing`}</h1>
  <p>${isUpdate
    ? `Review and update your clinic details. Changes go live once our team has reviewed them.`
    : `Complete the form below to apply for a listing on Rehab Online. We review every application before publishing.`
  }</p>
</div>

<!-- Notice -->
<div class="notice">
  ${error ? `<div class="error-box">${error}</div>` : ''}
  <div class="notice-inner">Regulatory status, inspection rating, and age verification are set by Rehab Online after independent verification and do not appear in this form.</div>
</div>

<form class="container" method="POST" action="/form" enctype="multipart/form-data" id="portal-form">
<input type="hidden" name="token" value="${token}">
<input type="hidden" name="expiry" value="${expiry}">
${clinic ? `<input type="hidden" name="clinic_id" value="${clinic.id}">` : ''}
<input type="hidden" name="type" value="${isUpdate ? 'update' : 'new'}">
<input type="hidden" name="photo_data" id="photo-data-hidden" value="">
<input type="hidden" name="logo_data" id="logo-data-hidden" value="">
<br>

<!-- S1: Basics -->
<div class="section" id="s1">
  <div class="section-head"><div class="section-num">1</div><h2>Basic information</h2></div>
  <div class="field"><label>Clinic name *</label>
    <input type="text" name="title" value="${val('title')}" required placeholder="The Haynes Clinic"></div>
  <div class="two-col">
    <div class="field"><label>Website *</label>
      <input type="url" name="website" value="${val('website')}" required placeholder="https://"></div>
    <div class="field"><label>Main phone number *</label>
      <input type="tel" name="phone" value="${val('phone')}" required></div>
  </div>
  <div class="field"><label>Enquiries email</label>
    <input type="email" name="email" value="${val('email')}" placeholder="admissions@clinic.co.uk"></div>
  <div class="field"><label>Address *</label>
    <input type="text" name="address" value="${val('address')}" required placeholder="House, Street, Town"></div>
  <div class="field"><label>Postcode *</label>
    <input type="text" name="postcode" value="${val('postcode')}" required placeholder="SW1A 1AA" style="max-width:180px"></div>
</div>

<!-- S2: Treatment types -->
<div class="section" id="s2">
  <div class="section-head"><div class="section-num">2</div><h2>Treatment types offered</h2></div>
  ${checkboxGroup('treatment_types', TREATMENT_TYPES)}
</div>

<!-- S3: Addictions -->
<div class="section" id="s3">
  <div class="section-head"><div class="section-num">3</div><h2>Addictions treated</h2></div>
  ${checkboxGroup('addictions_treated', ADDICTIONS)}
</div>

<!-- S4: Mental health -->
<div class="section" id="s4">
  <div class="section-head"><div class="section-num">4</div><h2>Mental health conditions treated</h2></div>
  ${checkboxGroup('mental_health_conditions', MENTAL_HEALTH)}
</div>

<!-- S5: Funding -->
<div class="section" id="s5">
  <div class="section-head"><div class="section-num">5</div><h2>Funding and cost</h2></div>
  ${checkboxGroup('funding_types', FUNDING_TYPES)}
  <div class="two-col" style="margin-top:18px">
    <div class="field"><label>Weekly cost from (£)</label>
      <input type="number" name="price_per_week_from" value="${val('price_per_week_from')}" placeholder="e.g. 3000">
      <div class="hint">Leave blank if not applicable</div></div>
    <div class="field"><label>Weekly cost up to (£)</label>
      <input type="number" name="price_per_week_to" value="${val('price_per_week_to')}" placeholder="e.g. 8000"></div>
  </div>
  <div class="field"><label>Insurance networks accepted</label>
    <input type="text" name="insurance_networks" value="${val('insurance_networks')}" placeholder="e.g. BUPA, AXA Health, Vitality"></div>
</div>

<!-- S6: Eligibility -->
<div class="section" id="s6">
  <div class="section-head"><div class="section-num">6</div><h2>Access and eligibility</h2></div>
  <div class="field"><label>Gender</label>
    <div class="pill-group">
      ${radio('gender_model','mixed','Mixed',true)}
      ${radio('gender_model','women_only','Women only')}
      ${radio('gender_model','men_only','Men only')}
    </div></div>
  <div class="field"><label>Do you treat patients under 18?</label>
    <div class="pill-group">
      ${radio('treats_under_18s_claimed','yes','Yes')}
      ${radio('treats_under_18s_claimed','no','No, adults only (18+)',true)}
      ${radio('treats_under_18s_claimed','contact','Contact us to discuss')}
    </div>
    <div class="hint">This will be independently verified by Rehab Online before publishing.</div></div>
  <div class="field"><label>Detox on site?</label>
    <div class="pill-group">
      ${radio('detox_on_site','True','Yes')}
      ${radio('detox_on_site','False','No')}
    </div></div>
  <div class="field"><label>Dual diagnosis (addiction + mental health simultaneously)?</label>
    <div class="pill-group">
      ${radio('dual_diagnosis','true','Yes')}
      ${radio('dual_diagnosis','false','No')}
    </div></div>
  <div class="field"><label>Family programme?</label>
    <div class="pill-group">
      ${radio('has_family_programme','True','Yes')}
      ${radio('has_family_programme','False','No')}
    </div></div>
  <div class="field"><label>Mother and child service?</label>
    <div class="pill-group">
      ${radio('mother_child_service','true','Yes')}
      ${radio('mother_child_service','false','No')}
    </div></div>
  <div class="two-col">
    <div class="field"><label>Number of beds / capacity</label>
      <input type="number" name="capacity" value="${val('capacity')}" placeholder="e.g. 18"></div>
    <div class="field"><label>Typical waiting time</label>
      <select name="waiting_time">
        <option value="">Select</option>
        <option value="immediate" ${sel('waiting_time','immediate')}>Beds available immediately</option>
        <option value="days" ${sel('waiting_time','days')}>Usually within a few days</option>
        <option value="week" ${sel('waiting_time','week')}>Usually within a week</option>
        <option value="weeks" ${sel('waiting_time','weeks')}>2-4 weeks</option>
        <option value="longer" ${sel('waiting_time','longer')}>Longer (contact for details)</option>
      </select></div>
  </div>
  <div class="field"><label>Languages available (other than English)</label>
    <input type="text" name="languages" value="${val('languages')}" placeholder="e.g. Welsh, Spanish, Urdu"></div>
</div>

<!-- S7: Ethos -->
<div class="section" id="s7">
  <div class="section-head"><div class="section-num">7</div><h2>Setting and ethos</h2></div>
  <div class="field"><label>Setting</label>
    <div class="pill-group">
      ${radio('setting','rural','Rural')}
      ${radio('setting','suburban','Suburban')}
      ${radio('setting','urban','Urban / city')}
      ${radio('setting','coastal','Coastal')}
    </div></div>
  <div class="field"><label>12-step programme?</label>
    <div class="pill-group">
      ${radio('twelve_step','yes','Yes, 12-step based')}
      ${radio('twelve_step','informed','12-step informed')}
      ${radio('twelve_step','no','Non-12-step')}
    </div></div>
  <div class="field"><label>Faith-based programme?</label>
    <div class="pill-group">
      ${radio('is_faith_based','True','Yes')}
      ${radio('is_faith_based','False','No')}
    </div></div>
  <div class="field" id="faith-row" style="${val('is_faith_based') === 'True' ? '' : 'display:none'}">
    <label>Faith tradition</label>
    <input type="text" name="faith_tradition" value="${val('faith_tradition')}" placeholder="e.g. Christian"></div>
  <div class="field"><label>Named therapies and modalities</label>
    <input type="text" name="named_modalities" value="${val('named_modalities')}" placeholder="e.g. CBT, EMDR, Mindfulness, Trauma-informed">
    <div class="hint">Comma-separated</div></div>
  <div class="field"><label>Accreditations and memberships</label>
    ${checkboxGroup('accreditations', ACCREDITATIONS)}
    <div style="margin-top:10px"><input type="text" name="accreditations_other" value="${val('accreditations_other')}" placeholder="Any others (free text)"></div>
  </div>
</div>

<!-- S8: Media -->
<div class="section" id="s8">
  <div class="section-head"><div class="section-num">8</div><h2>Photos and logo</h2></div>
  <div class="field">
    <label>Clinic photos (up to 5)</label>
    <div class="upload-zone" id="photo-drop">
      <div class="upload-icon">🖼</div>
      <p><strong>Drop photos here</strong> or click to browse<br>JPG or PNG, max 5MB each</p>
      <input type="file" id="photo-input" accept="image/jpeg,image/png,image/webp" multiple style="display:none">
    </div>
    <div class="photo-grid" id="photo-preview"></div>
    <div class="hint">Photos are reviewed before publishing. Show your reception, bedrooms, gardens, therapy rooms.</div>
  </div>
  <div class="field" style="margin-top:24px">
    <label>Clinic logo</label>
    <div class="upload-zone" id="logo-drop" style="max-width:360px">
      <div class="upload-icon">🏷</div>
      <p><strong>Drop your logo here</strong> or click to browse<br>PNG or SVG preferred, transparent background ideal</p>
      <input type="file" id="logo-input" accept="image/png,image/svg+xml,image/jpeg,image/webp" style="display:none">
    </div>
    <div id="logo-preview"></div>
    <div class="hint">Displayed on your listing page alongside your clinic name.</div>
  </div>
</div>

<!-- S9: Reviews and links -->
<div class="section" id="s9">
  <div class="section-head"><div class="section-num">9</div><h2>Reviews and social links</h2></div>
  <div class="two-col">
    <div class="field"><label>Google Reviews URL</label>
      <input type="url" name="google_reviews_url" value="${val('google_reviews_url')}" placeholder="https://g.page/r/...">
      <div class="hint">Link to your Google Business Profile reviews</div></div>
    <div class="field"><label>Trustpilot URL</label>
      <input type="url" name="trustpilot_url" value="${val('trustpilot_url')}" placeholder="https://www.trustpilot.com/review/..."></div>
  </div>
  <div class="field"><label>NHS Friends and Family score (if applicable)</label>
    <input type="text" name="nhs_ff_score" value="${val('nhs_ff_score')}" placeholder="e.g. 96% recommended (as of Jan 2025)"></div>
  <div class="two-col">
    <div class="field"><label>Facebook page URL</label>
      <input type="url" name="facebook_url" value="${val('facebook_url')}" placeholder="https://facebook.com/..."></div>
    <div class="field"><label>Instagram profile URL</label>
      <input type="url" name="instagram_url" value="${val('instagram_url')}" placeholder="https://instagram.com/..."></div>
  </div>
  <div class="field"><label>LinkedIn page URL</label>
    <input type="url" name="linkedin_url" value="${val('linkedin_url')}" placeholder="https://linkedin.com/company/..." style="max-width:420px"></div>
</div>

<!-- S10: About -->
<div class="section" id="s10">
  <div class="section-head"><div class="section-num">10</div><h2>About your clinic</h2></div>
  <div class="field">
    <label>Description (shown to people searching for treatment)</label>
    <textarea name="description" id="desc-field" rows="7" placeholder="Describe your clinic, your approach, and what makes it distinctive.

Use a blank line between paragraphs.">${descVal}</textarea>
    <div class="char-count" id="desc-count"></div>
    <div class="hint">Use a blank line between paragraphs. Aim for 300-600 characters.</div>
  </div>
</div>

<!-- Submit -->
<div class="submit-section">
  <p>By submitting this form you confirm the information provided is accurate. Rehab Online will review your submission and may contact you to verify details before publishing.</p>
  <button type="submit" class="btn-submit" id="submit-btn">
    <span id="submit-label">${isUpdate ? 'Submit update for review' : 'Submit for review'}</span>
    <span>&#10132;</span>
  </button>
</div>

</form>

<script>
// Pill toggle interaction
document.querySelectorAll('.pill-check').forEach(function(el) {
  el.addEventListener('click', function() {
    var inp = this.querySelector('input');
    inp.checked = !inp.checked;
    this.classList.toggle('active', inp.checked);
  });
});
document.querySelectorAll('.pill-radio').forEach(function(el) {
  el.addEventListener('click', function() {
    var name = this.querySelector('input').name;
    document.querySelectorAll('.pill-radio input[name="' + name + '"]').forEach(function(r) {
      r.closest('.pill-radio').classList.remove('active');
    });
    this.querySelector('input').checked = true;
    this.classList.add('active');
    // Faith tradition toggle
    if (name === 'is_faith_based') {
      document.getElementById('faith-row').style.display = this.querySelector('input').value === 'True' ? '' : 'none';
    }
  });
});

// Description counter
var descField = document.getElementById('desc-field');
var descCount = document.getElementById('desc-count');
function updateCount() {
  var n = descField ? descField.value.length : 0;
  if (!n) { descCount.textContent = ''; return; }
  descCount.textContent = n + ' characters' + (n > 800 ? ' - consider trimming for best results' : n > 600 ? ' - slightly long' : '');
  descCount.className = 'char-count' + (n > 800 ? ' over' : n > 600 ? ' warn' : '');
}
if (descField) { descField.addEventListener('input', updateCount); updateCount(); }

// Photo upload
var photoData = [];
function initUpload(dropId, inputId, previewId, dataHiddenId, multiple, thumbClass) {
  var drop = document.getElementById(dropId);
  var inp = document.getElementById(inputId);
  var preview = document.getElementById(previewId);
  var hidden = document.getElementById(dataHiddenId);
  if (!drop) return;
  drop.addEventListener('click', function() { inp.click(); });
  drop.addEventListener('dragover', function(e) { e.preventDefault(); drop.classList.add('dragover'); });
  drop.addEventListener('dragleave', function() { drop.classList.remove('dragover'); });
  drop.addEventListener('drop', function(e) { e.preventDefault(); drop.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
  inp.addEventListener('change', function() { handleFiles(this.files); });
  var store = [];
  function handleFiles(files) {
    var list = Array.from(files).slice(0, multiple ? 5 : 1);
    if (!multiple) store = [];
    var pending = list.length;
    list.forEach(function(file) {
      if (file.size > 5 * 1024 * 1024) { alert(file.name + ' is over 5MB.'); pending--; return; }
      var reader = new FileReader();
      reader.onload = function(ev) {
        store.push({ name: file.name, data: ev.target.result });
        var img = document.createElement('img');
        img.src = ev.target.result;
        img.className = thumbClass;
        preview.appendChild(img);
        pending--;
        if (pending === 0) hidden.value = JSON.stringify(store);
      };
      reader.readAsDataURL(file);
    });
  }
}
initUpload('photo-drop','photo-input','photo-preview','photo-data-hidden',true,'photo-thumb');
initUpload('logo-drop','logo-input','logo-preview','logo-data-hidden',false,'logo-thumb');

// Progress bar — IntersectionObserver
var sections = ${JSON.stringify(SECTIONS.map(s => s.id))};
var progDots = {};
sections.forEach(function(id) {
  var el = document.querySelector('.prog-dot[data-target="' + id + '"]');
  if (el) progDots[id] = el;
});
var activeSection = sections[0];
var obs = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      activeSection = entry.target.id;
      sections.forEach(function(id) {
        if (progDots[id]) progDots[id].classList.toggle('active', id === activeSection);
      });
      var dot = progDots[activeSection];
      if (dot) dot.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
}, { threshold: 0.3 });
sections.forEach(function(id) { var el = document.getElementById(id); if (el) obs.observe(el); });

// Submit
document.getElementById('portal-form').addEventListener('submit', function() {
  var btn = document.getElementById('submit-btn');
  document.getElementById('submit-label').textContent = 'Submitting...';
  btn.disabled = true;
});
</script>
</body>
</html>`;
}

export function buildFormSuccessPage(isUpdate) {
  const LOGO_URL = 'https://rehab-online.org.uk/wp-content/uploads/2026/04/rehab-online-logo.svg';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Submission received | Rehab Online</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:linear-gradient(145deg,#060b22,#141a5b 60%,#1a1060);
  min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{background:rgba(255,255,255,.07);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:48px 40px;
  max-width:480px;text-align:center}
.card img{height:36px;margin-bottom:28px;filter:brightness(0) invert(1)}
.icon{font-size:52px;margin-bottom:16px}
h1{font-size:24px;font-weight:700;color:#fff;margin-bottom:12px}
p{font-size:15px;color:rgba(255,255,255,.65);line-height:1.7}
</style>
</head>
<body>
<div class="card">
  <img src="${LOGO_URL}" alt="Rehab Online" onerror="this.style.display='none'">
  <div class="icon">&#10003;</div>
  <h1>${isUpdate ? 'Update received' : 'Application received'}</h1>
  <p>${isUpdate
    ? 'Your updated details have been sent to the Rehab Online team for review. Changes will go live once approved, usually within 2 working days.'
    : 'Thank you for applying to be listed on Rehab Online. We will review your application and be in touch if we need any further information.'
  }</p>
</div>
</body>
</html>`;
}
