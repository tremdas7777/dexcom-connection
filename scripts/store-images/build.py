"""Gera as fotos da galeria do produto (quadradas, 1200x1200) a partir de HTML, no Chrome headless.

Uso: python3 scripts/store-images/build.py [nome.webp ...]
Saída: src/assets/<nome>.webp. A foto da caixa vem de scripts/store-images/box-hd.png.
"""
import os
import subprocess
import sys
import tempfile

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ASSETS = os.path.join(ROOT, "src", "assets")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BOX = "file://" + os.path.join(HERE, "box-hd.png")

G = "#3FAE49"
GD = "#2E8B3A"
GDEEP = "#1F6B2B"
INK = "#1d2420"
TINT = "#EEF8EF"
S = 1200

BASE = f"""
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:{S}px;height:{S}px;overflow:hidden}}
body{{position:relative;font-family:-apple-system,"Helvetica Neue",Helvetica,Arial,sans-serif;color:{INK};-webkit-font-smoothing:antialiased}}
.g{{color:{G}}}
.chip{{display:inline-flex;align-items:center;gap:14px;background:#fff;border:3px solid #d6ecd8;border-radius:999px;padding:14px 30px;font-weight:800;font-size:38px;color:{GDEEP}}}
.dot{{width:16px;height:16px;border-radius:50%;background:{G}}}
.title{{font-size:96px;font-weight:900;line-height:1;letter-spacing:-3px}}
.sub{{font-size:44px;line-height:1.25;color:#3f4943;margin-top:22px}}
.icon{{width:96px;height:96px;border-radius:26px;background:{TINT};display:flex;align-items:center;justify-content:center}}
.icon svg{{width:54px;height:54px;stroke:{GD};fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}}
.bg{{position:absolute;inset:0;background:radial-gradient(circle at 50% 70%,#ffffff 0,#f6fbf6 45%,{TINT} 100%)}}
"""

ICONS = {
    "cal": '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="M9 15l2 2 4-4"/></svg>',
    "bell": '<svg viewBox="0 0 24 24"><path d="M18 16H6l1.5-2V10a4.5 4.5 0 019 0v4z"/><path d="M10 19a2 2 0 004 0"/></svg>',
    "drop": '<svg viewBox="0 0 24 24"><path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/></svg>',
    "target": '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
    "share": '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
    "bt": '<svg viewBox="0 0 24 24"><path d="M7 7l10 10-5 4V3l5 4L7 17"/></svg>',
    "nofinger": '<svg viewBox="0 0 24 24"><path d="M9 11V5a2 2 0 014 0v6"/><path d="M13 9a2 2 0 014 0v4a6 6 0 01-6 6h-1a5 5 0 01-4-2l-2-3"/><path d="M3 3l18 18"/></svg>',
}


def page(body, bg="#fff"):
    return f'<!doctype html><html><head><meta charset="utf-8"><style>{BASE}body{{background:{bg}}}</style></head><body>{body}</body></html>'


def phone(width, value="112"):
    pts = [140, 150, 165, 180, 172, 160, 148, 130, 118, 110, 106, 112, 120, 128, 124, 116, 110, 112]
    gw, gh = width - 64, int(width * 0.45)
    lo, hi = 40, 300
    y = lambda v: gh - (v - lo) / (hi - lo) * gh
    step = gw / (len(pts) - 1)
    d = f"M0 {y(pts[0]):.1f} " + " ".join(f"L{i * step:.1f} {y(v):.1f}" for i, v in enumerate(pts))
    k = width / 300
    return f"""
<div style="width:{width}px;height:{int(width * 2.05)}px;border-radius:{int(46 * k)}px;background:#111;padding:{int(12 * k)}px;box-shadow:0 50px 90px -35px rgba(0,0,0,.45)">
 <div style="width:100%;height:100%;border-radius:{int(36 * k)}px;background:#fff;padding:{int(52 * k)}px {int(24 * k)}px;position:relative;overflow:hidden">
  <div style="position:absolute;top:{int(14 * k)}px;left:50%;transform:translateX(-50%);width:{int(90 * k)}px;height:{int(24 * k)}px;border-radius:99px;background:#111"></div>
  <div style="font-size:{int(16 * k)}px;font-weight:600;color:#6b746e">Glicose agora</div>
  <div style="display:flex;align-items:center;gap:{int(14 * k)}px;margin-top:{int(14 * k)}px">
    <div style="width:{int(118 * k)}px;height:{int(118 * k)}px;border-radius:50%;border:{int(8 * k)}px solid {G};display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div style="font-size:{int(40 * k)}px;font-weight:800;line-height:1">{value}</div><div style="font-size:{int(13 * k)}px;color:#6b746e">mg/dL</div>
    </div>
    <div style="font-size:{int(44 * k)}px;color:{G};font-weight:800">→</div>
  </div>
  <svg width="{gw}" height="{gh}" style="margin-top:{int(26 * k)}px;overflow:visible">
    <rect x="0" y="{y(180):.1f}" width="{gw}" height="{y(70) - y(180):.1f}" fill="{TINT}"/>
    <path d="{d}" fill="none" stroke="{G}" stroke-width="{4 * k:.1f}" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <div style="margin-top:{int(22 * k)}px;display:grid;grid-template-columns:1fr 1fr;gap:{int(10 * k)}px">
    <div style="background:{TINT};border-radius:{int(14 * k)}px;padding:{int(12 * k)}px"><div style="font-size:{int(12 * k)}px;color:#6b746e">No alvo</div><div style="font-size:{int(22 * k)}px;font-weight:800;color:{GDEEP}">86%</div></div>
    <div style="background:{TINT};border-radius:{int(14 * k)}px;padding:{int(12 * k)}px"><div style="font-size:{int(12 * k)}px;color:#6b746e">Média</div><div style="font-size:{int(22 * k)}px;font-weight:800;color:{GDEEP}">124</div></div>
  </div>
 </div>
</div>"""


def header(eyebrow, title_html, sub=None):
    sub_html = f'<div class="sub">{sub}</div>' if sub else ""
    return f"""<div style="position:absolute;left:80px;top:80px;right:80px;z-index:20">
  <div class="chip"><span class="dot"></span>{eyebrow}</div>
  <div class="title" style="margin-top:34px">{title_html}</div>{sub_html}
</div>"""


# ---------- Fotos dos planos ----------
LAYOUTS = {
    # n: (largura da caixa, [(left, top)] dentro da área das caixas)
    2: (540, [(40, 40), (330, 175)]),
    4: (440, [(20, 0), (440, 0), (130, 220), (550, 220)]),
    6: (330, [(0, 20), (310, 20), (620, 20), (110, 230), (420, 230), (730, 230)]),
}


def plan(n, months, eyebrow):
    bw, pos = LAYOUTS[n]
    boxes = "".join(
        f'<img src="{BOX}" style="position:absolute;left:{x}px;top:{y}px;width:{bw}px;z-index:{i};filter:drop-shadow(0 28px 26px rgba(0,0,0,.16))">'
        for i, (x, y) in enumerate(pos)
    )
    mes = "mês" if months == 1 else "meses"
    return page(f"""
<div class="bg"></div>
{header(eyebrow, f'{months} {mes}<br><span class="g">{n} sensores</span>')}
<div style="position:absolute;left:{80 if n == 6 else 110}px;bottom:70px;width:1040px;height:{760 if n == 2 else 700}px">{boxes}</div>
<div style="position:absolute;right:80px;top:80px;z-index:30;width:230px;height:230px;border-radius:50%;background:{G};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 26px 50px -20px rgba(46,139,58,.8)">
  <div style="font-size:104px;font-weight:900;line-height:.95">{n}x</div><div style="font-size:32px;font-weight:800">sensores</div>
</div>""")


IMAGES = {
    "g7-plan-30": plan(2, 1, "Plano mensal"),
    "g7-plan-60": plan(4, 2, "Mais vendido"),
    "g7-plan-90": plan(6, 3, "Maior economia"),
}

# ---------- Recursos ----------
FEATS = [("cal", "15 dias", "+ 12h de tolerância"), ("nofinger", "Sem picadas", "sem calibração"),
         ("bt", "Sem escanear", "envio automático"), ("bell", "Alertas", "alta e baixa"),
         ("drop", "À prova d'água", "até 2,4 m"), ("share", "Compartilhe", "até 10 pessoas")]
cards = "".join(
    f'''<div style="background:#fff;border:3px solid #e1f0e2;border-radius:30px;padding:26px 26px;display:flex;align-items:center;gap:22px">
<div class="icon" style="flex:0 0 96px">{ICONS[i]}</div>
<div><div style="font-size:42px;font-weight:900;letter-spacing:-1px;line-height:1.05">{t}</div><div style="font-size:32px;color:#4f5953;margin-top:4px">{s}</div></div></div>'''
    for i, t, s in FEATS)
IMAGES["g7-prod-features"] = page(f"""
{header("Por que o Dexcom G7", 'Glicose no celular,<br><span class="g">sem picadas</span>')}
<div style="position:absolute;left:80px;right:80px;bottom:80px;display:grid;grid-template-columns:repeat(2,1fr);gap:26px">{cards}</div>
""", bg=TINT)

# ---------- Relatórios ----------
IMAGES["g7-prod-reports"] = page(f"""
<div class="bg"></div>
{header("App e relatórios", 'Tendências e<br><span class="g">tempo no alvo</span>', "App Dexcom G7 e relatórios do Clarity")}
<div style="position:absolute;left:50%;transform:translateX(-50%);top:530px">{phone(310)}</div>
""")

# ---------- Bluetooth ----------
watch = f"""<div style="width:200px;height:240px;border-radius:54px;background:#111;padding:15px;box-shadow:0 40px 70px -30px rgba(0,0,0,.4)">
<div style="width:100%;height:100%;border-radius:48px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center">
<div style="font-size:64px;font-weight:900">112</div><div style="font-size:24px;color:#6b746e">mg/dL →</div></div></div>"""
IMAGES["g7-prod-bluetooth"] = page(f"""
<div class="bg"></div>
{header("Sem escanear", 'Leituras a cada<br><span class="g">5 minutos</span>', "Direto no celular, no relógio ou no receptor")}
<div style="position:absolute;left:50%;transform:translateX(-50%);top:530px;display:flex;align-items:flex-end;gap:44px">{phone(310)}{watch}</div>
""")

# ---------- Água ----------
IMAGES["g7-prod-water"] = page(f"""
<div style="position:absolute;inset:0;background:linear-gradient(170deg,#eef9fb 0%,#d3eff4 55%,#a9dfe8 100%)"></div>
<svg style="position:absolute;left:0;bottom:0" width="{S}" height="420" viewBox="0 0 {S} 420"><path d="M0 140 C 250 60, 420 220, 650 140 S 1000 70, {S} 130 L {S} 420 L 0 420 Z" fill="#fff" opacity=".45"/><path d="M0 230 C 260 160, 440 300, 680 230 S 1020 170, {S} 220 L {S} 420 L 0 420 Z" fill="#fff" opacity=".6"/></svg>
{header("Resistente à água", 'À prova d&#39;água<br><span class="g">até 2,4 m</span>', "Por até 24 horas: banho, piscina e treino")}
<div style="position:absolute;left:50%;transform:translateX(-50%);top:640px;width:440px;height:440px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 50px 90px -35px rgba(0,80,90,.4)">
  <div style="width:240px;height:240px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fff,#eef0ee 60%,#d9ddda);box-shadow:inset 0 -10px 24px rgba(0,0,0,.08),0 0 0 30px rgba(255,255,255,.75),0 0 0 33px #dfe7e2;display:flex;align-items:center;justify-content:center">
    <div style="width:20px;height:20px;border-radius:50%;background:#9aa39d"></div>
  </div>
</div>
""")


def render(name, html, tmp):
    hp = os.path.join(tmp, name + ".html")
    png = os.path.join(tmp, name + ".png")
    with open(hp, "w") as f:
        f.write(html)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--window-size={S},{S}",
                    "--force-device-scale-factor=1", "--allow-file-access-from-files", f"--screenshot={png}",
                    "file://" + hp], check=True, capture_output=True)
    out = os.path.join(ASSETS, name + ".webp")
    Image.open(png).convert("RGB").save(out, quality=86, method=6)
    return out


if __name__ == "__main__":
    only = {a.removesuffix(".webp") for a in sys.argv[1:]}
    with tempfile.TemporaryDirectory() as tmp:
        for name, html in IMAGES.items():
            if not only or name in only:
                print(render(name, html, tmp))
