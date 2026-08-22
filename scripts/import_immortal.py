"""Импорт каталога Immortal (89 товаров, 12 категорий) в Beauty Pro."""
import json, os, sys, time, urllib.request, urllib.error

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
    # Обрыв соединения при заливке крупных картинок — обычное дело, повторяем.
    for attempt in range(4):
        try:
            with urllib.request.urlopen(r, data, timeout=120) as resp:
                txt = resp.read().decode()
                return json.loads(txt) if txt.strip().startswith(("{", "[")) else txt
        except urllib.error.HTTPError as e:
            if e.code >= 500 and attempt < 3:
                time.sleep(3 * (attempt + 1)); continue
            sys.exit(f"HTTP {e.code} на {method} {path}: {e.read().decode()[:300]}")
        except (urllib.error.URLError, OSError) as e:
            if attempt == 3:
                sys.exit(f"сеть не отвечает на {method} {path}: {e}")
            time.sleep(3 * (attempt + 1))
            r = urllib.request.Request(URL + path, method=method)
            r.add_header("apikey", ANON)
            r.add_header("Authorization", f"Bearer {token or ANON}")
            r.add_header("Content-Type", ctype)
            for k, v in (extra or {}).items():
                r.add_header(k, v)


token = req("POST", "/auth/v1/token?grant_type=password",
            {"email": os.environ["ADMIN_EMAIL"], "password": os.environ["ADMIN_PASSWORD"]})["access_token"]

brand = req("POST", "/rest/v1/brands?on_conflict=slug",
            {"slug": "immortal", "name": "Immortal",
             "description": "Мужская косметика: уход за бородой, укладка волос, бритьё "
                            "и одеколоны. Профессиональная линейка для барбершопов.",
             "sort_order": 2},
            token, extra={"Prefer": "resolution=merge-duplicates,return=representation"})[0]
print("бренд:", brand["name"])

items = json.load(open("scripts/data/immortal.json"))

cats = {}
for slug in sorted({i["cat_slug"] for i in items},
                   key=lambda s: next(i["cat_order"] for i in items if i["cat_slug"] == s)):
    it = next(i for i in items if i["cat_slug"] == slug)
    cats[slug] = req("POST", "/rest/v1/categories?on_conflict=brand_id,slug",
                     {"brand_id": brand["id"], "slug": slug, "name": it["cat_name"],
                      "sort_order": it["cat_order"]}, token,
                     extra={"Prefer": "resolution=merge-duplicates,return=representation"})[0]["id"]
print("категорий:", len(cats))

done = {p["slug"] for p in req(
    "GET", f"/rest/v1/products?select=slug,images&brand_id=eq.{brand['id']}", token=token)
    if p.get("images")}
print("уже залито ранее:", len(done))

created = skipped = 0
for n, it in enumerate(items, 1):
    if it["slug"] in done:
        skipped += 1
        continue
    urls = []
    for path, name in zip(it["local"], it["keys"]):
        key = f"products/{name}"
        ctype = "image/png" if path.lower().endswith(".png") else "image/jpeg"
        with open(path, "rb") as f:
            req("POST", f"/storage/v1/object/media/{key}", raw=f.read(), token=token,
                ctype=ctype, extra={"x-upsert": "true"})
        urls.append(f"{URL}/storage/v1/object/public/media/{key}")

    req("POST", "/rest/v1/products?on_conflict=slug", {
        "brand_id": brand["id"], "category_id": cats[it["cat_slug"]],
        "slug": it["slug"], "name": it["name"],
        "short_description": it["short"] or None,
        "description": it["desc"] or None,
        "sku": it["sku"],            # пусто → артикул присвоит триггер базы
        "images": urls, "specs": it["specs"],
        "price": it["price"], "old_price": it["old_price"],
        "in_stock": True, "is_active": True,
        "sort_order": it["cat_order"] * 1000 + n,
    }, token, extra={"Prefer": "resolution=merge-duplicates,return=minimal"})
    created += 1
    if n % 20 == 0:
        print(f"  {n}/{len(items)}")

print(f"\nдозалито: {created} | пропущено как уже готовое: {skipped}")
