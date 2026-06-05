// Clinic portal — luxury light design, left sidebar desktop, step bar mobile
// Standalone module — no template-literal escaping issues.

const FAVICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAATlBMVEVHcEz////////////////////////////////////y8vMvNEJNUVxjZm93eoGOkJamp6zU1dcAAAQBDCQAABvk5OYOFiq6u7+ChIsSGi5EqP93AAAACnRSTlMAMYbC7P9fFt4948i2xQAAAQtJREFUeAFc0lEOhCAMRVFUnjqgjpaiuv+NTpupErw/kpyAAXBPTdt5wHdt4971Ane+r2gYUTUOxT4IcZLmefmuG7RPMQRKGkvESy46QHHfd9aSfOkL4L/yaMjrcaxnJGFagVGthyFt0HJUBdAL+hfiYBlnwMve8cZJZwYAjWtfuEWZyBOk1nU3MmehiZLYFSB1zhvy+hCddowOf+QAzEKJ+Btg3RgQEgtNB0qyrBVl2pSL6LKdjbKeEao618JSXCpsXQProLQzn7lg48pPt4t1H/PN3g7eWmhXtsV7u7K7jZPyrpNHu+xSiCyaSHR4nkkpJsW1ekRPmRLFrVj9NM/rqJ7mb7gSNd7sAADlMRjEoLQZNQAAAABJRU5ErkJggg==';
const LOGO_URL = 'https://rehab-online.org.uk/wp-content/uploads/2026/04/rehab-online-logo.svg';

const SECTIONS = [
  { id: 's1',  label: 'Basic information'       },
  { id: 's2',  label: 'Treatment types'          },
  { id: 's3',  label: 'Addictions treated'       },
  { id: 's4',  label: 'Mental health'            },
  { id: 's5',  label: 'Funding and cost'         },
  { id: 's6',  label: 'Access and eligibility'   },
  { id: 's7',  label: 'Setting and ethos'        },
  { id: 's8',  label: 'Photos and logo'          },
  { id: 's9',  label: 'Reviews and links'        },
  { id: 's10', label: 'About your clinic'        },
];

export function buildFormPage({ clinic = null, token, expiry, error = null }) {
  const isUpdate = !!clinic;

  function val(f, fallback) { fallback = fallback === undefined ? '' : fallback; return clinic ? (clinic[f] || fallback) : fallback; }
  function checked(f, v) {
    var s = val(f);
    if (Array.isArray(s)) return s.includes(v) ? 'checked' : '';
    return s.split(',').map(function(x) { return x.trim().toLowerCase(); }).includes(v.toLowerCase()) ? 'checked' : '';
  }
  function sel(f, v) { return val(f) === v ? 'selected' : ''; }
  function radio(name, value, label, def) {
    var chk = val(name) === value || (def && !val(name));
    return '<label class="pill-radio' + (chk ? ' active' : '') + '"><input type="radio" name="' + name + '" value="' + value + '"' + (chk ? ' checked' : '') + '><span>' + label + '</span></label>';
  }
  function checkboxes(field, opts) {
    return '<div class="pill-group">' + opts.map(function(o) {
      var chk = checked(field, o[0]);
      return '<label class="pill-check' + (chk ? ' active' : '') + '"><input type="checkbox" name="' + field + '" value="' + o[0] + '" ' + chk + '><span>' + o[1] + '</span></label>';
    }).join('') + '</div>';
  }
  function sectionHead(num, title) {
    return '<div class="section-head"><span class="snum">' + num + '</span><h2>' + title + '</h2></div>';
  }

  var TREATMENT_TYPES = [
    ['residential','Residential rehabilitation'],['detox','Standalone detox'],
    ['outpatient','Outpatient / day programme'],['online','Online / remote programme'],
  ];
  var ADDICTIONS = [
    ['alcohol','Alcohol'],['cocaine','Cocaine'],['heroin_opioids','Heroin / opioids'],
    ['cannabis','Cannabis'],['prescription','Prescription drugs'],['gambling','Gambling'],
    ['stimulants','Stimulants (MDMA, meth, ketamine)'],['eating_disorders','Eating disorders'],
    ['sex_addiction','Sex / porn addiction'],['other','Other'],
  ];
  var MENTAL_HEALTH = [
    ['dual_diagnosis','Dual diagnosis'],['ptsd_trauma','PTSD / trauma'],
    ['depression','Depression'],['anxiety','Anxiety'],['personality_disorder','Personality disorder'],
    ['psychosis','Psychosis'],['other','Other'],
  ];
  var FUNDING_TYPES = [
    ['private','Private (self-pay)'],['insurance','Private medical insurance'],
    ['nhs_free','NHS / publicly funded'],['charitable','Charitable / bursary'],
  ];
  var ACCREDITATIONS = [
    ['cqc_registered','CQC registered'],['his_registered','HIS (Scotland)'],
    ['ciw_registered','CIW (Wales)'],['ukrn','UKRN member'],
    ['iqips','IQiPS accredited'],['ukna','UKNA member'],['bism','BISM member'],
  ];

  var sidebarItems = SECTIONS.map(function(s, i) {
    return '<a class="nav-item" href="#' + s.id + '" data-target="' + s.id + '">' +
      '<span class="nav-num">' + (i + 1) + '</span>' +
      '<span class="nav-label">' + s.label + '</span>' +
      '</a>';
  }).join('');

  var descVal = (val('description') || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  var sectionIds = JSON.stringify(SECTIONS.map(function(s) { return s.id; }));

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
'<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n' +
'<title>' + (isUpdate ? 'Update your listing' : 'Apply for a listing') + ' | Rehab Online</title>\n' +
'<link rel="icon" href="' + FAVICON + '">\n' +
'<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
'<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">\n' +
'<style>\n' +
':root{--navy:#141a5b;--navy-dk:#0d1240;--navy-header:#080e2a;--navy-tint:rgba(20,26,91,.05);--gold:#b5860a;--bg:#faf9f7;--white:#fff;--border:#e4dfd8;--border-focus:#141a5b;--text:#1a1a2e;--text2:#606880;--muted:#9ca3b0;--card-shadow:0 1px 3px rgba(0,0,0,.06),0 4px 12px rgba(0,0,0,.04);--sidebar:220px}\n' +
'*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n' +
'html{scroll-behavior:smooth}\n' +
'body{font-family:"Inter",system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);line-height:1.5;padding-bottom:80px}\n' +

/* Header */
'.header{background:var(--navy-header);padding:18px 32px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:300}\n' +
'.header img{height:36px;filter:brightness(0) invert(1)}\n' +
'.header-divider{width:1px;height:28px;background:rgba(255,255,255,.2);margin:0 4px}\n' +
'.header-title{color:rgba(255,255,255,.85);font-size:14px;font-weight:500}\n' +

/* Mobile progress bar */
'.mob-progress{display:none;background:var(--white);border-bottom:1px solid var(--border);padding:12px 20px;position:sticky;top:65px;z-index:200}\n' +
'.mob-track{height:3px;background:var(--border);border-radius:99px;overflow:hidden;margin-bottom:7px}\n' +
'.mob-fill{height:100%;background:var(--navy);border-radius:99px;transition:width .4s ease;width:10%}\n' +
'.mob-label{font-size:12px;color:var(--text2);display:flex;justify-content:space-between}\n' +
'.mob-label strong{color:var(--text)}\n' +

/* Layout */
'.layout{max-width:1060px;margin:0 auto;padding:40px 24px 0;display:grid;grid-template-columns:var(--sidebar) 1fr;gap:40px;align-items:start}\n' +

/* Sidebar */
'.sidebar{position:sticky;top:96px;padding-bottom:40px}\n' +
'.sidebar-inner{background:var(--white);border:1px solid var(--border);border-radius:12px;box-shadow:var(--card-shadow);overflow:hidden}\n' +
'.nav-item{display:flex;align-items:center;gap:10px;padding:11px 16px;text-decoration:none;color:var(--text2);font-size:13px;font-weight:500;border-left:3px solid transparent;transition:all .15s;cursor:pointer}\n' +
'.nav-item:hover{background:var(--navy-tint);color:var(--text)}\n' +
'.nav-item.active{border-left-color:var(--gold);color:var(--navy);background:var(--navy-tint);font-weight:600}\n' +
'.nav-item.done{color:var(--text2)}\n' +
'.nav-num{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;color:var(--muted);transition:all .15s}\n' +
'.nav-item.active .nav-num{border-color:var(--gold);background:var(--gold);color:#fff}\n' +
'.nav-item.done .nav-num::before{content:"✓";font-size:10px;color:#166534}\n' +
'.nav-item.done .nav-num{border-color:#bbf7d0;background:#f0fdf4;font-size:0}\n' +

/* Form area */
'.form-area{min-width:0}\n' +

/* Notice */
'.notice{background:#fef9ee;border:1px solid #e8c96a;border-left:3px solid var(--gold);border-radius:8px;padding:12px 16px;font-size:13px;color:#7a5400;margin-bottom:20px;line-height:1.5}\n' +
'.error-box{background:#fef2f2;border:1px solid #fca5a5;border-left:3px solid #ef4444;border-radius:8px;padding:12px 16px;font-size:13px;color:#991b1b;margin-bottom:16px}\n' +

/* Section cards */
'.section{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:32px;margin-bottom:20px;box-shadow:var(--card-shadow);scroll-margin-top:120px;transition:border-color .2s}\n' +
'.section:focus-within{border-color:rgba(20,26,91,.25)}\n' +
'.section-head{display:flex;align-items:center;gap:12px;margin-bottom:26px;padding-bottom:18px;border-bottom:1px solid var(--border)}\n' +
'.snum{width:28px;height:28px;border-radius:50%;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;letter-spacing:-.5px}\n' +
'.section h2{font-size:16px;font-weight:600;color:var(--text);letter-spacing:-.01em}\n' +

/* Fields */
'.field{margin-bottom:20px}.field:last-child{margin-bottom:0}\n' +
'.field > label{display:block;font-size:11.5px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}\n' +
'input[type=text],input[type=email],input[type=tel],input[type=url],input[type=number],select,textarea{width:100%;padding:10px 14px;background:var(--white);border:1px solid var(--border);border-radius:8px;font-size:14px;font-family:inherit;color:var(--text);outline:none;transition:border-color .15s,box-shadow .15s;-webkit-appearance:none}\n' +
'input::placeholder,textarea::placeholder{color:var(--muted)}\n' +
'select option{color:var(--text)}\n' +
'input:focus,select:focus,textarea:focus{border-color:var(--navy);box-shadow:0 0 0 3px rgba(20,26,91,.1)}\n' +
'textarea{resize:vertical;min-height:120px;line-height:1.6}\n' +
'.two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}\n' +
'.hint{font-size:12px;color:var(--muted);margin-top:6px;line-height:1.5}\n' +

/* Pill checkboxes and radios */
'.pill-group{display:flex;flex-wrap:wrap;gap:8px}\n' +
'.pill-check,.pill-radio{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:99px;border:1.5px solid var(--border);background:var(--white);font-size:13px;color:var(--text2);cursor:pointer;transition:all .15s;user-select:none;white-space:nowrap}\n' +
'.pill-check:hover,.pill-radio:hover{border-color:var(--navy);color:var(--navy);background:var(--navy-tint)}\n' +
'.pill-check.active,.pill-radio.active{background:var(--navy);border-color:var(--navy);color:#fff}\n' +
'.pill-check input,.pill-radio input{display:none}\n' +

/* Upload zones */
'.upload-zone{border:1.5px dashed var(--border);border-radius:12px;padding:32px 24px;text-align:center;cursor:pointer;transition:all .2s;background:var(--bg)}\n' +
'.upload-zone:hover,.upload-zone.over{border-color:var(--navy);background:var(--white);box-shadow:0 0 0 3px rgba(20,26,91,.08)}\n' +
'.upload-icon{width:44px;height:44px;border-radius:10px;background:var(--white);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:20px;box-shadow:0 1px 4px rgba(0,0,0,.06)}\n' +
'.upload-zone p{font-size:13px;color:var(--text2);line-height:1.6}\n' +
'.upload-zone strong{color:var(--navy);font-weight:600}\n' +
'.upload-zone .browse{display:inline-block;margin-top:10px;padding:7px 18px;border-radius:99px;border:1.5px solid var(--border);font-size:12px;font-weight:600;color:var(--text2);background:var(--white);pointer-events:none}\n' +
'.photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;margin-top:12px}\n' +
'.photo-thumb{aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid var(--border)}\n' +
'.logo-thumb{max-height:72px;max-width:180px;object-fit:contain;border-radius:8px;border:1px solid var(--border);padding:8px;margin-top:10px;background:var(--white)}\n' +

/* Character counter */
'.char-count{font-size:12px;color:var(--muted);text-align:right;margin-top:5px}\n' +
'.char-count.warn{color:#b45309}.char-count.over{color:#dc2626}\n' +

/* Submit */
'.submit-wrap{padding:8px 0 24px;text-align:center}\n' +
'.submit-wrap p{font-size:13px;color:var(--text2);margin-bottom:20px;line-height:1.6;max-width:480px;margin-left:auto;margin-right:auto}\n' +
'.btn-submit{background:var(--navy);color:#fff;border:none;padding:16px 56px;border-radius:99px;font-size:15px;font-weight:600;cursor:pointer;transition:background .15s,box-shadow .15s,transform .1s;letter-spacing:.02em;box-shadow:0 4px 16px rgba(20,26,91,.3)}\n' +
'.btn-submit:hover{background:var(--navy-dk);transform:translateY(-1px);box-shadow:0 6px 20px rgba(20,26,91,.4)}\n' +
'.btn-submit:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none}\n' +

/* Responsive */
'@media(max-width:767px){' +
'.layout{grid-template-columns:1fr;gap:0;padding-top:0}' +
'.sidebar{display:none}' +
'.mob-progress{display:block}' +
'.form-area{padding-top:16px}' +
'.two-col{grid-template-columns:1fr}' +
'.header{padding:14px 20px}' +
'.section{border-radius:8px;padding:20px}' +
'}\n' +
'</style>\n</head>\n<body>\n' +

'<header class="header">\n' +
'  <img src="' + LOGO_URL + '" alt="Rehab Online" onerror="this.style.display=\'none\'">\n' +
'  <div class="header-divider"></div>\n' +
'  <div>\n' +
'    <div class="header-title">' + (isUpdate ? 'Update your listing' : 'Clinic application portal') + '</div>\n' +
'    <div style="font-size:11.5px;color:rgba(255,255,255,.45);margin-top:1px">Takes about 10 minutes &middot; Reviewed before publishing</div>\n' +
'  </div>\n' +
'</header>\n' +

'<div class="mob-progress" id="mob-progress">\n' +
'  <div class="mob-track"><div class="mob-fill" id="mob-fill"></div></div>\n' +
'  <div class="mob-label"><strong id="mob-step">Basic information</strong><span id="mob-count">1 of 10</span></div>\n' +
'</div>\n' +

'<div class="layout">\n' +
'<aside class="sidebar">\n' +
'  <div class="sidebar-inner">' + sidebarItems + '\n' +
'  <div style="padding:12px 16px;border-top:1px solid var(--border);background:var(--bg)">' +
'    <div style="font-size:11px;color:var(--muted);font-weight:500;letter-spacing:.04em;text-transform:uppercase;margin-bottom:5px">Progress</div>' +
'    <div style="height:4px;background:var(--border);border-radius:99px;overflow:hidden">' +
'      <div id="sidebar-progress-bar" style="height:100%;background:var(--navy);border-radius:99px;width:10%;transition:width .4s"></div>' +
'    </div>' +
'    <div id="sidebar-progress-text" style="font-size:12px;color:var(--text2);margin-top:5px">1 of 10 sections</div>' +
'  </div></div>\n' +
'</aside>\n' +

'<div class="form-area">\n' +

(error ? '<div class="error-box">' + error + '</div>\n' : '') +

'<div class="notice">Regulatory status, inspection rating, and age verification are set by Rehab Online after independent verification and do not appear in this form.</div>\n' +

'<form method="POST" action="/form" enctype="multipart/form-data" id="portal-form">\n' +
'<input type="hidden" name="token" value="' + token + '">\n' +
'<input type="hidden" name="expiry" value="' + expiry + '">\n' +
(clinic ? '<input type="hidden" name="clinic_id" value="' + clinic.id + '">\n' : '') +
'<input type="hidden" name="type" value="' + (isUpdate ? 'update' : 'new') + '">\n' +
'<input type="hidden" name="photo_data" id="photo-data" value="">\n' +
'<input type="hidden" name="logo_data" id="logo-data" value="">\n' +

/* S1 */
'<div class="section" id="s1">' + sectionHead(1, 'Basic information') +
'<div class="field"><label>Clinic name *</label><input type="text" name="title" value="' + val('title') + '" required placeholder="The Haynes Clinic"></div>' +
'<div class="two-col"><div class="field"><label>Website *</label><input type="url" name="website" value="' + val('website') + '" required placeholder="https://"></div>' +
'<div class="field"><label>Main phone number *</label><input type="tel" name="phone" value="' + val('phone') + '" required></div></div>' +
'<div class="field"><label>Enquiries email</label><input type="email" name="email" value="' + val('email') + '" placeholder="admissions@clinic.co.uk"></div>' +
'<div class="field"><label>Address *</label><input type="text" name="address" value="' + val('address') + '" required placeholder="House, Street, Town"></div>' +
'<div class="field" style="max-width:200px"><label>Postcode *</label><input type="text" name="postcode" value="' + val('postcode') + '" required placeholder="SW1A 1AA"></div>' +
'</div>\n' +

/* S2 */
'<div class="section" id="s2">' + sectionHead(2, 'Treatment types offered') + checkboxes('treatment_types', TREATMENT_TYPES) + '</div>\n' +

/* S3 */
'<div class="section" id="s3">' + sectionHead(3, 'Addictions treated') + checkboxes('addictions_treated', ADDICTIONS) + '</div>\n' +

/* S4 */
'<div class="section" id="s4">' + sectionHead(4, 'Mental health conditions treated') + checkboxes('mental_health_conditions', MENTAL_HEALTH) + '</div>\n' +

/* S5 */
'<div class="section" id="s5">' + sectionHead(5, 'Funding and cost') +
checkboxes('funding_types', FUNDING_TYPES) +
'<div class="two-col" style="margin-top:18px">' +
'<div class="field"><label>Weekly cost from (£)</label><input type="number" name="price_per_week_from" value="' + val('price_per_week_from') + '" placeholder="e.g. 3000"><div class="hint">Leave blank if not applicable</div></div>' +
'<div class="field"><label>Weekly cost up to (£)</label><input type="number" name="price_per_week_to" value="' + val('price_per_week_to') + '" placeholder="e.g. 8000"></div></div>' +
'<div class="field"><label>Insurance networks accepted</label><input type="text" name="insurance_networks" value="' + val('insurance_networks') + '" placeholder="e.g. BUPA, AXA Health, Vitality"></div>' +
'</div>\n' +

/* S6 */
'<div class="section" id="s6">' + sectionHead(6, 'Access and eligibility') +
'<div class="field"><label>Gender</label><div class="pill-group">' +
radio('gender_model','mixed','Mixed',true) + radio('gender_model','women_only','Women only') + radio('gender_model','men_only','Men only') +
'</div></div>' +
'<div class="field"><label>Do you treat patients under 18?</label><div class="pill-group">' +
radio('treats_under_18s_claimed','yes','Yes') + radio('treats_under_18s_claimed','no','No, adults only (18+)',true) + radio('treats_under_18s_claimed','contact','Contact us to discuss') +
'</div><div class="hint">This will be independently verified by Rehab Online before publishing.</div></div>' +
'<div class="field"><label>Detox on site?</label><div class="pill-group">' + radio('detox_on_site','True','Yes') + radio('detox_on_site','False','No') + '</div></div>' +
'<div class="field"><label>Dual diagnosis (addiction and mental health simultaneously)?</label><div class="pill-group">' + radio('dual_diagnosis','true','Yes') + radio('dual_diagnosis','false','No') + '</div></div>' +
'<div class="field"><label>Family programme?</label><div class="pill-group">' + radio('has_family_programme','True','Yes') + radio('has_family_programme','False','No') + '</div></div>' +
'<div class="field"><label>Mother and child service?</label><div class="pill-group">' + radio('mother_child_service','true','Yes') + radio('mother_child_service','false','No') + '</div></div>' +
'<div class="two-col">' +
'<div class="field"><label>Number of beds / capacity</label><input type="number" name="capacity" value="' + val('capacity') + '" placeholder="e.g. 18"></div>' +
'<div class="field"><label>Typical waiting time</label><select name="waiting_time">' +
'<option value="">Select</option>' +
'<option value="immediate" ' + sel('waiting_time','immediate') + '>Available immediately</option>' +
'<option value="days" ' + sel('waiting_time','days') + '>Usually within a few days</option>' +
'<option value="week" ' + sel('waiting_time','week') + '>Usually within a week</option>' +
'<option value="weeks" ' + sel('waiting_time','weeks') + '>2 to 4 weeks</option>' +
'<option value="longer" ' + sel('waiting_time','longer') + '>Longer (contact for details)</option>' +
'</select></div></div>' +
'<div class="field"><label>Languages available other than English</label><input type="text" name="languages" value="' + val('languages') + '" placeholder="e.g. Welsh, Spanish, Urdu"></div>' +
'</div>\n' +

/* S7 */
'<div class="section" id="s7">' + sectionHead(7, 'Setting and ethos') +
'<div class="field"><label>Setting</label><div class="pill-group">' +
radio('setting','rural','Rural') + radio('setting','suburban','Suburban') + radio('setting','urban','Urban / city') + radio('setting','coastal','Coastal') +
'</div></div>' +
'<div class="field"><label>12-step programme?</label><div class="pill-group">' +
radio('twelve_step','yes','Yes, 12-step based') + radio('twelve_step','informed','12-step informed') + radio('twelve_step','no','Non-12-step') +
'</div></div>' +
'<div class="field"><label>Faith-based programme?</label><div class="pill-group">' + radio('is_faith_based','True','Yes') + radio('is_faith_based','False','No') + '</div></div>' +
'<div class="field" id="faith-row" style="' + (val('is_faith_based') === 'True' ? '' : 'display:none') + '"><label>Faith tradition</label><input type="text" name="faith_tradition" value="' + val('faith_tradition') + '" placeholder="e.g. Christian"></div>' +
'<div class="field"><label>Named therapies and modalities</label><input type="text" name="named_modalities" value="' + val('named_modalities') + '" placeholder="e.g. CBT, EMDR, Mindfulness, Trauma-informed"><div class="hint">Comma-separated</div></div>' +
'<div class="field"><label>Accreditations and memberships</label>' + checkboxes('accreditations', ACCREDITATIONS) +
'<div style="margin-top:10px"><input type="text" name="accreditations_other" value="' + val('accreditations_other') + '" placeholder="Any others (free text)"></div></div>' +
'</div>\n' +

/* S8 */
'<div class="section" id="s8">' + sectionHead(8, 'Photos and logo') +
'<div class="field"><label>Clinic photos (up to 5)</label>' +
'<div class="upload-zone" id="photo-drop">' +
'<div class="upload-icon">&#128444;</div>' +
'<p><strong>Drop photos here</strong><br>JPG or PNG, max 5MB each</p>' +
'<span class="browse">Browse files</span>' +
'<input type="file" id="photo-input" accept="image/jpeg,image/png,image/webp" multiple style="display:none"></div>' +
'<div class="photo-grid" id="photo-preview"></div>' +
'<div class="hint">Photos are reviewed before publishing. Show your reception, bedrooms, gardens, therapy rooms.</div></div>' +
'<div class="field" style="margin-top:24px"><label>Your clinic logo</label>' +
'<div class="upload-zone" id="logo-drop" style="max-width:380px">' +
'<div class="upload-icon">&#127991;</div>' +
'<p><strong>Drop your logo here</strong><br>PNG or SVG, transparent background ideal</p>' +
'<span class="browse">Browse files</span>' +
'<input type="file" id="logo-input" accept="image/png,image/svg+xml,image/jpeg" style="display:none"></div>' +
'<div id="logo-preview"></div>' +
'<div class="hint">Displayed on your listing page alongside your clinic name.</div></div>' +
'</div>\n' +

/* S9 */
'<div class="section" id="s9">' + sectionHead(9, 'Reviews and social links') +
'<div class="two-col">' +
'<div class="field"><label>Google Reviews URL</label><input type="url" name="google_reviews_url" value="' + val('google_reviews_url') + '" placeholder="https://g.page/r/..."><div class="hint">Link to your Google Business Profile reviews</div></div>' +
'<div class="field"><label>Trustpilot URL</label><input type="url" name="trustpilot_url" value="' + val('trustpilot_url') + '" placeholder="https://www.trustpilot.com/review/..."></div>' +
'</div>' +
'<div class="field"><label>NHS Friends and Family score (if applicable)</label><input type="text" name="nhs_ff_score" value="' + val('nhs_ff_score') + '" placeholder="e.g. 96% recommended (Jan 2025)"></div>' +
'<div class="two-col">' +
'<div class="field"><label>Facebook page</label><input type="url" name="facebook_url" value="' + val('facebook_url') + '" placeholder="https://facebook.com/..."></div>' +
'<div class="field"><label>Instagram profile</label><input type="url" name="instagram_url" value="' + val('instagram_url') + '" placeholder="https://instagram.com/..."></div>' +
'</div>' +
'<div class="field" style="max-width:420px"><label>LinkedIn page</label><input type="url" name="linkedin_url" value="' + val('linkedin_url') + '" placeholder="https://linkedin.com/company/..."></div>' +
'</div>\n' +

/* S10 */
'<div class="section" id="s10">' + sectionHead(10, 'About your clinic') +
'<div class="field"><label>Description</label>' +
'<textarea name="description" id="desc-field" rows="7" placeholder="Describe your clinic, your approach, and what makes it distinctive.\n\nUse a blank line between paragraphs.">' + descVal + '</textarea>' +
'<div class="char-count" id="desc-count"></div>' +
'<div class="hint">Use a blank line between paragraphs. Aim for 300 to 600 characters.</div></div>' +
'</div>\n' +

/* Submit */
'<div class="submit-wrap">' +
'<p>By submitting this form you confirm the information provided is accurate. Rehab Online will review your submission and may contact you to verify details before publishing.</p>' +
'<button type="submit" class="btn-submit" id="submit-btn">' + (isUpdate ? 'Submit update for review' : 'Submit for review') + '</button>' +
'</div>\n' +

'</form>\n</div>\n</div>\n' +

'<script>\n' +
/* Pill toggles */
'document.querySelectorAll(".pill-check").forEach(function(el){el.addEventListener("click",function(){var inp=this.querySelector("input");inp.checked=!inp.checked;this.classList.toggle("active",inp.checked);});});\n' +
'document.querySelectorAll(".pill-radio").forEach(function(el){el.addEventListener("click",function(){var name=this.querySelector("input").name;document.querySelectorAll(".pill-radio input[name=\\""+name+"\\"]").forEach(function(r){r.closest(".pill-radio").classList.remove("active");});this.querySelector("input").checked=true;this.classList.add("active");if(name==="is_faith_based"){document.getElementById("faith-row").style.display=this.querySelector("input").value==="True"?"":"none";}});});\n' +

/* Character counter */
'var df=document.getElementById("desc-field"),dc=document.getElementById("desc-count");\n' +
'function upCount(){if(!df)return;var n=df.value.length;if(!n){dc.textContent="";return;}dc.textContent=n+" characters"+(n>800?" - consider trimming":n>600?" - slightly long":"");dc.className="char-count"+(n>800?" over":n>600?" warn":"");}\n' +
'if(df){df.addEventListener("input",upCount);upCount();}\n' +

/* File upload helper */
'function setupUpload(dropId,inputId,previewId,hiddenId,multi,thumbCls){var drop=document.getElementById(dropId),inp=document.getElementById(inputId),prev=document.getElementById(previewId),hid=document.getElementById(hiddenId);if(!drop)return;drop.addEventListener("click",function(){inp.click();});drop.addEventListener("dragover",function(e){e.preventDefault();drop.classList.add("over");});drop.addEventListener("dragleave",function(){drop.classList.remove("over");});drop.addEventListener("drop",function(e){e.preventDefault();drop.classList.remove("over");go(e.dataTransfer.files);});inp.addEventListener("change",function(){go(this.files);});var store=[];function go(files){var list=Array.from(files).slice(0,multi?5:1);if(!multi)store=[];var p=list.length;list.forEach(function(f){if(f.size>5*1024*1024){alert(f.name+" is over 5MB.");p--;return;}var r=new FileReader();r.onload=function(ev){store.push({name:f.name,data:ev.target.result});var img=document.createElement("img");img.src=ev.target.result;img.className=thumbCls;prev.appendChild(img);p--;if(p===0)hid.value=JSON.stringify(store);};r.readAsDataURL(f);});}}\n' +
'setupUpload("photo-drop","photo-input","photo-preview","photo-data",true,"photo-thumb");\n' +
'setupUpload("logo-drop","logo-input","logo-preview","logo-data",false,"logo-thumb");\n' +

/* Sidebar + mobile progress IntersectionObserver */
'var sids=' + sectionIds + ';\n' +
'var navEls={};sids.forEach(function(id){var el=document.querySelector(".nav-item[data-target=\\""+id+"\\"]");if(el)navEls[id]=el;});\n' +
'var mobStep=document.getElementById("mob-step"),mobCount=document.getElementById("mob-count"),mobFill=document.getElementById("mob-fill");\n' +
'var sidebarBar=document.getElementById("sidebar-progress-bar"),sidebarTxt=document.getElementById("sidebar-progress-text");\n' +
'var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){var id=e.target.id,idx=sids.indexOf(id);Object.values(navEls).forEach(function(n){n.classList.remove("active");});if(navEls[id]){navEls[id].classList.add("active");navEls[id].scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});}var pct=Math.round((idx+1)/sids.length*100);if(mobStep)mobStep.textContent=e.target.querySelector("h2")?e.target.querySelector("h2").textContent:"";if(mobCount)mobCount.textContent=(idx+1)+" of "+sids.length;if(mobFill)mobFill.style.width=pct+"%";if(sidebarBar)sidebarBar.style.width=pct+"%";if(sidebarTxt)sidebarTxt.textContent=(idx+1)+" of "+sids.length+" sections";}});},{threshold:0.25});\n' +
'sids.forEach(function(id){var el=document.getElementById(id);if(el)obs.observe(el);});\n' +

/* Submit */
'document.getElementById("portal-form").addEventListener("submit",function(){var btn=document.getElementById("submit-btn");btn.textContent="Submitting...";btn.disabled=true;});\n' +
'</script>\n</body>\n</html>';
}

export function buildFormSuccessPage(isUpdate) {
  return '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n' +
'<title>Submission received | Rehab Online</title>\n' +
'<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#faf9f7;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}.card{background:#fff;border:1px solid #e4dfd8;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);padding:48px 40px;max-width:480px;text-align:center}.logo{height:36px;margin-bottom:28px}.icon{width:56px;height:56px;background:#f0fdf4;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 20px;color:#166534;border:1px solid #bbf7d0}h1{font-size:22px;font-weight:700;color:#1a1a2e;margin-bottom:12px}p{font-size:15px;color:#606880;line-height:1.7}</style>\n' +
'</head>\n<body>\n' +
'<div class="card">\n' +
'  <img class="logo" src="' + 'https://rehab-online.org.uk/wp-content/uploads/2026/04/rehab-online-logo.svg' + '" alt="Rehab Online" onerror="this.style.display=\'none\'">\n' +
'  <div class="icon">&#10003;</div>\n' +
'  <h1>' + (isUpdate ? 'Update received' : 'Application received') + '</h1>\n' +
'  <p>' + (isUpdate ? 'Your updated details have been sent to the Rehab Online team for review. Changes will go live once approved, usually within 2 working days.' : 'Thank you for applying to be listed on Rehab Online. We will review your application and be in touch if we need any further information.') + '</p>\n' +
'</div>\n</body>\n</html>';
}
