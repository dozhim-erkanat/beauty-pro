"""Разбор карточек по правилам каждого сайта: имя, цена, фото, характеристики."""
import html, json, os, re
from scrape_common import parse, strip_tags

HOST_IMG = {
    "valeraforsalon.ru": (r'https://valeraforsalon\.ru/wp-content/uploads/[^"\')\s]+\.(?:jpg|jpeg|png|webp)', None),
    "www.moysalon.ru":   (r'https://www\.moysalon\.ru/new_photos/(?:preview|big)/[^"\')\s]+\.(?:jpg|jpeg|png)', None),
    "mrd-pro.ru":        (r'//mrd-pro\.ru/files/products/[^"\')\s]+\.(?:jpg|jpeg|png)', "https:"),
    "www.dewal.ru":      (r'/upload/resize_cache/imgParik/[^"\')\s]+/1000x1000/[^"\')\s]+\.(?:jpg|jpeg|png)', "https://www.dewal.ru"),
    "www.andis.com.ru":  (r'/upload/iblock/[^"\')\s]+\.(?:jpg|jpeg|png)', "https://www.andis.com.ru"),
    "andisrussia.ru":    (r'https://andisrussia\.ru/image/cache/catalog/[^"\')\s]+-600x600\.(?:jpg|jpeg|png)', None),
}


def biggest(url: str) -> str:
    """Пробуем получить оригинал вместо уменьшенной копии."""
    url = re.sub(r"\.\d+x\d+(\.(?:jpg|jpeg|png))$", r"\1", url)          # mrd-pro
    url = url.replace("/new_photos/preview/", "/new_photos/big/")        # moysalon
    return url


def h1(page: str):
    m = re.search(r"<h1[^>]*>(.*?)</h1>", page, re.S | re.I)
    return re.sub(r"\s+", " ", strip_tags(m.group(1))).strip() if m else None


def specs(page: str) -> list:
    """Таблица характеристик: <tr><td>Название</td><td>Значение</td></tr>."""
    out = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", page, re.S | re.I):
        tds = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.S | re.I)
        if len(tds) == 2:
            k, v = (re.sub(r"\s+", " ", strip_tags(x)).strip() for x in tds)
            if 1 < len(k) <= 40 and 0 < len(v) <= 80 and not k.lower().startswith(("цена", "артикул")):
                out.append({"name": k, "value": v})
    seen, res = set(), []
    for s in out:
        if s["name"].lower() in seen:
            continue
        seen.add(s["name"].lower())
        res.append(s)
    return res[:12]


def enrich(rec: dict, page: str) -> dict:
    host = rec["url"].split("/")[2]

    name = h1(page)
    if name and (not rec["name"] or len(name) > 5):
        rec["name"] = name
    rec["name"] = re.sub(r"^Купить\s+", "", rec["name"] or "", flags=re.I).strip()

    # Цена: у OpenCart настоящая лежит в разметке, на странице много посторонних чисел.
    if host == "andisrussia.ru":
        m = re.search(r'"price"\s*:\s*"?([\d.]+)', page)
        rec["price"], rec["currency"] = (m.group(1) if m else None), "RUB"
    if host == "valeraforsalon.ru":
        rec["price"], rec["currency"] = None, None      # цены на сайте не публикуются

    if not rec["images"] and host in HOST_IMG:
        pat, prefix = HOST_IMG[host]
        found = re.findall(pat, page, re.I)
        urls = []
        for u in found:
            if re.search(r"logo|icon|sprite|banner|payment|social|placeholder|no-?photo|/brand/", u, re.I):
                continue
            full = (prefix + u) if prefix and u.startswith("/") else u
            full = biggest(full)
            if full not in urls:
                urls.append(full)
        rec["images"] = urls[:6]

    if not rec["desc"] or len(rec["desc"]) < 40:
        for pat in (r'<div[^>]+(?:id|class)="[^"]*(?:description|detail_text|product-desc|tab-content)[^"]*"[^>]*>(.*?)</div>\s*</div>',
                    r'<div[^>]+itemprop="description"[^>]*>(.*?)</div>'):
            m = re.search(pat, page, re.S | re.I)
            if m:
                t = strip_tags(m.group(1))
                if len(t) > 40:
                    rec["desc"] = t[:1500]
                    break

    rec["specs"] = specs(page)
    return rec


rows = []
for folder, urlfile in [("andis", "andis_urls.txt"), ("valera", "valera_urls.txt"), ("misc", "misc_urls.txt")]:
    urls = [l.strip() for l in open(urlfile) if l.strip()]
    for i, u in enumerate(urls, 1):
        f = f"{folder}/{i:02d}.html"
        page = open(f, encoding="utf-8", errors="ignore").read() if os.path.exists(f) else ""
        if "Just a moment" in page[:3000] or len(page) < 8000:
            rows.append({"url": u, "folder": folder, "idx": i, "blocked": True,
                         "name": None, "price": None, "currency": None,
                         "images": [], "desc": "", "specs": [], "sku": None})
            continue
        rec = enrich(parse(page, u), page)
        rec.update({"folder": folder, "idx": i, "blocked": False})
        rows.append(rec)

json.dump(rows, open("scraped_all.json", "w"), ensure_ascii=False, indent=1)

for r in rows:
    host = r["url"].split("/")[2]
    if r["blocked"]:
        mark = "БЛОК"
    elif r["name"] and r["images"]:
        mark = "OK  " if r["price"] else "БЕЗ ЦЕНЫ"
    else:
        mark = "!!  "
    print(f" {mark:9} {host:20} | {str(r['name'])[:44]:46} | {str(r['price'] or '—')[:9]:9} {r['currency'] or '':4} | фото {len(r['images'])} | хар-к {len(r['specs'])}")

print()
print("всего:", len(rows),
      "| готовы:", sum(1 for r in rows if r["name"] and r["images"]),
      "| заблокированы:", sum(1 for r in rows if r["blocked"]),
      "| без фото:", sum(1 for r in rows if not r["blocked"] and not r["images"]))
