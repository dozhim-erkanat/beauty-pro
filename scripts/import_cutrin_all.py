"""Импорт потребительских линий Cutrin (AINOA, BIO+, VIENO, MUOTO, ROUTA, HOHDE)."""
import json, os, sys, urllib.request, urllib.error

URL = "https://mqvjmaoszoktoofxckhb.supabase.co"
ANON = os.environ["ANON"]

CAT_ORDER = {"bio-plus": 1, "ainoa": 2, "vieno": 3, "muoto": 4, "routa": 5, "hohde": 6}
CAT_DESC = {
    "bio-plus": "Уход за чувствительной кожей головы: перхоть, сухость, жирность, выпадение.",
    "ainoa": "Ежедневное мытьё и уход: увлажнение, объём, защита цвета.",
    "vieno": "Без отдушек — для чувствительной кожи головы и склонных к аллергии.",
    "muoto": "Стайлинг: муссы, лаки, спреи, воски и пасты.",
    "routa": "Мужская линия: шампуни и средства для укладки.",
    "hohde": "Поддержание и освежение цвета окрашенных волос.",
}


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

brand = req("GET", "/rest/v1/brands?select=id&slug=eq.cutrin", token=token)[0]

# существующие товары бренда — чтобы обновить их, а не наплодить дубли
existing = req("GET", f"/rest/v1/products?select=slug,sku&brand_id=eq.{brand['id']}", token=token)
by_sku = {p["sku"]: p["slug"] for p in existing if p["sku"]}
print(f"уже в базе: {len(existing)} товаров бренда Cutrin")

items = json.load(open("scripts/data/cutrin_consumer_lines.json"))

# категории под каждую линию
cats = {}
for slug in sorted({i["cat_slug"] for i in items}, key=lambda s: CAT_ORDER[s]):
    name = next(i["cat_name"] for i in items if i["cat_slug"] == slug)
    cats[slug] = req("POST", "/rest/v1/categories?on_conflict=brand_id,slug",
                     {"brand_id": brand["id"], "slug": slug, "name": name,
                      "description": CAT_DESC[slug], "sort_order": CAT_ORDER[slug]},
                     token, extra={"Prefer": "resolution=merge-duplicates,return=representation"})[0]["id"]
    print(f"  категория: {name}")

created = updated = 0
for it in items:
    slug = by_sku.get(it["ean"], it["slug"]) if it["ean"] else it["slug"]
    reused = slug != it["slug"]

    key = f"products/{it['slug']}.jpg"
    with open(it["local"], "rb") as f:
        req("POST", f"/storage/v1/object/media/{key}", raw=f.read(), token=token,
            ctype="image/jpeg", extra={"x-upsert": "true"})

    specs = [{"name": "Линия", "value": it["line"]}]
    if it["volume"]:
        specs.append({"name": "Объём", "value": it["volume"]})
    if it["ean"]:
        specs.append({"name": "Штрихкод", "value": it["ean"]})
    specs.append({"name": "Страна", "value": "Финляндия"})

    req("POST", "/rest/v1/products?on_conflict=slug", {
        "brand_id": brand["id"], "category_id": cats[it["cat_slug"]],
        "slug": slug, "name": it["name"],
        "short_description": it["short"], "description": it["desc"],
        "sku": it["ean"], "images": [f"{URL}/storage/v1/object/public/media/{key}"],
        "specs": specs, "price": None, "in_stock": True, "is_active": True,
        "is_featured": False, "sort_order": it["order"],
    }, token, extra={"Prefer": "resolution=merge-duplicates,return=minimal"})

    if reused:
        updated += 1
    else:
        created += 1

print(f"\nобновлено ранее загруженных: {updated}")
print(f"добавлено новых: {created}")
