import json, base64, urllib.request, time, re, sys, os

CATEGORIES = ['alphabet', 'animals', 'blocks', 'decoration',
              'food-drinks', 'humans', 'humanoid', 'monsters',
              'plants', 'miscellaneous']

def extract_hash(value_b64):
    try:
        raw = base64.b64decode(value_b64).decode('utf-8', errors='ignore')
        m = re.search(r'texture/([a-fA-F0-9]+)', raw)  # singular "texture/"
        return m.group(1).lower() if m else None
    except: return None

all_heads, seen = [], set()

for cat in CATEGORIES:
    url = f'https://minecraft-heads.com/scripts/api.php?cat={cat}'
    sys.stdout.write(f'Fetching {cat}... ')
    sys.stdout.flush()
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        data = json.loads(urllib.request.urlopen(req, timeout=60).read())
    except Exception as e:
        print(f'  ERROR: {e}', flush=True)
        continue

    added = 0
    for entry in data:
        name = entry.get('name', '').strip()
        value = entry.get('value')
        if not name or not value: continue
        h = extract_hash(value)
        if not h or h in seen: continue
        seen.add(h)
        all_heads.append({'n': name, 'h': h, 't': cat})  # short keys = smaller file
        added += 1
    print(f'+{added} (total {len(all_heads)})', flush=True)
    time.sleep(0.5)

out = '/Users/a123/Desktop/MinecraftUIBuilder/public/heads-catalog.json'
with open(out, 'w') as f:
    json.dump(all_heads, f, ensure_ascii=False, separators=(',', ':'))
size_kb = os.path.getsize(out) / 1024
print(f'\nDone. {len(all_heads)} heads, {size_kb:.1f} KB ({size_kb/1024:.2f} MB)')

# Sample
print(f'\nSamples:')
for h in all_heads[:3]:
    print(f'  {h["n"]!r} ({h["t"]}) -> https://mc-heads.net/head/{h["h"]}/64')
