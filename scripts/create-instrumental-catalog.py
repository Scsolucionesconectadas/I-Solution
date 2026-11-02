"""Create the commercial catalogue from the same reviewed JSON as the website.

Requires reportlab 4.x, fontTools/brotli and Pillow. Development-only dependencies
may live in .qa/pdf-review; none is loaded by the public website or Node build.
"""
from pathlib import Path
import sys
import json
import hashlib
import shutil
from io import BytesIO
from html import escape

ROOT = Path(__file__).resolve().parent.parent
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from fontTools.ttLib import TTFont as SourceFont
from PIL import Image

CONTENT = ROOT / 'content/instrumental-solution'
SOURCE = ROOT / 'apps/instrumental-solution/assets/source'
OUTPUT = ROOT / 'output/pdf/catalogo-isolution.pdf'
WEB = ROOT / 'apps/instrumental-solution/assets/documents/catalogo-isolution.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
FONT_DIR = ROOT / '.qa/isolution-53/fonts'
FONT_DIR.mkdir(parents=True, exist_ok=True)
for name, filename in [('Regular', 'Poppins-Regular'), ('SemiBold', 'Poppins-SemiBold')]:
    target = FONT_DIR / f'{filename}.ttf'
    font = SourceFont(ROOT / 'apps/instrumental-solution/assets/fonts' / f'{filename}.woff2')
    font.flavor = None
    font.save(target)
    pdfmetrics.registerFont(TTFont(name, str(target)))

products = json.loads((CONTENT / 'productos.json').read_text(encoding='utf-8'))
site = json.loads((CONTENT / 'site.json').read_text(encoding='utf-8'))
institution = json.loads((CONTENT / 'institucional.json').read_text(encoding='utf-8'))
images = json.loads((CONTENT / 'imagenes.json').read_text(encoding='utf-8'))
copy = json.loads((CONTENT / 'textos.json').read_text(encoding='utf-8'))
W, H = A4
M = 43
INK, BLUE, NAVY = [HexColor(x) for x in ['#0c1f36', '#245e9a', '#102b47']]
MUTED, LINE, SURFACE = [HexColor(x) for x in ['#50657c', '#d2e0ec', '#eef5fa']]
c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
c.setTitle('i-Solution - Instrumentación industrial y servicios')
c.setAuthor('i-Solution')
c.setSubject('Catálogo de instrumentos y servicios técnicos')


def text(value, x, top, width, size=10.4, color=MUTED, bold=False, leading=None):
    value = escape(str(value)).replace('\u2013', '-').replace('\u2014', '-').replace('\u2212', '-')
    style = ParagraphStyle('copy', fontName='SemiBold' if bold else 'Regular', fontSize=size,
                           leading=leading or size * 1.5, textColor=color, spaceAfter=0)
    paragraph = Paragraph(value, style)
    _, height = paragraph.wrap(width, 2000)
    paragraph.drawOn(c, x, top - height)
    return top - height


def image(path, x, y, width, height):
    with Image.open(path) as im:
        iw, ih = im.size
        if 'transparency' in im.info:im=im.convert('RGBA')
        im.thumbnail((round(width*2.5),round(height*2.5)))
        data=BytesIO()
        if im.mode in ('RGBA','LA'):
            im.save(data,format='PNG')
        else:
            im.convert('RGB').save(data,format='JPEG',quality=90,optimize=True)
        data.seek(0)
        prepared=ImageReader(data)
    scale = min(width / iw, height / ih)
    width2, height2 = iw * scale, ih * scale
    c.drawImage(prepared, x + (width - width2) / 2, y + (height - height2) / 2,
                width=width2, height=height2, mask='auto')


def footer(number, dark=False):
    color = HexColor('#c8ddea') if dark else MUTED
    c.setStrokeColor(HexColor('#45657e') if dark else LINE)
    c.line(M, 48, W - M, 48)
    text('i-Solution | Instrumentación y control de procesos', M, 36, W - 2*M - 35, 8, color)
    text(str(number), W - M - 12, 36, 20, 8, color)


def header(title, subtitle, number):
    c.setFillColor(NAVY)
    c.rect(0, H - 76, W, 76, fill=1, stroke=0)
    image(SOURCE / 'logo.png', M, H - 64, 170, 46)
    text('Catálogo de instrumentación', W - M - 200, H - 30, 200, 9, HexColor('#c8ddea'))
    text(title, M, H - 108, W - 2*M, 27, INK, True)
    text(subtitle, M, H - 154, W - 2*M, 10.5)
    footer(number)


# Cover: actual instruments, with balanced space and original company mark.
c.setFillColor(NAVY)
c.rect(0, 0, W, H, fill=1, stroke=0)
image(SOURCE / 'logo.png', M, H - 110, 240, 66)
text('Instrumentación', M, H - 158, W - 2*M, 36, white, True)
text('industrial.', M, H - 211, W - 2*M, 36, HexColor('#b6dcf5'), True)
text('Equipos de medición, documentación y servicios para tus procesos.', M, H - 278,
     W - 2*M - 40, 13, HexColor('#c8ddea'))
cell_w = (W - 2*M - 24) / 3
cover_slugs=['caudalimetros-electromagneticos','radar-nivel-80-120-ghz','transmisor-presion-smart','analizadores-liquidos','analizadores-cloro-libre','programador-siemens']
cover_products=[next(p for p in products if p['slug']==slug) for slug in cover_slugs]
for i, product in enumerate(cover_products):
    col, row = i % 3, i // 3
    x, y = M + col * (cell_w + 12), 292 - row * 176
    c.setFillColor(white)
    c.roundRect(x, y, cell_w, 161, 8, fill=1, stroke=0)
    image(SOURCE / images[product['image']], x + 13, y + 42, cell_w - 26, 102)
    label = product['name'].replace(' electromagnético', '').replace(' Smart', '')
    text(label, x + 12, y + 36, cell_w - 24, 9.2, INK, True, 12)
text('Caudal | Nivel | Presión | Análisis | Configuración', M, 91, W - 2*M, 10.5, HexColor('#c8ddea'))
footer(1, dark=True)
c.showPage()


def product_block(product, top, height=262):
    bottom = top - height
    c.setStrokeColor(LINE)
    c.setFillColor(white)
    c.roundRect(M, bottom, W - 2*M, height, 8, fill=1, stroke=1)
    image(SOURCE / images[product['image']], M + 12, top - 204, 142, 174)
    text(product['brand'] or product['family'], M + 16, bottom + 36, 140, 9, BLUE, True)
    x, width = M + 175, W - 2*M - 193
    y = text(product['name'], x, top - 18, width, 15.5, INK, True, 20)
    y = text(('Línea de productos' if product.get('kind')=='line' else product['series']), x, y - 5, width, 10, BLUE, True) - 12
    y = text(product['summary'], x, y, width, 9.3, MUTED, leading=13.5) - 12
    specs = [row for row in product['parameters'] if row[0]!='Variable'][:3]
    for key, value in specs:
        label = key.replace(' publicada', '')
        y = text(f'{label}: {value}', x, y, width, 8.8, MUTED, leading=12) - 5
    if y < bottom + 16:
        raise ValueError(f'Product block overflows: {product["slug"]}')


family_copy={
    'Caudal':('Medición de caudal.','Líquidos y gases: tecnologías, conexiones y condiciones según aplicación.'),
    'Nivel':('Medición y detección de nivel.','Medición continua o puntual; tecnologías seleccionadas para cada medio.'),
    'Presión':('Medición de presión.','Transmisores inteligentes y configuraciones para sistemas de control.'),
    'Análisis de líquidos':('Análisis de líquidos.','Sensores, transmisores y análisis de cloro para procesos y agua.'),
    'Configuración':('Configuración de instrumentos.','Herramientas para equipos compatibles y asistencia para la selección.'),
}
unknown_families={p['family'] for p in products}-set(family_copy)
if unknown_families:raise ValueError(f'Agregar al diseño del catálogo las familias: {sorted(unknown_families)}')
number=2
for family,(title,subtitle) in family_copy.items():
    entries=[p for p in products if p['family']==family]
    for offset in range(0,len(entries),2):
        pair=entries[offset:offset+2]
        header(title,subtitle,number)
        if len(pair)==2:
            product_block(pair[0], H-194)
            product_block(pair[1], H-478)
        else:
            product_block(pair[0], H-194,height=300)
            text('Seleccionemos el equipo para tu proceso.',M,298,W-2*M,17,INK,True)
            text('Indicá la variable, el medio, el rango y las condiciones de montaje. Consultanos por el modelo, su documentación y la configuración adecuada.',M,263,W-2*M,11)
        text('Las fichas de línea presentan opciones de selección. Los alcances, materiales y recursos se confirman por modelo y aplicación.',M,86,W-2*M,8.5,MUTED,leading=12)
        c.showPage()
        number+=1

header('Servicios para tus instrumentos.', 'Calibración, mantenimiento, asistencia técnica y automatización industrial.', number)
y = H - 198
for service in institution['services']:
    image(SOURCE / copy['images'].get('servicio-'+service['id'], images[service['image']]), M, y - 53, 53, 53)
    text(service['name'], M + 72, y, W - 2*M - 72, 12, INK, True)
    text(service['summary'], M + 72, y - 23, W - 2*M - 72, 9.3, MUTED, leading=13)
    c.setStrokeColor(LINE)
    c.line(M, y - 68, W - M, y - 68)
    y -= 86
c.setFillColor(SURFACE)
c.roundRect(M, 77, W - 2*M, 109, 8, fill=1, stroke=0)
text('Conversemos sobre tu aplicación.', M + 20, 168, W - 2*M - 40, 17, INK, True)
text(site['email'] + ' | ' + site['phone'], M + 20, 133, W - 2*M - 40, 10.5, BLUE)
text(site['address'], M + 20, 110, W - 2*M - 40, 9.2, MUTED)
c.linkURL('mailto:' + site['email'], (M+20, 117, M+240, 138), relative=0)
c.linkURL('https://wa.me/' + site['whatsapp'], (M+240, 117, W-M-20, 138), relative=0)
c.save()
shutil.copyfile(OUTPUT, WEB)

# Fingerprint prevents serving an outdated commercial PDF after content changes.
digest = hashlib.sha256()
for filename in ['site.json', 'productos.json', 'institucional.json', 'imagenes.json']:
    digest.update((CONTENT / filename).read_bytes())
for product in products:
    digest.update((SOURCE / images[product['image']]).read_bytes())
for service in institution['services']:
    digest.update((SOURCE / copy['images'].get('servicio-'+service['id'], images[service['image']])).read_bytes())
metadata = {'contentSha256': digest.hexdigest(), 'pdfSha256': hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),
            'pages': number, 'entries': len(products), 'lines': sum(p.get('kind')=='line' for p in products), 'date': '2026-11-01', 'generator': 'scripts/create-instrumental-catalog.py'}
(CONTENT / 'catalogo-pdf.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'output': str(OUTPUT), 'bytes': OUTPUT.stat().st_size, **metadata}))
