"""Импорт 10 товаров Cutrin BIO+ в каталог Beauty Pro."""
import json, os, sys, urllib.request, urllib.error

URL = "https://mqvjmaoszoktoofxckhb.supabase.co"
ANON = os.environ["ANON"]
EMAIL, PASSWORD = os.environ["ADMIN_EMAIL"], os.environ["ADMIN_PASSWORD"]


def req(method, path, body=None, token=None, ctype="application/json", raw=None, extra=None):
    r = urllib.request.Request(URL + path, method=method)
    r.add_header("apikey", ANON)
    r.add_header("Authorization", f"Bearer {token or ANON}")
    r.add_header("Content-Type", ctype)
    for k, v in (extra or {}).items():
        r.add_header(k, v)
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(r, data) as resp:
            txt = resp.read().decode()
            return json.loads(txt) if txt.strip().startswith(("{", "[")) else txt
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} на {method} {path}: {e.read().decode()[:300]}")


token = req("POST", "/auth/v1/token?grant_type=password",
            {"email": EMAIL, "password": PASSWORD})["access_token"]
print("вход выполнен")

# --- бренд -----------------------------------------------------------------
brand = req("POST", "/rest/v1/brands?on_conflict=slug",
            {"slug": "cutrin", "name": "Cutrin",
             "description": "Финский бренд профессиональной косметики для волос. "
                            "Разработка и производство — Финляндия, ингредиенты северного происхождения.",
             "sort_order": 0},
            token, extra={"Prefer": "resolution=merge-duplicates,return=representation"})[0]
print("бренд:", brand["name"])

# --- категория -------------------------------------------------------------
cat = req("POST", "/rest/v1/categories?on_conflict=brand_id,slug",
          {"brand_id": brand["id"], "slug": "bio-plus", "name": "BIO+ Уход за кожей головы",
           "description": "Линия для чувствительной кожи головы: перхоть, сухость, "
                          "жирность, выпадение волос.", "sort_order": 1},
          token, extra={"Prefer": "resolution=merge-duplicates,return=representation"})[0]
print("категория:", cat["name"])

items = json.load(open("scripts/data/cutrin_bio.json", encoding="utf-8"))
ok = 0
for it in items:
    # --- картинка в Storage ---
    key = f"products/cutrin-{it['ean']}.jpg"
    with open(it["local"], "rb") as f:
        req("POST", f"/storage/v1/object/{('media/' + key)}", raw=f.read(), token=token,
            ctype="image/jpeg", extra={"x-upsert": "true"})
    public = f"{URL}/storage/v1/object/public/media/{key}"

    row = {
        "brand_id": brand["id"], "category_id": cat["id"],
        "slug": it["slug"], "name": it["name"],
        "short_description": it["short"], "description": it["desc"],
        "sku": it["ean"], "images": [public],
        "specs": [{"name": "Объём", "value": it["volume"]},
                  {"name": "Штрихкод", "value": it["ean"]},
                  {"name": "Страна", "value": "Финляндия"}],
        "price": None, "in_stock": True, "is_active": True,
        "is_featured": it.get("featured", False), "sort_order": it["order"],
    }
    req("POST", "/rest/v1/products?on_conflict=slug", row, token,
        extra={"Prefer": "resolution=merge-duplicates,return=minimal"})
    ok += 1
    print(f"  {ok:2}. {it['name']}")

print(f"\nимпортировано товаров: {ok}")
