"""Нормализация названий и перевод описаний Cutrin на русский."""
import json, re

RU = {
 "anti-dandruff daily shampoo": ("Шампунь против перхоти", "Шампунь против перхоти для ежедневного применения."),
 "anti-dandruff scalp treatment": ("Уход против перхоти", "Несмываемый уход для кожи головы против перхоти."),
 "anti-dandruff shampoo for flaky and oily scalp": ("Шампунь против перхоти", "Для склонной к шелушению и жирности кожи головы."),
 "calming and hydrating scalp treatment for dry scalp": ("Успокаивающий уход", "Успокаивает и увлажняет сухую кожу головы."),
 "calming cleansing conditioner": ("Очищающий кондиционер", "Мягко очищает и успокаивает кожу головы, заменяя шампунь."),
 "care spray for oily scalp": ("Спрей-уход", "Несмываемый спрей для жирной кожи головы."),
 "color protecting conditioner": ("Кондиционер для окрашенных волос", "Сохраняет насыщенность цвета и облегчает расчёсывание."),
 "color protection shampoo": ("Шампунь для окрашенных волос", "Бережно очищает и продлевает стойкость цвета."),
 "color protecting shampoo": ("Шампунь для окрашенных волос", "Бережно очищает и продлевает стойкость цвета."),
 "conditioner for women suffering for thinning hair and/or growing long hair": ("Кондиционер при истончении волос", "Для женщин с тонкими редеющими волосами и тех, кто отращивает длину."),
 "deep cleansing shampoo": ("Шампунь глубокой очистки", "Удаляет остатки стайлинга и загрязнения."),
 "dry-shampoo": ("Сухой шампунь", "Освежает волосы без воды, убирает жирность у корней."),
 "elastic hairspray": ("Лак эластичной фиксации", "Держит форму, оставляя волосы подвижными."),
 "extra strong hairspray": ("Лак экстрасильной фиксации", "Максимальная фиксация укладки."),
 "for hair styling": ("Средство для укладки", "Средство для моделирования и укладки волос."),
 "fragrance-free giftbox for sensitive hairtypes": ("Подарочный набор без отдушек", "Набор для чувствительной кожи головы, без отдушек."),
 "heat protection": ("Термозащита", "Защищает волосы при укладке феном и утюжком."),
 "hydrating mask for curly hair": ("Маска для вьющихся волос", "Интенсивно увлажняет кудри и облегчает расчёсывание."),
 "hydrating conditioner for curl hair": ("Кондиционер для вьющихся волос", "Увлажняет и подчёркивает форму локона."),
 "hydrating conditioner for dry scalp": ("Увлажняющий кондиционер", "Для сухой кожи головы и сухих волос."),
 "hydrating shampoo curly hair": ("Шампунь для вьющихся волос", "Увлажняет и облегчает укладку кудрей."),
 "hydrating shampoo for dry scalp": ("Увлажняющий шампунь", "Мягко очищает и увлажняет сухую кожу головы."),
 "iconic multispray": ("Мультиспрей", "Многофункциональный спрей: уход, лёгкая фиксация, блеск."),
 "instant hairspray": ("Лак быстрой фиксации", "Мгновенно фиксирует укладку."),
 "intensive moisturizing mask": ("Интенсивная увлажняющая маска", "Глубокое увлажнение сухих и повреждённых волос."),
 "light volumizing mousse": ("Мусс для лёгкого объёма", "Придаёт объём, не утяжеляя волосы."),
 "mineral remove shampoo": ("Шампунь против жёсткой воды", "Удаляет минеральный налёт от жёсткой воды."),
 "moisture giftbox for sensitive scalp and hair.": ("Подарочный набор увлажнения", "Набор для чувствительной кожи головы и сухих волос."),
 "moisturizing conditioner": ("Увлажняющий кондиционер", "Смягчает волосы и облегчает расчёсывание."),
 "moisturizing shampoo": ("Увлажняющий шампунь", "Мягко очищает и увлажняет волосы."),
 "moisturizing leave-in mist": ("Увлажняющий несмываемый спрей", "Лёгкий уход без утяжеления."),
 "multispray": ("Мультиспрей", "Многофункциональный спрей для ухода и укладки."),
 "root lifting spraymousse": ("Спрей-мусс для прикорневого объёма", "Приподнимает волосы у корней."),
 "rough texture salt spray": ("Солевой спрей", "Пляжная текстура и матовый эффект."),
 "salt spray for men": ("Солевой спрей для мужчин", "Текстура и матовость для мужской укладки."),
 "scalp serum for men suffering for pre-mature hairloss": ("Сыворотка для кожи головы", "Для мужчин с ранним выпадением волос."),
 "scalp serum for women suffering for thinning hair and/or growing long hair": ("Сыворотка для кожи головы", "Для женщин с тонкими редеющими волосами."),
 "sensitive fragrance-free care spray": ("Спрей-уход без отдушек", "Для чувствительной кожи головы, без отдушек."),
 "sensitive fragrance-free cleansing conditioner": ("Очищающий кондиционер без отдушек", "Мягкое очищение без шампуня, без отдушек."),
 "sensitive fragrance-free conditioner": ("Кондиционер без отдушек", "Для чувствительной кожи головы, без отдушек."),
 "sensitive fragrance-free deep soothing care": ("Успокаивающий уход без отдушек", "Интенсивно успокаивает раздражённую кожу головы."),
 "sensitive fragrance-free dry-shampoo": ("Сухой шампунь без отдушек", "Освежает волосы без воды, без отдушек."),
 "sensitive fragrance-free heat protection spray": ("Термозащитный спрей без отдушек", "Защита при горячей укладке, без отдушек."),
 "sensitive fragrance-free light hairspray": ("Лак лёгкой фиксации без отдушек", "Подвижная фиксация, без отдушек."),
 "sensitive fragrance-free multispray": ("Мультиспрей без отдушек", "Многофункциональный уход, без отдушек."),
 "sensitive fragrance-free shampoo": ("Шампунь без отдушек", "Для чувствительной кожи головы, без отдушек."),
 "sensitive fragrance-free strong hairspray": ("Лак сильной фиксации без отдушек", "Надёжная фиксация, без отдушек."),
 "sensitive fragrance-free styling wax strong": ("Воск сильной фиксации без отдушек", "Моделирует и держит форму, без отдушек."),
 "sensitive fragrance-free volumizing mousse": ("Мусс для объёма без отдушек", "Придаёт объём, без отдушек."),
 "shampoo for dry scalp": ("Шампунь для сухой кожи головы", "Мягко очищает, не пересушивая кожу головы."),
 "shampoo for men for daily use": ("Шампунь для мужчин", "Для ежедневного применения."),
 "shampoo for men suffering for pre-mature hairloss": ("Шампунь при выпадении волос", "Для мужчин с ранним выпадением волос."),
 "shampoo for oily scalp": ("Шампунь для жирной кожи головы", "Нормализует работу сальных желёз."),
 "shampoo for women suffering for thinning hair and/or growing long hair": ("Шампунь при истончении волос", "Для женщин с тонкими редеющими волосами."),
 "silky texture sugarspray": ("Сахарный спрей", "Мягкая текстура и лёгкая подвижная фиксация."),
 "silver conditioner": ("Оттеночный кондиционер Silver", "Нейтрализует желтизну на светлых и седых волосах."),
 "silver shampoo": ("Оттеночный шампунь Silver", "Убирает желтизну со светлых и седых волос."),
 "smoothing serum": ("Разглаживающая сыворотка", "Дисциплинирует пушащиеся волосы и придаёт блеск."),
 "soft molding paste": ("Моделирующая паста", "Мягкая фиксация с матовым эффектом."),
 "strenghtening conditioner": ("Укрепляющий кондиционер", "Укрепляет волосы и облегчает расчёсывание."),
 "strengthening shampoo": ("Укрепляющий шампунь", "Укрепляет волосы по всей длине."),
 "strengthening conditioner": ("Укрепляющий кондиционер", "Укрепляет волосы и облегчает расчёсывание."),
 "strengthening serum": ("Укрепляющая сыворотка", "Несмываемый уход для укрепления волос."),
 "strong styling wax for men": ("Воск для укладки для мужчин", "Сильная фиксация мужской укладки."),
 "strong volume mousse": ("Мусс сильной фиксации", "Объём и надёжная фиксация."),
 "strong volumizing mousse": ("Мусс для объёма сильной фиксации", "Объём и надёжная фиксация."),
 "super strong pump hairspray": ("Спрей-лак суперсильной фиксации", "Помповый лак максимальной фиксации."),
 "toning espresso treatment": ("Тонирующий уход Espresso", "Освежает тёмный оттенок и добавляет блеск."),
 "traditional daily use shampoo for flaky and oily scalp": ("Шампунь для жирной кожи головы", "Классическая формула для ежедневного применения."),
 "traditional moisturizing shampoo for dry scalp": ("Увлажняющий шампунь", "Классическая формула для сухой кожи головы."),
 "traditional shampoo for dandruff": ("Шампунь против перхоти", "Классическая формула против перхоти."),
 "treatment": ("Уход для кожи головы", "Интенсивный уход для кожи головы."),
 "volumizing conditioner": ("Кондиционер для объёма", "Придаёт объём тонким волосам."),
 "volumizing shampoo": ("Шампунь для объёма", "Придаёт объём тонким волосам."),
 "volumizing dry-shampoo": ("Сухой шампунь для объёма", "Освежает и приподнимает волосы у корней."),
 "anti-breakage serum": ("Сыворотка против ломкости", "Укрепляет и защищает волосы от ломкости."),
}

LINE_CAT = {"AINOA": ("ainoa", "AINOA Мытьё и уход"),
            "BIO+": ("bio-plus", "BIO+ Уход за кожей головы"),
            "VIENO": ("vieno", "VIENO Без отдушек"),
            "MUOTO": ("muoto", "MUOTO Стайлинг"),
            "ROUTA": ("routa", "ROUTA Мужская линия"),
            "HOHDE": ("hohde", "HOHDE Поддержание цвета")}


def clean_name(raw: str) -> str:
    n = re.sub(r"\s+", " ", raw).strip()
    n = re.sub(r"^NEW\s+", "", n, flags=re.I)
    if n.isupper():                     # ALL CAPS → Красивый Регистр
        n = " ".join(w.capitalize() for w in n.split())
        n = re.sub(r"\bCutrin\b", "CUTRIN", n)
        n = re.sub(r"\b(Ainoa|Vieno|Muoto|Routa|Hohde)\b", lambda m: m.group(1).upper(), n)
    if not n.upper().startswith("CUTRIN"):
        n = "CUTRIN " + n
    n = re.sub(r"\bBio\b", "BIO+", n)
    n = re.sub(r"(\d+)\s*ML\b", r"\1 мл", n, flags=re.I)
    return re.sub(r"\s+", " ", n).strip()


def volume(name: str):
    m = re.search(r"(\d+)\s*мл", name)
    return f"{m.group(1)} мл" if m else None


rows = json.load(open("scraped.json"))
out, missing = [], set()
for i, r in enumerate(sorted(rows, key=lambda x: (x["line"], x["name"])), 1):
    key = r["desc"].strip().lower()
    if key not in RU:
        missing.add(r["desc"])
    short, desc = RU.get(key, (r["desc"], r["desc"]))
    name = clean_name(r["name"])
    cat_slug, cat_name = LINE_CAT[r["line"]]
    out.append({"slug": "cutrin-" + r["slug"].replace("cutrin-", "", 1),
                "name": name, "short": short, "desc": desc,
                "line": r["line"], "cat_slug": cat_slug, "cat_name": cat_name,
                "ean": r["ean"], "volume": volume(name), "img": r["img"], "order": i})

if missing:
    print("НЕТ ПЕРЕВОДА для:", *sorted(missing), sep="\n  ")
json.dump(out, open("cutrin_all.json", "w"), ensure_ascii=False, indent=1)
print(f"\nподготовлено: {len(out)}")
for l in LINE_CAT:
    s = [o for o in out if o["line"] == l]
    print(f"  {l:6} {len(s):2}  напр.: {s[0]['name'][:52] if s else '—'}")
