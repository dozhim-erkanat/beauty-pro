"""Импорт 10 парфюмов Marmara Barber в каталог Beauty Pro."""
import json, os, sys, math, urllib.request, urllib.error

URL = "https://mqvjmaoszoktoofxckhb.supabase.co"
ANON = os.environ["ANON"]
RATE = 9.700723  # 1 TRY в тенге, курс на 15.08.2026

RU = {
    "Hangover": ("Marmara Barber Hangover", "Фруктовый восточный аромат",
                 "Персик и красные ягоды в паре с мускусом. Сладкий, но дерзкий — раскрывается и днём, и вечером."),
    "Off The Record": ("Marmara Barber Off The Record", "Янтарно-пряный аромат",
                       "Янтарь и благородные специи. Подчёркивает харизму и выделяет из толпы."),
    "Never Quıt": ("Marmara Barber Never Quit", "Ароматический фужерный",
                   "Насыщенный аромат с выраженным мужским характером. Нескольких нажатий достаточно на весь день."),
    "Black Out": ("Marmara Barber Black Out", "Сладко-пряный вечерний",
                  "Игра сладости и специй. Плотный шлейф, который запоминают."),
    "Obsessed": ("Marmara Barber Obsessed", "Цитрусово-древесный",
                 "Старт — лимон и грейпфрут, в базе ветивер и ирис. Свежий и собранный, хорош для офиса."),
    "Game Changer": ("Marmara Barber Game Changer", "Древесный с удом",
                     "Современное прочтение уда: древесные ноты и благородная роза вместо привычной классики."),
    "Overdose": ("Marmara Barber Overdose", "Цветочно-фруктовый",
                 "Нероли и бергамот, согретые малиной. В сердце роза, жасмин и цветок апельсина."),
    "Offlıne": ("Marmara Barber Offline", "Фужерный свежий",
                "Лаванда и мята — аромат свободных и независимых. Лёгкий, ненавязчивый, на каждый день."),
    "Impossıble": ("Marmara Barber Impossible", "Сладкий ягодный",
                   "Сочная клубника с искрящейся свежестью. Яркий и заметный — наносите умеренно."),
    "I Wanna Thank Me": ("Marmara Barber I Wanna Thank Me", "Цветочно-мускусный",
                         "Свежие цветы, облако мускуса и штрих янтаря. Мягкий, обволакивающий шлейф."),
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

brand = req("POST", "/rest/v1/brands?on_conflict=slug",
            {"slug": "marmara-barber", "name": "Marmara Barber",
             "description": "Турецкий барбершоп-бренд: парфюмерия и средства для ухода "
                            "и укладки. Производство — Турция.", "sort_order": 1},
            token, extra={"Prefer": "resolution=merge-duplicates,return=representation"})[0]
cat = req("POST", "/rest/v1/categories?on_conflict=brand_id,slug",
          {"brand_id": brand["id"], "slug": "parfum", "name": "Парфюмерия",
           "description": "Мужская парфюмерная вода Eau de Parfum, 100 мл.", "sort_order": 1},
          token, extra={"Prefer": "resolution=merge-duplicates,return=representation"})[0]
print(f"бренд: {brand['name']} / категория: {cat['name']}")

for i, it in enumerate(json.load(open("scripts/data/marmara_parfum.json")), 1):
    name, short, desc = RU[it["base"]]
    kzt = int(math.ceil(it["price"] * RATE / 10.0) * 10)  # округление до 10 ₸

    key = f"products/marmara-{it['slug']}.jpg"
    with open(it["local"], "rb") as f:
        req("POST", f"/storage/v1/object/media/{key}", raw=f.read(), token=token,
            ctype="image/jpeg", extra={"x-upsert": "true"})

    req("POST", "/rest/v1/products?on_conflict=slug", {
        "brand_id": brand["id"], "category_id": cat["id"],
        "slug": f"marmara-{it['slug']}", "name": name,
        "short_description": short, "description": desc,
        "sku": it["sku"] or None,
        "images": [f"{URL}/storage/v1/object/public/media/{key}"],
        "specs": [{"name": "Объём", "value": "100 мл"},
                  {"name": "Тип", "value": "Eau de Parfum"},
                  {"name": "Пол", "value": "Мужской"},
                  {"name": "Страна", "value": "Турция"}],
        "price": kzt, "in_stock": True, "is_active": True,
        "is_featured": i <= 3, "sort_order": i,
    }, token, extra={"Prefer": "resolution=merge-duplicates,return=minimal"})
    print(f"  {i:2}. {name:38} {it['price']:.0f} ₺ → {kzt:>6} ₸")

print("\nимпортировано товаров: 10")
