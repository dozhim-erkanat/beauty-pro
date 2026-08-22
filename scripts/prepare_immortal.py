"""Подготовка каталога Immortal (immortalrussia.ru, Tilda) к импорту."""
import html, json, math, re

RATE = 5.4816  # 1 RUB в тенге, курс на 22.08.2026

# Приоритет важен: товар лежит сразу в нескольких разделах,
# берём первый подходящий сверху.
CATS = [
    ("Средства для бороды и усов",        "uhod-boroda",    "Уход за бородой и усами",   1),
    ("Укладка волос",                     "styling-volos",  "Укладка волос",             2),
    ("Шампуни для волос",                 "shampuni",       "Шампуни",                   3),
    ("Уход за волосами",                  "uhod-volosy",    "Уход за волосами",          4),
    ("Тоники для волос и кожи лица",      "toniki",         "Тоники",                    5),
    ("Для бритья",                        "britie",         "Для бритья",                6),
    ("После бритья",                      "posle-britya",   "После бритья",              7),
    ("Уход за кожей лица",                "uhod-lico",      "Уход за кожей лица",        8),
    ("Одеколоны",                         "odekolony",      "Одеколоны",                 9),
    ("Премиальная косметика из Швейцарии","shveycariya",    "Премиальная косметика (Швейцария)", 10),
    ("В работу барберам и парикмахерам",  "professionalam", "Профессионалам",           11),
    ("Подарочные наборы",                 "nabory",         "Наборы",                   12),
    ("Акции",                             "nabory",         "Наборы",                   12),
]


def jl(v):
    if isinstance(v, str):
        try:
            return json.loads(v)
        except Exception:
            return []
    return v or []


def clean_text(raw: str) -> str:
    """HTML описания Tilda → простой текст с абзацами."""
    s = re.sub(r"<br\s*/?>", "\n", raw or "", flags=re.I)
    s = re.sub(r"</p\s*>", "\n\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s).replace("\xa0", " ")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return "\n".join(line.strip() for line in s.split("\n")).strip()


def nice_title(t: str) -> str:
    """«МАСЛО ДЛЯ БОРОДЫ» → «Масло для бороды», латиница остаётся как есть."""
    t = re.sub(r"\s+", " ", html.unescape(t or "")).strip(" -—")
    words = t.split(" ")
    cyr_caps = [w for w in words if re.search(r"[А-ЯЁ]{3,}", w) and w == w.upper()]
    if cyr_caps:  # в заголовке есть слова капсом
        out = []
        for w in words:
            if re.fullmatch(r"[A-Z0-9\-&.]+", w):   # IMMORTAL, NYC, 3D — не трогаем
                out.append(w)
            elif re.search(r"[А-ЯЁа-яё]", w):
                out.append(w.lower())
            else:
                out.append(w)
        t = " ".join(out)
        t = t[0].upper() + t[1:] if t else t
    return t


def money(v):
    if v in (None, "", 0):
        return None
    s = str(v).replace(" ", "").replace("\xa0", "").replace(",", ".")
    try:
        rub = float(s)
    except ValueError:
        return None
    return int(math.ceil(rub * RATE / 10.0) * 10) if rub > 0 else None


src = json.load(open("t.json"))
parts = {p["uid"]: p["title"] for p in src.get("parts", [])}
order = {name: i for i, (name, *_rest) in enumerate(CATS)}

out, skipped = [], []
for pr in src["products"]:
    gallery = [g["img"] for g in jl(pr.get("gallery")) if g.get("img")]
    if not gallery:
        skipped.append((pr["title"], "нет фото"))
        continue

    titles = [parts.get(int(u)) for u in jl(pr.get("partuids"))]
    titles = [t for t in titles if t in order]
    if not titles:
        skipped.append((pr["title"], "нет подходящей категории"))
        continue
    best = min(titles, key=lambda t: order[t])
    _, cat_slug, cat_name, cat_order = CATS[order[best]]

    url = pr.get("url") or ""
    tail = url.rstrip("/").split("/")[-1]
    slug = "immortal-" + re.sub(r"^\d+-", "", tail)[:60]

    specs = [{"name": c.get("title", ""), "value": c.get("value", "")}
             for c in jl(pr.get("characteristics")) if c.get("value")]
    specs.append({"name": "Бренд", "value": "Immortal"})

    text = clean_text(pr.get("text") or pr.get("descr") or "")
    out.append({
        "uid": pr["uid"], "slug": slug, "name": nice_title(pr["title"]),
        "short": (pr.get("descr") or text.split("\n")[0] or "")[:200],
        "desc": text,
        "cat_slug": cat_slug, "cat_name": cat_name, "cat_order": cat_order,
        "price": money(pr.get("price")), "old_price": None,
        "sku": (pr.get("sku") or "").strip() or None,
        "images": gallery,
        "specs": specs,
    })

# Старая цена показывается только как настоящая скидка.
old_by_uid = {p["uid"]: money(p.get("priceold")) for p in src["products"]}
for o in out:
    old = old_by_uid.get(o["uid"])
    if old and o["price"] and old > o["price"]:
        o["old_price"] = old

json.dump(out, open("ir_ready.json", "w"), ensure_ascii=False, indent=1)
print(f"готово: {len(out)} | пропущено: {len(skipped)}")
for t, why in skipped:
    print("  пропуск:", t[:50], "—", why)

from collections import Counter
print()
for cat, n in Counter(o["cat_name"] for o in out).most_common():
    ex = next(o for o in out if o["cat_name"] == cat)
    print(f"  {cat:34} {n:2}   напр.: {ex['name'][:38]}")
bad = [o for o in out if o["old_price"] and o["price"] and o["old_price"] <= o["price"]]
print("\nстарая цена не выше новой:", len(bad))
