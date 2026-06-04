// Clinic intake form — new submission or update of existing clinic
// Standalone JS module so template-literal escaping is not an issue.

export function buildFormPage({ clinic = null, token, expiry, error = null }) {
  const isUpdate = !!clinic;
  const title = isUpdate ? `Update your listing: ${clinic.title}` : 'Add your clinic to Rehab Online';
  const intro = isUpdate
    ? 'Review and update your clinic details below. Once submitted your changes will be reviewed before going live.'
    : 'Complete the form below to apply for a listing on Rehab Online. We review every application before publishing.';

  function val(field, fallback = '') {
    return clinic ? (clinic[field] || fallback) : fallback;
  }
  function checked(field, value) {
    const stored = val(field, '');
    if (Array.isArray(stored)) return stored.includes(value) ? 'checked' : '';
    const list = stored.split(',').map(s => s.trim().toLowerCase());
    return list.includes(value.toLowerCase()) ? 'checked' : '';
  }
  function sel(field, value) {
    return val(field) === value ? 'selected' : '';
  }
  function radio(name, value, label, extraChecked = false) {
    const isChecked = val(name) === value || extraChecked;
    return `<label class="radio-label"><input type="radio" name="${name}" value="${value}"${isChecked ? ' checked' : ''}> ${label}</label>`;
  }

  const TREATMENT_TYPES = [
    ['residential', 'Residential rehabilitation'],
    ['detox', 'Standalone detox'],
    ['outpatient', 'Outpatient / day programme'],
    ['online', 'Online / remote programme'],
  ];
  const ADDICTIONS = [
    ['alcohol', 'Alcohol'], ['cocaine', 'Cocaine'], ['heroin_opioids', 'Heroin / opioids'],
    ['cannabis', 'Cannabis'], ['prescription', 'Prescription drugs'],
    ['gambling', 'Gambling'], ['stimulants', 'Stimulants (MDMA, meth, ketamine)'],
    ['eating_disorders', 'Eating disorders'], ['sex_addiction', 'Sex / porn addiction'],
    ['other', 'Other (describe in notes)'],
  ];
  const MENTAL_HEALTH = [
    ['dual_diagnosis', 'Dual diagnosis (addiction + mental health)'],
    ['ptsd_trauma', 'PTSD / trauma'], ['depression', 'Depression'],
    ['anxiety', 'Anxiety disorders'], ['personality_disorder', 'Personality disorder'],
    ['psychosis', 'Psychosis'], ['other', 'Other'],
  ];
  const FUNDING_TYPES = [
    ['private', 'Private (self-pay)'], ['insurance', 'Private medical insurance'],
    ['nhs_free', 'NHS / publicly funded'], ['charitable', 'Charitable / means-tested bursary'],
  ];

  function checkboxGroup(field, options) {
    return options.map(([value, label]) =>
      `<label class="check-label"><input type="checkbox" name="${field}" value="${value}" ${checked(field, value)}> ${label}</label>`
    ).join('\n');
  }

  const descriptionVal = val('description').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;color:#1e293b;line-height:1.5}
.header{background:#141a5b;color:#fff;padding:20px 24px}
.header h1{font-size:20px;font-weight:700;margin-bottom:4px}
.header p{font-size:14px;opacity:.8}
.container{max-width:760px;margin:32px auto;padding:0 20px 60px}
.section{background:#fff;border-radius:12px;padding:24px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,.07)}
h2{font-size:15px;font-weight:700;color:#141a5b;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #f1f5f9}
.field{margin-bottom:16px}
label{display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:5px}
input[type=text],input[type=email],input[type=tel],input[type=url],input[type=number],select,textarea{
  width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;
  font-family:inherit;outline:none;background:#fff}
input:focus,select:focus,textarea:focus{border-color:#4f5fe8}
textarea{resize:vertical;min-height:120px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.check-group{display:flex;flex-direction:column;gap:8px;margin-top:4px}
.check-label{display:flex;align-items:flex-start;gap:8px;font-size:14px;cursor:pointer;line-height:1.4}
.check-label input{margin-top:2px;flex-shrink:0;accent-color:#4f5fe8}
.radio-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:4px}
.radio-label{display:flex;align-items:center;gap:6px;font-size:14px;cursor:pointer}
.radio-label input{accent-color:#4f5fe8}
.hint{font-size:12px;color:#94a3b8;margin-top:4px}
.trust-notice{background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:12px 16px;
  font-size:13px;color:#92400e;margin-bottom:20px}
.submit-row{display:flex;justify-content:flex-end;margin-top:8px}
.btn{background:#141a5b;color:#fff;border:none;padding:12px 32px;border-radius:8px;
  font-size:15px;font-weight:600;cursor:pointer;transition:background .2s}
.btn:hover{background:#1e2a8a}
.error-box{background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:12px 16px;
  color:#991b1b;font-size:13px;margin-bottom:20px}
.char-count{font-size:12px;color:#94a3b8;text-align:right;margin-top:4px}
.char-count.near{color:#f59e0b}
.char-count.full{color:#ef4444}
.photo-list{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}
.photo-preview{width:120px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0}
@media(max-width:600px){.two-col{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="header">
  <h1>${title}</h1>
  <p>${intro}</p>
</div>
<div class="container">
${error ? `<div class="error-box">${error}</div>` : ''}
<div class="trust-notice">
  Some fields (regulatory status, inspection rating, age verification) are set by Rehab Online after verification and are not part of this form.
</div>

<form method="POST" action="/form" enctype="multipart/form-data">
<input type="hidden" name="token" value="${token}">
<input type="hidden" name="expiry" value="${expiry}">
${clinic ? `<input type="hidden" name="clinic_id" value="${clinic.id}">` : ''}
<input type="hidden" name="type" value="${isUpdate ? 'update' : 'new'}">
<input type="hidden" name="photo_data" id="photo-data-hidden" value="">

<!-- 1. Basic information -->
<div class="section">
<h2>1. Basic information</h2>
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
  <input type="text" name="postcode" value="${val('postcode')}" required placeholder="SW1A 1AA"></div>
</div>

<!-- 2. Treatment types -->
<div class="section">
<h2>2. Treatment types offered</h2>
<div class="check-group">
${checkboxGroup('treatment_types', TREATMENT_TYPES)}
</div>
</div>

<!-- 3. Addictions treated -->
<div class="section">
<h2>3. Addictions treated</h2>
<div class="check-group">
${checkboxGroup('addictions_treated', ADDICTIONS)}
</div>
</div>

<!-- 4. Mental health -->
<div class="section">
<h2>4. Mental health conditions treated</h2>
<div class="check-group">
${checkboxGroup('mental_health_conditions', MENTAL_HEALTH)}
</div>
</div>

<!-- 5. Funding & cost -->
<div class="section">
<h2>5. Funding and cost</h2>
<div class="check-group">
${checkboxGroup('funding_types', FUNDING_TYPES)}
</div>
<div class="two-col" style="margin-top:16px">
  <div class="field"><label>Weekly cost from (£)</label>
    <input type="number" name="price_per_week_from" value="${val('price_per_week_from')}" placeholder="e.g. 3000">
    <div class="hint">Leave blank if not applicable</div></div>
  <div class="field"><label>Weekly cost up to (£)</label>
    <input type="number" name="price_per_week_to" value="${val('price_per_week_to')}" placeholder="e.g. 8000"></div>
</div>
<div class="field"><label>Insurance networks accepted</label>
  <input type="text" name="insurance_networks" value="${val('insurance_networks')}" placeholder="e.g. BUPA, AXA Health, Vitality"></div>
</div>

<!-- 6. Access & eligibility -->
<div class="section">
<h2>6. Access and eligibility</h2>
<div class="field"><label>Gender</label>
<div class="radio-row">
  ${radio('gender_model','mixed','Mixed',!clinic)}
  ${radio('gender_model','women_only','Women only')}
  ${radio('gender_model','men_only','Men only')}
</div></div>

<div class="field"><label>Do you treat people under 18?</label>
<div class="radio-row">
  ${radio('treats_under_18s_claimed','yes','Yes, we accept patients under 18')}
  ${radio('treats_under_18s_claimed','no','No, adults only (18+)',!clinic)}
  ${radio('treats_under_18s_claimed','contact','Please contact us to discuss')}
</div>
<div class="hint">This will be independently verified by Rehab Online before publishing.</div></div>

<div class="field"><label>Detox on site?</label>
<div class="radio-row">
  ${radio('detox_on_site','True',val('detox_on_site') === 'True' ? 'Yes, on site' : 'Yes, on site')}
  ${radio('detox_on_site','False','No')}
</div></div>

<div class="field"><label>Dual diagnosis (addiction and mental health treated together)?</label>
<div class="radio-row">
  ${radio('dual_diagnosis','true','Yes')}
  ${radio('dual_diagnosis','false','No')}
</div></div>

<div class="field"><label>Family programme?</label>
<div class="radio-row">
  ${radio('has_family_programme','True','Yes')}
  ${radio('has_family_programme','False','No')}
</div></div>

<div class="field"><label>Mother and child service?</label>
<div class="radio-row">
  ${radio('mother_child_service','true','Yes')}
  ${radio('mother_child_service','false','No')}
</div></div>

<div class="field"><label>Number of beds / capacity</label>
  <input type="number" name="capacity" value="${val('capacity')}" placeholder="e.g. 18"></div>
</div>

<!-- 7. Setting & ethos -->
<div class="section">
<h2>7. Setting and ethos</h2>
<div class="field"><label>Setting</label>
<div class="radio-row">
  ${radio('setting','rural','Rural')}
  ${radio('setting','suburban','Suburban')}
  ${radio('setting','urban','Urban / city')}
  ${radio('setting','coastal','Coastal')}
</div></div>

<div class="field"><label>12-step programme?</label>
<div class="radio-row">
  ${radio('twelve_step','yes','Yes, 12-step based')}
  ${radio('twelve_step','informed','12-step informed (uses principles but not strictly AA/NA)')}
  ${radio('twelve_step','no','No, non-12-step')}
</div></div>

<div class="field"><label>Faith-based programme?</label>
<div class="radio-row">
  ${radio('is_faith_based','True','Yes')}
  ${radio('is_faith_based','False','No')}
</div></div>
<div class="field" id="faith-tradition-row" style="${val('is_faith_based') === 'True' ? '' : 'display:none'}">
  <label>Faith tradition</label>
  <input type="text" name="faith_tradition" value="${val('faith_tradition')}" placeholder="e.g. Christian"></div>

<div class="field"><label>Named therapies and modalities</label>
  <input type="text" name="named_modalities" value="${val('named_modalities')}" placeholder="e.g. CBT, EMDR, Mindfulness, Trauma-informed">
  <div class="hint">Comma-separated</div></div>
</div>

<!-- 8. Photos -->
<div class="section">
<h2>8. Photos</h2>
<p style="font-size:14px;color:#475569;margin-bottom:16px">Upload up to 5 photos of your clinic — reception, bedrooms, gardens, therapy rooms. JPG or PNG, max 5MB each.</p>
<div class="field">
  <input type="file" id="photo-input" accept="image/jpeg,image/png,image/webp" multiple style="font-size:14px">
  <div class="hint">Photos go to our team for review before publishing. They will not appear immediately.</div>
</div>
<div class="photo-list" id="photo-preview-list"></div>
</div>

<!-- 9. About -->
<div class="section">
<h2>9. About your clinic</h2>
<div class="field">
  <label>Description (shown to people searching for treatment)</label>
  <textarea name="description" id="description-field" rows="7" placeholder="Describe your clinic, your approach, and what makes it distinctive.

Use a blank line between paragraphs.">${descriptionVal}</textarea>
  <div class="char-count" id="desc-count"></div>
  <div class="hint">Use a blank line between paragraphs. Aim for 300-600 characters.</div>
</div>
</div>

<!-- Submit -->
<div class="section">
  <p style="font-size:13px;color:#64748b;margin-bottom:16px">By submitting this form you confirm that the information provided is accurate. Rehab Online will review your submission and may contact you to verify details before publishing.</p>
  <div class="submit-row"><button type="submit" class="btn" id="submit-btn">${isUpdate ? 'Submit update for review' : 'Submit for review'}</button></div>
</div>

</form>
</div>

<script>
// Faith tradition toggle
document.querySelectorAll('input[name="is_faith_based"]').forEach(function(r) {
  r.addEventListener('change', function() {
    document.getElementById('faith-tradition-row').style.display = this.value === 'True' ? '' : 'none';
  });
});

// Description character counter
var descField = document.getElementById('description-field');
var descCount = document.getElementById('desc-count');
function updateCount() {
  var n = descField.value.length;
  if (n === 0) { descCount.textContent = ''; return; }
  descCount.textContent = n + ' characters' + (n > 800 ? ' (consider trimming for best results)' : n > 600 ? ' (slightly long, trimming helps)' : '');
  descCount.className = 'char-count' + (n > 800 ? ' full' : n > 600 ? ' near' : '');
}
descField.addEventListener('input', updateCount);
updateCount();

// Photo upload — convert to base64, store in hidden field
var photoData = [];
document.getElementById('photo-input').addEventListener('change', function(e) {
  var files = Array.from(e.target.files).slice(0, 5);
  photoData = [];
  document.getElementById('photo-preview-list').innerHTML = '';
  var pending = files.length;
  if (!pending) return;
  files.forEach(function(file) {
    if (file.size > 5 * 1024 * 1024) { alert(file.name + ' is over 5MB and will be skipped.'); pending--; return; }
    var reader = new FileReader();
    reader.onload = function(ev) {
      photoData.push({ name: file.name, data: ev.target.result });
      var img = document.createElement('img');
      img.src = ev.target.result;
      img.className = 'photo-preview';
      img.title = file.name;
      document.getElementById('photo-preview-list').appendChild(img);
      pending--;
      if (pending === 0) {
        document.getElementById('photo-data-hidden').value = JSON.stringify(photoData.map(function(p) { return { name: p.name, data: p.data.slice(0, 200) + '...' }; }));
      }
    };
    reader.readAsDataURL(file);
  });
});

// On submit: inject full photo data
document.querySelector('form').addEventListener('submit', function(e) {
  if (photoData.length > 0) {
    document.getElementById('photo-data-hidden').value = JSON.stringify(photoData);
  }
  var btn = document.getElementById('submit-btn');
  btn.textContent = 'Submitting...';
  btn.disabled = true;
});
</script>
</body>
</html>`;
}

export function buildFormSuccessPage(isUpdate) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Submission received</title>
<style>
body{font-family:system-ui,sans-serif;background:#f8fafc;display:flex;align-items:center;
  justify-content:center;min-height:100vh;margin:0;padding:20px}
.card{background:#fff;border-radius:16px;padding:40px;max-width:480px;text-align:center;
  box-shadow:0 2px 16px rgba(0,0,0,.08)}
.icon{font-size:48px;margin-bottom:16px}
h1{font-size:22px;font-weight:700;color:#141a5b;margin-bottom:12px}
p{font-size:15px;color:#475569;line-height:1.6}
</style>
</head>
<body>
<div class="card">
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
