"""
Uploads clinic data from clinics_enriched.csv into Cloudflare KV.
Run: python3 upload_clinics_to_kv.py
"""
import csv, json, subprocess, sys

CSV_PATH = "../rehab-online-scraper/clinics_enriched.csv"
KV_NAMESPACE_ID = "3227bbe5624d4c81a793d4fb1f8e1ac2"

def clean(val):
    if not val or str(val).strip() in ("None", "[]", "{}", "nan", ""):
        return ""
    return str(val).strip()

rows = []
with open(CSV_PATH, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

clinics = []
for i, r in enumerate(rows):
    clinic = {
        "id": i + 1,
        "title": clean(r.get("title", "")),
        "website": clean(r.get("website", "")),
        "address": clean(r.get("address", "")),
        "postcode": clean(r.get("postcode", "")),
        "lat": clean(r.get("lat", "")),
        "lng": clean(r.get("lng", "")),
        "locations": clean(r.get("locations", "")),
        "cost": clean(r.get("cost", "")),
        "payment": clean(r.get("payment", "")),
        "insurance_networks": clean(r.get("insurance_networks", "")),
        "detox_on_site": clean(r.get("detox_on_site", "")),
        "gender_model": clean(r.get("gender_model", "")),
        "is_faith_based": clean(r.get("is_faith_based", "")),
        "faith_tradition": clean(r.get("faith_tradition", "")),
        "min_age": clean(r.get("min_age", "")),
        "regulatory_rating": clean(r.get("regulatory_rating", "")),
        "regulatory_body": clean(r.get("regulatory_body", "")),
        "named_modalities": clean(r.get("named_modalities", "")),
        "addictions_treated": clean(r.get("addictions_treated", "")),
        "rehab_type": clean(r.get("rehab_type", "")),
        "accessibility": clean(r.get("accessibility", "")),
        "setting": clean(r.get("setting", "")),
        "aftercare": clean(r.get("aftercare", "")),
        "has_family_programme": clean(r.get("has_family_programme", "")),
        "pricing_clean": clean(r.get("pricing_clean", "")),
        "capacity": clean(r.get("capacity", "")),
        "description": clean(r.get("description", "")),
        "ai_summary": clean(r.get("ai_summary", "")),
        "usp_bullets": clean(r.get("usp_bullets", "")),
        "phone": clean(r.get("phone", "")),
        "email": clean(r.get("email", "")),
    }
    clinics.append(clinic)

payload = json.dumps(clinics, ensure_ascii=False)

# Write to temp file and upload via wrangler
import tempfile, os
with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False, encoding="utf-8") as f:
    f.write(payload)
    tmp = f.name

print(f"Uploading {len(clinics)} clinics to KV...")
result = subprocess.run(
    ["npx", "wrangler", "kv", "key", "put", "--namespace-id", KV_NAMESPACE_ID,
     "--config", "wrangler.toml", "--remote", "clinics:all", "--path", tmp],
    capture_output=True, text=True
)
os.unlink(tmp)

if result.returncode == 0:
    print(f"Done. {len(clinics)} clinics uploaded to KV key 'clinics:all'")
else:
    print("ERROR:", result.stderr)
    sys.exit(1)
