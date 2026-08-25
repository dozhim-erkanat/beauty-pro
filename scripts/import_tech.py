"""Импорт партии техники: Andis, Valera, Dewal, MRD Pro, inCRED."""
import json, os, ssl, sys, time, urllib.error, urllib.request

URL = "https://mqvjmaoszoktoofxckhb.supabase.co"
ANON = os.environ["ANON"]


def req(method, path, body=None, token=None, ctype="application/json", raw=None, extra=None, tries=4):
    for attempt in range(1, tries + 1):
        r = urllib.request.Request(URL + path, method=method)
        r.add_header("apikey", ANON)
        r.add_header("Authorization", f"Bearer {token or ANON}")
        r.add_header("Content-Type", ctype)
        for k, v in (extra or {}).items():
            r.add_header(k, v)
        data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
        try:
            with urllib.request.urlopen(r, data, timeout=180) as resp:
                txt = resp.read().decode()
                return json.loads(txt) if txt.strip().startswith(("{", "[")) else txt
        except urllib.error.HTTPError as e:
            sys.exit(f"HTTP {e.code} на {method} {path}: {e.read().decode()[:300]}")
        except (urllib.error.URLError, ssl.SSLError, TimeoutError, ConnectionError) as e:
            if attempt == tries:
                sys.exit(f"сеть недоступна на {method} {path}: {e}")
            time.sleep(3 * attempt)


token = req("POST", "/auth/v1/token?grant_type=password",
            {"email": os.environ["ADMIN_EMAIL"], "password": os.environ["ADMIN_PASSWORD"]})["access_token"]

items = json.load(open("scripts/data/tech.json"))

# --- бренды -----------------------------------------------------------------
brands = {}
for key in dict.fromkeys(i["brand_key"] for i in items):
    it = next(i for i in items if i["brand_key"] == key)
    row = req("POST", "/rest/v1/brands?on_conflict=slug",
              {"slug": key, "name": it["brand_name"], "description": it["brand_desc"],
               "sort_order": it["brand_order"]},
              token, extra={"Prefer": "resolution=merge-duplicates,return=representation"})[0]
    brands[key] = row["id"]
    print(f"бренд: {it['brand_name']}")

# --- категории --------------------------------------------------------------
cats = {}
for key, cslug in dict.fromkeys((i["brand_key"], i["cat_slug"]) for i in items):
    it = next(i for i in items if i["brand_key"] == key and i["cat_slug"] == cslug)
    row = req("POST", "/rest/v1/categories?on_conflict=brand_id,slug",
              {"brand_id": brands[key], "slug": cslug, "name": it["cat_name"],
               "sort_order": it["cat_order"]},
              token, extra={"Prefer": "resolution=merge-duplicates,return=representation"})[0]
    cats[(key, cslug)] = row["id"]

print(f"категорий: {len(cats)}\n")

# --- товары -----------------------------------------------------------------
done = {p["slug"] for p in req("GET", "/rest/v1/products?select=slug", token=token)}
created = 0
for n, it in enumerate(items, 1):
    urls = []
    for path, key in zip(it["local"], it["keys"]):
        with open(path, "rb") as f:
            req("POST", f"/storage/v1/object/media/products/{key}", raw=f.read(), token=token,
                ctype="image/jpeg", extra={"x-upsert": "true"})
        urls.append(f"{URL}/storage/v1/object/public/media/products/{key}")

    req("POST", "/rest/v1/products?on_conflict=slug", {
        "brand_id": brands[it["brand_key"]],
        "category_id": cats[(it["brand_key"], it["cat_slug"])],
        "slug": it["slug"], "name": it["name"],
        "short_description": it["short"], "description": it["desc"] or None,
        "sku": it["sku"], "images": urls, "specs": it["specs"],
        "price": it["price"], "in_stock": True, "is_active": True,
        "sort_order": it["cat_order"] * 100,
    }, token, extra={"Prefer": "resolution=merge-duplicates,return=minimal"})
    created += 1
    if n % 10 == 0:
        print(f"  {n}/{len(items)}")

print(f"\nимпортировано: {created}")
