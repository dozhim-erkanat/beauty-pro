"""Импорт полного каталога Marmara Barber (197 товаров, 18 категорий)."""
import json, os, re, sys, urllib.request, urllib.error

URL = "https://mqvjmaoszoktoofxckhb.supabase.co"
ANON = os.environ["ANON"]


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
            {"email": os.environ["ADMIN_EMAIL"], "password": os.environ["ADMIN_PASSWORD"]})["access_token"]
brand = req("GET", "/rest/v1/brands?select=id&slug=eq.marmara-barber", token=token)[0]

existing = req("GET", f"/rest/v1/products?select=id,slug,sku&brand_id=eq.{brand['id']}", token=token)
by_sku = {p["sku"]: p for p in existing if p["sku"]}
print(f"уже в базе: {len(existing)} товаров Marmara Barber")

items = json.load(open("scripts/data/marmara_full.json"))

cats = {}
for slug in sorted({i["cat_slug"] for i in items}, key=lambda s: next(i["cat_order"] for i in items if i["cat_slug"] == s)):
    it = next(i for i in items if i["cat_slug"] == slug)
    cats[slug] = req("POST", "/rest/v1/categories?on_conflict=brand_id,slug",
                     {"brand_id": brand["id"], "slug": slug, "name": it["cat_name"],
                      "sort_order": it["cat_order"]}, token,
                     extra={"Prefer": "resolution=merge-duplicates,return=representation"})[0]["id"]
print(f"категорий: {len(cats)}")

created = updated = 0
for it in items:
    key = f"products/{it['slug']}.jpg"
    with open(it["local"], "rb") as f:
        req("POST", f"/storage/v1/object/media/{key}", raw=f.read(), token=token,
            ctype="image/jpeg", extra={"x-upsert": "true"})
    img = f"{URL}/storage/v1/object/public/media/{key}"

    vol = re.search(r"(\d+(?:[.,]\d+)?\s*(?:мл|л|г))\s*$", it["name"])
    specs = [{"name": "Категория", "value": it["cat_name"]}]
    if vol:
        specs.append({"name": "Объём", "value": vol.group(1)})
    if it["sku"]:
        specs.append({"name": "Артикул", "value": it["sku"]})
    specs.append({"name": "Страна", "value": "Турция"})

    old = by_sku.get(it["sku"]) if it["sku"] else None
    if old:
        # у первых 10 парфюмов названия и описания написаны вручную — не затираем
        req("PATCH", f"/rest/v1/products?id=eq.{old['id']}",
            {"category_id": cats[it["cat_slug"]], "price": it["price"],
             "images": [img], "specs": specs, "is_active": True},
            token, extra={"Prefer": "return=minimal"})
        updated += 1
    else:
        req("POST", "/rest/v1/products?on_conflict=slug", {
            "brand_id": brand["id"], "category_id": cats[it["cat_slug"]],
            "slug": it["slug"], "name": it["name"],
            "short_description": it["cat_name"] + (f", {vol.group(1)}" if vol else ""),
            "sku": it["sku"], "images": [img], "specs": specs,
            "price": it["price"], "in_stock": True, "is_active": True,
            "sort_order": it["cat_order"] * 1000,
        }, token, extra={"Prefer": "resolution=merge-duplicates,return=minimal"})
        created += 1

print(f"\nобновлено ранее загруженных: {updated}")
print(f"добавлено новых: {created}")
