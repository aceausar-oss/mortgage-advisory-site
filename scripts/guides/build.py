"""Build the reverse mortgage guide PDFs (English and Spanish) from guide-en.html and guide-es.html.

Output: public/guides/reverse-mortgage-guide.pdf and public/guides/guia-hipoteca-inversa.pdf.
Needs: Python with playwright (Chromium) and segno; fonts in .localfonts/ (Inter 400/600/700, Montserrat 600/700
woff2, e.g. from the @fontsource/inter and @fontsource/montserrat npm packages).
Run from the repo root: python3 scripts/guides/build.py
"""

import pathlib

import segno
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
HERE = ROOT / "scripts" / "guides"
OUT = ROOT / "public" / "guides"
COVERS = ROOT / "public" / "images" / "guides"
COVER = {"reverse-mortgage-guide.pdf": "guide-cover-en.jpg", "guia-hipoteca-inversa.pdf": "guide-cover-es.jpg"}
GUIDES_ALL = [
    ("guide-en.html", "reverse-mortgage-guide.pdf", "https://themortgageadvisory.com/book#reverse"),
    ("guide-es.html", "guia-hipoteca-inversa.pdf", "https://themortgageadvisory.com/es/book#reverse"),
]
GUIDES = [g for g in GUIDES_ALL if (pathlib.Path(__file__).parent / g[0]).exists()]


def qr(url: str) -> str:
    return segno.make(url, error="m").png_data_uri(scale=8, dark="#43565f", border=0)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    COVERS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(device_scale_factor=2)
        for src, dest, url in GUIDES:
            html = (HERE / src).read_text(encoding="utf-8").replace("%%QR%%", qr(url))
            tmp = HERE / f".{src}"
            tmp.write_text(html, encoding="utf-8")
            page.goto(tmp.as_uri())
            page.wait_for_load_state("networkidle")
            page.evaluate("document.fonts.ready")
            page.pdf(path=str(OUT / dest), format="Letter", print_background=True, prefer_css_page_size=True)
            # Cover picture for the website popup and sign-up box: page 1 of the PDF, same layout.
            page.set_viewport_size({"width": 816, "height": 1056})
            page.emulate_media(media="print")
            page.locator(".page").first.screenshot(path=str(HERE / f".{dest}.png"))
            Image.open(HERE / f".{dest}.png").convert("RGB").resize((600, 776), Image.LANCZOS).save(
                COVERS / COVER[dest], "JPEG", quality=86, optimize=True, progressive=True)
            (HERE / f".{dest}.png").unlink()
            tmp.unlink()
            print("built", dest)
        browser.close()


if __name__ == "__main__":
    main()
