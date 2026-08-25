"""Бренды, категории, цены в тенге и адреса для партии техники."""
import json, math, re

RATES = {"RUB": 5.4832, "UAH": 10.2424}          # курсы на 25.08.2026

TRANSLIT = {"а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"zh","з":"z",
            "и":"i","й":"i","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r",
            "с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sch",
            "ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","і":"i","ї":"i","є":"e","ґ":"g"}

# Украинские карточки переводим на русский вручную — их всего две.
RU_NAME = {
 "Керамічний ніж на машинку стрижки Andis Master Cordless MLC size 000-1":
   "Керамический нож для машинки Andis Master Cordless MLC, размер 000-1",
 "Ніж на машинку для стрижки волосся Andis Cordless US Pro Li LCL size 000-1":
   "Нож для машинки Andis Cordless US Pro Li LCL, размер 000-1",
}

BRANDS = {
 "andis":  ("Andis",    "Профессиональные машинки, триммеры и шейверы для барберов. США.", 4),
 "valera": ("Valera",   "Профессиональные фены для салонов. Швейцария.", 5),
 "dewal":  ("Dewal",    "Инструмент и техника для парикмахеров.", 6),
 "mrd-pro":("MRD Pro",  "Машинки и триммеры для барберов.", 7),
 "incred": ("inCRED",   "Техника для стрижки.", 8),
}

CATS = [   # (ключ, название, порядок) — проверяем сверху вниз по названию товара
 (r"фен",                                   "feny",     "Фены",                  1),
 (r"шейвер|шейвера|для брить|profoil|бреющ", "sheyvery", "Шейверы",               2),
 (r"триммер|trimmer|окантовочн",             "trimmery", "Триммеры",              3),
 (r"нож|сетк|комплект|насадк",               "nozhi",    "Ножи и расходники",     4),
 (r"набор",                                  "nabory",   "Наборы",                5),
 (r".",                                      "mashinki", "Машинки для стрижки",   6),
]


def slugify(s):
    s = "".join(TRANSLIT.get(c, c) for c in s.lower())
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:60]


def brand_of(name, url):
    low = (name or "").lower()
    if "incred" in low:
        return "incred"
    if "mrd" in low or "mrd-pro.ru" in url:
        return "mrd-pro"
    if "dewal" in low or "dewal.ru" in url:
        return "dewal"
    if "valera" in low or "valera" in url or "moysalon" in url:
        return "valera"
    return "andis"


def cat_of(name, bkey=None):
    low = (name or "").lower()
    if bkey == "valera" and not re.search(r"нож|сетк|насадк|комплект", low):
        return "feny", "Фены", 1        # у Valera в каталоге только фены
    for pat, slug, title, order in CATS:
        if re.search(pat, low):
            return slug, title, order
    return "mashinki", "Машинки для стрижки", 6


def money(v, cur):
    if v in (None, ""):
        return None
    try:
        val = float(str(v).replace(" ", "").replace("\xa0", "").replace(",", "."))
    except ValueError:
        return None
    rate = RATES.get((cur or "RUB").upper())
    if not rate or val <= 0:
        return None
    return int(math.ceil(val * rate / 10.0) * 10)


rows = json.load(open("scraped_all.json"))
out, blocked = [], []
seen = set()
for r in rows:
    if r.get("blocked") or not r.get("name"):
        blocked.append(r["url"])
        continue
    name = RU_NAME.get(r["name"].strip(), r["name"].strip())
    name = re.sub(r"\s+", " ", name)
    bkey = brand_of(name, r["url"])
    cslug, cname, corder = cat_of(name, bkey)

    base = slugify(name)
    slug = base if base not in seen else f"{base[:54]}-{len(seen)}"
    seen.add(slug)

    specs = [s for s in (r.get("specs") or []) if s["value"] and len(s["value"]) < 80][:10]
    specs.append({"name": "Бренд", "value": BRANDS[bkey][0]})

    out.append({
        "slug": slug, "name": name,
        "brand_key": bkey, "brand_name": BRANDS[bkey][0],
        "brand_desc": BRANDS[bkey][1], "brand_order": BRANDS[bkey][2],
        "cat_slug": cslug, "cat_name": cname, "cat_order": corder,
        "price": money(r.get("price"), r.get("currency")),
        "src_price": r.get("price"), "src_currency": r.get("currency"),
        "desc": (r.get("desc") or "")[:1500],
        "short": re.sub(r"\s+", " ", (r.get("desc") or ""))[:180] or None,
        "sku": (r.get("sku") or None),
        "images": r.get("images", [])[:6],
        "keys": [f"{bkey}-{slug}-{n}.jpg" for n in range(1, len(r.get("images", [])[:6]) + 1)],
        "source": r["url"],
    })

json.dump(out, open("tech_ready.json", "w"), ensure_ascii=False, indent=1)

from collections import Counter
print(f"готово к импорту: {len(out)} | не удалось забрать: {len(blocked)}")
for b in blocked:
    print("   заблокирован:", b[:95])
print()
for (bn, cn), n in Counter((o["brand_name"], o["cat_name"]) for o in out).most_common():
    print(f"  {bn:10} {cn:22} {n}")
print()
noprice = [o["name"] for o in out if not o["price"]]
print("без цены:", len(noprice))
for n in noprice:
    print("   ", n[:60])
