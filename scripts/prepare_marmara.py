"""Категории и русские названия для каталога Marmara Barber."""
import json, re, math

RATE = 9.700723  # 1 TRY в тенге, курс на 15.08.2026

# product_type с сайта → (slug, русское имя категории, порядок)
CATS = {
    "Dökme Kolonya":        ("kolonya-nalivnaya", "Одеколон наливной", 1),
    "Sprey Kolonya":        ("kolonya-sprey", "Одеколон-спрей", 2),
    "Krem Kolonya":         ("kolonya-krem", "Крем-одеколон", 3),
    "Parfüm":               ("parfum", "Парфюмерия", 4),
    "Saç Şekillendirici":   ("styling-volos", "Стайлинг для волос", 5),
    "Fön Suyu":             ("spray-ukladka", "Спрей для укладки", 6),
    "Şampuan":              ("shampun", "Шампуни и кондиционеры", 7),
    "Saç Kremi":            ("shampun", "Шампуни и кондиционеры", 7),
    "Saç Boyası":           ("kraska-volos", "Краска и цветные спреи", 8),
    "Tıraş Jeli":           ("gel-britya", "Гель для бритья", 9),
    "Sakal Yağı":           ("uhod-boroda", "Уход за бородой", 10),
    "Sakal Bakım":          ("uhod-boroda", "Уход за бородой", 10),
    "Sakal Şampuanı":       ("uhod-boroda", "Уход за бородой", 10),
    "Sakal Şekillendirici": ("uhod-boroda", "Уход за бородой", 10),
    "Cilt Bakımı":          ("uhod-koza", "Уход за кожей", 11),
    "Fırça":                ("shchetki", "Щётки и расчёски", 12),
    "Penuar":               ("penuary", "Пеньюары", 13),
    "Apron":                ("fartuki", "Фартуки", 14),
    "Boyun Bandı":          ("vorotnichki", "Воротнички", 15),
    "Ürünler > Aksesuar > Boyun Bandı": ("vorotnichki", "Воротнички", 15),
    "Aksesuar":             ("aksessuary", "Аксессуары", 16),
    "Pompa":                ("aksessuary", "Аксессуары", 16),
    "Paketler":             ("nabory", "Наборы", 17),
}
# товары без product_type
BY_TITLE = {"JRL-2020T-G FreshFade 2020T Trimmer Gold": ("mashinki", "Машинки и триммеры", 18),
            "JRL-2020C-G FreshFade 2020C Clipper Gold": ("mashinki", "Машинки и триммеры", 18),
            "Sirene Co-Box": ("nabory", "Наборы", 17)}

# Сначала устойчивые сочетания, потом отдельные слова.
PHRASES = [
    (r"\bçift\s*fazlı\b", "двухфазный"), (r"\bfön\s*suyu\b", "спрей для укладки"),
    (r"\byeşi̇?l\s*çay\b", "Зелёный чай"), (r"\bki̇?raz\s*çi̇?çeği̇?\b", "Цветок вишни"),
    (r"\bsandal\s*ağacı\b", "сандал"), (r"\bdeniz\s*tuzlu\b", "с морской солью"),
    (r"\bkoyu\s*kahverengi\b", "тёмно-коричневый"), (r"\bhalı\s*desen\b", "ковровый узор"),
    (r"\bsaç\s*kremi\b", "кондиционер для волос"), (r"\bsaç\s*boyası\b", "краска для волос"),
    (r"\bsa[yç]\s*boyası\b", "краска для волос"),
    (r"\bgeçici\s*renkli\s*saç\s*spreyi\b", "временный цветной спрей для волос"),
    (r"\bkrem\s*kolonya\b", "крем-одеколон"), (r"\btıraş\s*jeli\b", "гель для бритья"),
    (r"\btra[şs]\s*fırça[rs]ı\b", "помазок"), (r"\bboyun\s*bandı\b", "воротнички"),
    (r"\bsakal\s*yağı\b", "масло для бороды"), (r"\bsakal\s*şampuanı\b", "шампунь для бороды"),
    (r"\bsakal\s*bakım\b", "уход за бородой"), (r"\bcam\s*şişe\b", "стеклянный флакон"),
    (r"\berkek\s*parfüm\b", "мужской парфюм"), (r"\bpenuar\s*takım\b", "комплект пеньюаров"),
]
WORDS = {
    "kolonya": "одеколон", "kolonyası": "одеколон", "sprey": "спрей", "spreyi": "спрей",
    "şişe": "флакон", "cam": "стеклянный", "erkek": "мужской", "parfüm": "парфюм",
    "saç": "для волос", "pompalı": "с помпой", "tıraş": "для бритья", "traş": "для бритья",
    "jeli": "гель", "jölesi": "гель", "geçici": "временный", "renkli": "цветной",
    "penuar": "пеньюар", "pet": "ПЭТ", "sakal": "для бороды", "bakım": "уход",
    "siyah": "чёрный", "beyaz": "белый", "sarı": "жёлтый", "kırmızı": "красный",
    "pembe": "розовый", "mor": "фиолетовый", "mavi": "синий", "yeşil": "зелёный",
    "turuncu": "оранжевый", "gümüş": "серебристый", "altın": "золотой", "bej": "бежевый",
    "lt": "л", "gr": "г", "klasik": "классический", "limon": "лимон", "li̇mon": "лимон",
    "yağı": "масло", "fırça": "щётка", "fırçası": "щётка", "fırçarı": "щётка",
    "tarak": "расчёска", "bandı": "лента", "paket": "набор", "set": "набор", "seti": "набор",
    "takım": "комплект", "şampuan": "шампунь", "şampuanı": "шампунь", "kremi": "кондиционер",
    "krem": "крем", "boyası": "краска", "derece": "°", "ve": "и", "vanilyalı": "ванильный",
    "tütün": "табак", "arındırıcı": "очищающий", "besleyici": "питательный",
    "güçlendirici": "укрепляющий", "onarıcı": "восстанавливающий", "nemlendirici": "увлажняющий",
    "şekillendirici": "стайлинг", "toz": "пудра", "önlük": "фартук", "önlüğü": "фартук",
    "boyun": "шея", "trimmer": "триммер", "clipper": "машинка для стрижки",
    "kakao": "какао", "argan": "аргановый", "keratin": "кератин", "kolajen": "коллаген",
    "biotin": "биотин", "atomizer": "атомайзер", "pırlanta": "бриллиант", "çiçeği": "цветок",
    "kiraz": "вишня", "çay": "чай", "amber": "Амбра", "okyanus": "Океан", "şimşek": "Молния",
    "mix": "микс", "desen": "узор", "halı": "ковровый",
}


def ru_title(t: str) -> str:
    s = " " + re.sub(r"\s+", " ", t).strip() + " "
    for pat, rep in PHRASES:
        s = re.sub(pat, rep, s, flags=re.I)
    def one(m):
        w = m.group(0)
        return WORDS.get(w.lower(), w)
    s = re.sub(r"[A-Za-zÇĞİIÖŞÜçğıöşü̇]+", one, s)
    s = re.sub(r"\bML\b", "мл", s, flags=re.I)
    s = re.sub(r"\bLT\b", "л", s, flags=re.I)
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\b(\w+) \1\b", r"\1", s, flags=re.I)          # повторы слов
    s = re.sub(r"(\d+)'l[ıi]\b", r"набор из \1", s)             # 6'lı → набор из 6
    # турецкая ı внутри латинских имён собственных: Spıder → Spider
    s = re.sub(r"(?<=[A-Za-z])ı(?=[A-Za-z])", "i", s)
    s = re.sub(r"\bı(?=[A-Za-z])", "i", s)
    # согласование и порядок слов
    for pat, rep in [
        (r"временный краска", "краска временная"),
        (r"для бороды стайлинг", "стайлинг для бороды"),
        (r"для волос уход кондиционер", "кондиционер для волос"),
        (r"кератин для волос уход", "кондиционер для волос с кератином"),
        (r"\bкератин шампунь", "шампунь с кератином"),
        (r"\bаргановый шампунь", "шампунь с аргановым маслом"),
        (r"\bкератин двухфазный", "двухфазный с кератином"),
        (r"\bколлаген двухфазный", "двухфазный с коллагеном"),
        (r"\bбиотин двухфазный", "двухфазный с биотином"),
        (r"(\d+)\s*°", r"\1°"),
    ]:
        s = re.sub(pat, rep, s, flags=re.I)
    # объём и вес — в конец названия
    m = re.search(r"\b(\d+(?:[.,]\d+)?\s*(?:мл|л|г)|\d+\s*x\s*\d+\s*мл)\b", s, re.I)
    if m and not s.rstrip().endswith(m.group(1)):
        s = (s[:m.start()] + s[m.end():]).strip() + " " + m.group(1)
    s = re.sub(r"\s+", " ", s).strip(" ,")
    if not re.match(r"(?i)^marmara", s):
        s = "Marmara " + s
    return s[0].upper() + s[1:]


TURKISH = re.compile(r"[ğşıçöüĞŞİÇÖÜ]")

products = json.load(open("mm_all.json"))
out, skipped = [], []
for h, p in products.items():
    if not p.get("images"):
        skipped.append((p["title"], "нет фото")); continue
    pt = p.get("product_type") or ""
    cat = CATS.get(pt) or BY_TITLE.get(p["title"])
    if not cat:
        skipped.append((p["title"], f"нет категории ({pt})")); continue
    v = (p.get("variants") or [{}])[0]
    try:
        try_price = float(v.get("price") or 0)
    except ValueError:
        try_price = 0
    price = int(math.ceil(try_price * RATE / 10.0) * 10) if try_price > 0 else None
    name = ru_title(p["title"])
    out.append({"handle": h, "slug": "marmara-" + h[:60], "name": name,
                "orig": p["title"], "cat_slug": cat[0], "cat_name": cat[1], "cat_order": cat[2],
                "sku": v.get("sku") or None, "price": price, "try_price": try_price,
                "img": p["images"][0]["src"].split("?")[0],
                "needs_review": bool(TURKISH.search(name))})

json.dump(out, open("mm_ready.json", "w"), ensure_ascii=False, indent=1)
print(f"готово к импорту: {len(out)} | пропущено: {len(skipped)}")
for t, why in skipped:
    print("  пропуск:", t[:55], "—", why)
bad = [o for o in out if o["needs_review"]]
print(f"\nостались турецкие слова в {len(bad)} названиях:")
for o in bad:
    print(f"  · {o['name'][:78]}")
