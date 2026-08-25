"""Универсальный разбор карточки товара: JSON-LD → og-теги → микроразметка."""
import html, json, re


def _walk(node, out):
    """Собирает все объекты типа Product из графа JSON-LD."""
    if isinstance(node, dict):
        t = node.get("@type")
        types = t if isinstance(t, list) else [t]
        if any(str(x).lower() == "product" for x in types if x):
            out.append(node)
        for v in node.values():
            _walk(v, out)
    elif isinstance(node, list):
        for v in node:
            _walk(v, out)


def _first_offer(p):
    o = p.get("offers")
    if isinstance(o, list):
        o = o[0] if o else None
    if isinstance(o, dict):
        if o.get("@type") == "AggregateOffer":
            return o.get("lowPrice") or o.get("price"), o.get("priceCurrency")
        return o.get("price"), o.get("priceCurrency")
    return None, None


def strip_tags(s: str) -> str:
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", s or "", flags=re.S | re.I)
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"</(p|div|li|tr)\s*>", "\n", s, flags=re.I)
    s = re.sub(r"<li[^>]*>", "• ", s, flags=re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s).replace("\xa0", " ")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n\s*\n\s*\n+", "\n\n", s)
    return "\n".join(l.strip() for l in s.split("\n")).strip()


def parse(page: str, url: str) -> dict:
    res = {"url": url, "name": None, "desc": None, "price": None,
           "currency": None, "sku": None, "brand": None, "images": []}

    blocks = re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        page, re.S | re.I)
    products = []
    for b in blocks:
        b = b.strip()
        try:
            products_data = json.loads(b)
        except Exception:
            try:
                products_data = json.loads(re.sub(r",\s*([}\]])", r"\1", b))
            except Exception:
                continue
        _walk(products_data, products)

    if products:
        p = max(products, key=lambda x: len(json.dumps(x)))
        res["name"] = p.get("name")
        res["desc"] = strip_tags(p.get("description") or "")
        res["sku"] = p.get("sku") or p.get("mpn")
        b = p.get("brand")
        res["brand"] = b.get("name") if isinstance(b, dict) else b
        price, cur = _first_offer(p)
        res["price"], res["currency"] = price, cur
        img = p.get("image")
        if isinstance(img, str):
            res["images"] = [img]
        elif isinstance(img, list):
            res["images"] = [i if isinstance(i, str) else i.get("url") for i in img]
        elif isinstance(img, dict):
            res["images"] = [img.get("url")]

    def meta(prop):
        m = re.search(rf'<meta[^>]+(?:property|name)=["\']{prop}["\'][^>]+content=["\']([^"\']*)', page, re.I)
        if not m:
            m = re.search(rf'<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:property|name)=["\']{prop}["\']', page, re.I)
        return html.unescape(m.group(1)).strip() if m else None

    if not res["name"]:
        res["name"] = meta("og:title") or (
            html.unescape(re.search(r"<title>(.*?)</title>", page, re.S).group(1)).strip()
            if re.search(r"<title>(.*?)</title>", page, re.S) else None)
    if not res["desc"]:
        res["desc"] = meta("og:description") or meta("description") or ""
    if not res["images"]:
        og = meta("og:image")
        if og:
            res["images"] = [og]
    if res["price"] is None:
        m = (re.search(r'itemprop=["\']price["\'][^>]*content=["\']([\d.,\s]+)', page, re.I)
             or re.search(r'<meta[^>]+property=["\']product:price:amount["\'][^>]+content=["\']([\d.,\s]+)', page, re.I))
        if m:
            res["price"] = m.group(1)
    if not res["currency"]:
        m = (re.search(r'itemprop=["\']priceCurrency["\'][^>]*content=["\']([A-Z]{3})', page, re.I)
             or re.search(r'product:price:currency["\'][^>]+content=["\']([A-Z]{3})', page, re.I))
        if m:
            res["currency"] = m.group(1)

    res["images"] = [i for i in res["images"] if i]
    return res
