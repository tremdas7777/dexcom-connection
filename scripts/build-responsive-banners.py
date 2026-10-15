#!/usr/bin/env python3
"""Gera pares mobile (16:9 horizontal) e desktop (21:9) a partir das artes elaboradas."""
from pathlib import Path
from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / "src" / "assets"

MOBILE_SIZE = (1080, 608)  # 16:9 horizontal
DESKTOP_SIZE = (1920, 810)  # ~21:9

SLIDES = [
    ("b01-hero", "banner-pro-hero-box.jpg", "#F4FCE8"),
    ("b02-applicator", "banner-pro-applicator.jpg", "#FFFFFF"),
    ("b03-lifestyle", "banner-pro-lifestyle.jpg", "#F4FCE8"),
    ("b04-app", "banner-pro-app.jpg", "#FFFFFF"),
    ("b05-ip68", "banner-pro-ip68.jpg", "#4D7C0F"),
    ("b06-calibracao", "banner-pro-no-calibration.jpg", "#FFFFFF"),
]

HOME = [
    ("home-ip68", "banner-pro-ip68.jpg", "#4D7C0F"),
    ("home-lifestyle", "banner-pro-lifestyle.jpg", "#F4FCE8"),
    ("home-app", "banner-pro-app.jpg", "#FFFFFF"),
    ("home-family", "banner-pro-family.jpg", "#F4FCE8"),
    ("home-howto", "banner-pro-how-to.jpg", "#EEF6FF"),
]


def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def fit_contain(src: Image.Image, size: tuple[int, int], bg: tuple[int, int, int], pad: int) -> Image.Image:
    canvas = Image.new("RGB", size, bg)
    w, h = size[0] - pad * 2, size[1] - pad * 2
    img = src.copy()
    img.thumbnail((w, h), Image.Resampling.LANCZOS)
    x = (size[0] - img.width) // 2
    y = (size[1] - img.height) // 2
    if img.mode == "RGBA":
        canvas.paste(img, (x, y), img)
    else:
        canvas.paste(img, (x, y))
    return canvas


def build_pair(name: str, source: str, bg_hex: str, pad_mobile: int = 48, pad_desktop: int = 56) -> None:
    src_path = ASSETS / source
    if not src_path.exists():
        print("skip missing", src_path)
        return
    img = Image.open(src_path)
    bg = hex_to_rgb(bg_hex)
    mobile = fit_contain(img, MOBILE_SIZE, bg, pad_mobile)
    desktop = fit_contain(img, DESKTOP_SIZE, bg, pad_desktop)
    mobile.save(ASSETS / f"{name}-mobile.jpg", "JPEG", quality=92, optimize=True)
    desktop.save(ASSETS / f"{name}-desktop.jpg", "JPEG", quality=92, optimize=True)
    print("ok", name)


def main() -> None:
    for name, source, bg in SLIDES:
        build_pair(name, source, bg)
    for name, source, bg in HOME:
        build_pair(name, source, bg)
    # Produto: embalagem e kit (fotos reais + pro)
    if (ASSETS / "aidex-product-box.png").exists():
        img = Image.open(ASSETS / "aidex-product-box.png")
        fit_contain(img, MOBILE_SIZE, hex_to_rgb("#84CC16"), 40).save(
            ASSETS / "p01-box-mobile.jpg", "JPEG", quality=92
        )
        fit_contain(Image.open(ASSETS / "banner-pro-hero-box.jpg"), DESKTOP_SIZE, hex_to_rgb("#F4FCE8"), 56).save(
            ASSETS / "p01-box-desktop.jpg", "JPEG", quality=92
        )
    if (ASSETS / "aidex-applicator.png").exists():
        img = Image.open(ASSETS / "aidex-applicator.png")
        fit_contain(img, MOBILE_SIZE, (255, 255, 255), 48).save(ASSETS / "p02-kit-mobile.jpg", "JPEG", quality=92)
        fit_contain(Image.open(ASSETS / "banner-pro-applicator.jpg"), DESKTOP_SIZE, (255, 255, 255), 56).save(
            ASSETS / "p02-kit-desktop.jpg", "JPEG", quality=92
        )


if __name__ == "__main__":
    main()
