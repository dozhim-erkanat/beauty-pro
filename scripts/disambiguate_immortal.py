"""Развести одноимённые товары Immortal: уточнить названия и сделать slug уникальным.

На сайте-источнике варианты одного средства называются одинаково («ВОСК ДЛЯ ВОЛОС»),
а отличаются линейкой или ароматом, названным где-то внутри описания. Поэтому
различитель ищем не по позиции в тексте, а по смыслу: берём то, что есть в описании
одного товара и чего нет у соседей по группе.
"""
import json, re
from collections import Counter, defaultdict

items = json.load(open("ir_ready.json"))

TRANSLIT = {"а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"zh","з":"z",
            "и":"i","й":"i","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r",
            "с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sch",
            "ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya"}

STOP = {"immortal", "nyc", "infuse", "the", "и", "для", "описание", "основные",
        "характеристики", "продукта", "витамин", "витамином"}


def slugify(s: str) -> str:
    s = "".join(TRANSLIT.get(ch, ch) for ch in s.lower())
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:60]


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip()


def candidates(o) -> list:
    """Возможные имена варианта, от самых надёжных к запасным."""
    d = norm(o.get("desc"))
    out = []
    out += [m.strip() for m in re.findall(r"[«\"']([^»\"']{3,40})[»\"']", d)]
    out += [re.sub(r"^(?:NYC|Infuse)\s+", "", m).strip()
            for m in re.findall(r"\b(?:IMMORTAL|Immortal)\s+"
                                r"((?:[A-Z][a-zA-Z]+|[A-Z]{2,})"
                                r"(?:\s+(?:[A-Z][a-zA-Z]+|[A-Z]{2,})){0,3})", d)]
    out += re.findall(r"\b((?:[A-Z][a-zA-Z]{2,})(?:\s+[A-Z][a-zA-Z]{2,}){0,3})\b", d)

    # Заголовок капсом в начале описания, точка не обязательна:
    # «СРЕДНИЙ БЛЕСК - СИЛЬНАЯ ФИКСАЦИЯ Формула, обогащенная…»
    m = re.match(r"((?:[А-ЯЁ][А-ЯЁ]+|[-–—0-9]+)(?:\s+(?:[А-ЯЁ][А-ЯЁ]+|[-–—0-9]+)){1,7})", d)
    if m:
        t = m.group(1).strip(" -–—").lower().replace(" - ", ", ")
        if 3 < len(t) <= 60:
            out.append(t[0].upper() + t[1:])

    seen, res = set(), []
    for c in out:
        c = c.strip(" .,-—")
        if not c or c.lower() in STOP or len(c) < 3:
            continue
        if c.lower() in seen:
            continue
        seen.add(c.lower())
        res.append(c)
    return res


def volume(o) -> str:
    for s in o.get("specs", []):
        if s["name"].lower().startswith("объ"):
            return s["value"]
    return ""


groups = defaultdict(list)
for o in items:
    groups[o["slug"]].append(o)

renamed = 0
for slug, g in groups.items():
    if len(g) < 2:
        continue
    others = [norm(x.get("desc")).lower() for x in g]
    for i, o in enumerate(g):
        rest = " || ".join(d for j, d in enumerate(others) if j != i)
        pick = next((c for c in candidates(o) if c.lower() not in rest), "")
        if not pick:
            pick = volume(o)          # хотя бы объём
        if pick and pick.lower() not in o["name"].lower():
            if re.fullmatch(r"[\d.,]+\s*(мл|гр|г|л)", pick, re.I):
                o["name"] = f"{o['name']}, {pick}"
            elif re.search(r"[А-Яа-я]", pick):
                o["name"] = f"{o['name']} «{pick}»"
            else:
                o["name"] = f"{o['name']} {pick}"
            renamed += 1

# Уникальные адреса: при совпадении добавляем хвост идентификатора товара.
seen = set()
for o in items:
    base = "immortal-" + slugify(o["name"])
    slug = base if base not in seen else f"{base[:52]}-{str(o['uid'])[-5:]}"
    seen.add(slug)
    o["slug"] = slug

# Имена файлов картинок привязываем к идентификатору товара — он не меняется.
for o in items:
    o["keys"] = [f"immortal-{o['uid']}-{n}{'.png' if p.lower().endswith('.png') else '.jpg'}"
                 for n, p in enumerate(o["local"], 1)]

# Если развести не удалось — нумеруем, чтобы карточки не выглядели одинаковыми.
still = defaultdict(list)
for o in items:
    still[o["name"]].append(o)
unresolved = []
for name, g in still.items():
    if len(g) > 1:
        for i, o in enumerate(g[1:], 2):
            o["name"] = f"{name} (вариант {i})"
            unresolved.append(o["name"])

seen = set()
for o in items:
    base = "immortal-" + slugify(o["name"])
    slug = base if base not in seen else f"{base[:52]}-{str(o['uid'])[-5:]}"
    seen.add(slug)
    o["slug"] = slug
    o["keys"] = [f"immortal-{o['uid']}-{n}{'.png' if p.lower().endswith('.png') else '.jpg'}"
                 for n, p in enumerate(o["local"], 1)]

json.dump(items, open("ir_ready.json", "w"), ensure_ascii=False, indent=1)
print("помечено номером варианта:", len(unresolved))
for u in unresolved:
    print("   ", u[:64])

names, slugs = Counter(o["name"] for o in items), Counter(o["slug"] for o in items)
print(f"позиций: {len(items)} | уникальных адресов: {len(slugs)} | уточнено названий: {renamed}")
print("совпадающих адресов:", sum(1 for v in slugs.values() if v > 1))
dup = {k: v for k, v in names.items() if v > 1}
print("групп-тёзок осталось:", len(dup))
for k, v in dup.items():
    print(f"   ×{v}  {k[:60]}")
