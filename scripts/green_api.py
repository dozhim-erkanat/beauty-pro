"""Помощник по Green API: найти chatId группы и проверить отправку.

    export GREEN_API_ID_INSTANCE=1101000001
    export GREEN_API_TOKEN=xxxxxxxxxxxxxxxx

    python3 scripts/green_api.py state              # состояние инстанса
    python3 scripts/green_api.py groups             # список групп и их chatId
    python3 scripts/green_api.py send <chatId> [текст]   # тестовое сообщение
"""
import json, os, sys, urllib.request, urllib.error

BASE = os.environ.get("GREEN_API_BASE_URL", "https://api.green-api.com")
ID = os.environ.get("GREEN_API_ID_INSTANCE")
TOKEN = os.environ.get("GREEN_API_TOKEN")

if not ID or not TOKEN:
    sys.exit("Задайте GREEN_API_ID_INSTANCE и GREEN_API_TOKEN")


def call(method, body=None):
    url = f"{BASE}/waInstance{ID}/{method}/{TOKEN}"
    req = urllib.request.Request(url, method="POST" if body else "GET")
    if body:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, json.dumps(body).encode() if body else None, timeout=30) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:300]}")


cmd = sys.argv[1] if len(sys.argv) > 1 else "state"

if cmd == "state":
    print(json.dumps(call("getStateInstance"), ensure_ascii=False, indent=1))

elif cmd == "groups":
    contacts = call("getContacts")
    groups = [c for c in contacts if str(c.get("id", "")).endswith("@g.us")]
    if not groups:
        print("Групп не найдено. Номер должен состоять в группе, а инстанс — "
              "быть авторизован (проверьте: python3 scripts/green_api.py state).")
    for g in groups:
        print(f"  {g.get('name') or '(без названия)':40} {g['id']}")
    print(f"\nвсего групп: {len(groups)}")

elif cmd == "send":
    if len(sys.argv) < 3:
        sys.exit("Укажите chatId: python3 scripts/green_api.py send 1203630...@g.us")
    chat = sys.argv[2]
    text = sys.argv[3] if len(sys.argv) > 3 else "Проверка связи Beauty Pro ✅"
    print(json.dumps(call("sendMessage", {"chatId": chat, "message": text}),
                     ensure_ascii=False, indent=1))

else:
    sys.exit(__doc__)
