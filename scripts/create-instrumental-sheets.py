"""Generate downloadable product sheets from the same JSON as the static website.

Uses the existing development-only PDF environment; no website dependency.
"""
from pathlib import Path
import sys, json, hashlib, shutil
from html import escape

ROOT=Path(__file__).resolve().parent.parent
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from fontTools.ttLib import TTFont as SourceFont
from PIL import Image as SourceImage

CONTENT=ROOT/'content/instrumental-solution'
ASSETS=ROOT/'apps/instrumental-solution/assets'
OUT=ROOT/'output/pdf/fichas'; OUT.mkdir(parents=True,exist_ok=True)
FONT_DIR=ROOT/'.qa/isolution-55/fonts'; FONT_DIR.mkdir(parents=True,exist_ok=True)
for name in ['Regular','SemiBold']:
    target=FONT_DIR/f'Poppins-{name}.ttf'
    font=SourceFont(ROOT/f'apps/instrumental-solution/assets/fonts/Poppins-{name}.woff2');font.flavor=None;font.save(target)
    pdfmetrics.registerFont(TTFont(name,str(target)))

products=json.loads((CONTENT/'productos.json').read_text(encoding='utf-8'))
registry=json.loads((CONTENT/'imagenes.json').read_text(encoding='utf-8'))
site=json.loads((CONTENT/'site.json').read_text(encoding='utf-8'))
INK,BLUE,NAVY,MUTED,LINE=[colors.HexColor(v) for v in ['#0c1f36','#245e9a','#102b47','#50657c','#d2e0ec']]
styles={
 'title':ParagraphStyle('title',fontName='SemiBold',fontSize=22,leading=28,textColor=INK,spaceAfter=10),
 'series':ParagraphStyle('series',fontName='SemiBold',fontSize=11,leading=16,textColor=BLUE,spaceAfter=12),
 'body':ParagraphStyle('body',fontName='Regular',fontSize=9.3,leading=14.5,textColor=MUTED,spaceAfter=6),
 'heading':ParagraphStyle('heading',fontName='SemiBold',fontSize=13,leading=18,textColor=INK,spaceBefore=15,spaceAfter=10,keepWithNext=True),
 'key':ParagraphStyle('key',fontName='SemiBold',fontSize=9,leading=14,textColor=INK),
 'value':ParagraphStyle('value',fontName='Regular',fontSize=9,leading=14,textColor=MUTED),
 'note':ParagraphStyle('note',fontName='Regular',fontSize=8,leading=12,textColor=MUTED,spaceBefore=12,spaceAfter=8),
}
def P(value,style='body'):
    clean=str(value).replace('\u2013','-').replace('\u2014','-').replace('\u2212','-')
    return Paragraph(escape(clean),styles[style])

def page_frame(canvas,doc):
    w,h=A4;canvas.saveState()
    canvas.setFillColor(NAVY);canvas.rect(0,h-68,w,68,stroke=0,fill=1)
    canvas.drawImage(str(ASSETS/'source/logo.png'),42,h-55,width=156,height=44,preserveAspectRatio=True,mask='auto')
    canvas.setFillColor(colors.HexColor('#d4e5f3'));canvas.setFont('Regular',8)
    canvas.drawRightString(w-42,h-36,('Ficha de línea' if getattr(doc,'is_line',False) else 'Ficha de producto')+' | i-Solution')
    canvas.setStrokeColor(LINE);canvas.line(42,46,w-42,46)
    canvas.setFillColor(MUTED);canvas.setFont('Regular',7.5)
    canvas.drawString(42,30,f"{site['email']} | {site['phone']}")
    canvas.drawRightString(w-42,30,f'{doc.page}')
    canvas.restoreState()

metadata={}
for product in products:
    name=f"ficha-{product['slug']}.pdf"; target=OUT/name
    doc=SimpleDocTemplate(str(target),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=82,bottomMargin=60,
                          title=f"{product['name']} - {product['series']} | i-Solution",author='i-Solution')
    doc.is_line=product.get('kind')=='line'
    imagepath=ASSETS/'source'/registry[product['image']]
    with SourceImage.open(imagepath) as image: iw,ih=image.size
    scale=min(110/iw,110/ih)
    picture=Image(str(imagepath),width=iw*scale,height=ih*scale)
    intro=[P(product['name'],'title'),P(product['series'],'series'),P(product['summary'])]
    hero=Table([[intro,picture]],colWidths=[345,166])
    hero.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(0,0),22),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
    story=[hero,P('Tecnologías y opciones de la línea' if doc.is_line else 'Características técnicas','heading')]
    rows=[[P(k.replace(' publicada',''),'key'),P(v,'value')] for k,v in product['parameters']]
    specs=Table(rows,colWidths=[165,346],hAlign='LEFT')
    specs.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.4,LINE),('BACKGROUND',(0,0),(0,-1),colors.HexColor('#f0f6fa')),('LEFTPADDING',(0,0),(-1,-1),11),('RIGHTPADDING',(0,0),(-1,-1),11),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story+=[specs,P(product['selectionNote'],'note')]
    if product.get('applications'):
        story.append(P('Aplicaciones de la línea' if doc.is_line else 'Aplicaciones del instrumento','heading'))
        for text in product['applications']:story.append(P('- '+text))
    if product.get('source'):
        story.append(Paragraph('Más información: <link href="'+escape(product['source'],quote=True)+'" color="#245e9a">página del producto en i-Solution</link>',styles['note']))
    doc.build(story,onFirstPage=page_frame,onLaterPages=page_frame)
    if doc.page!=1:raise ValueError(f'La ficha requiere una revisión de diseño: {product["slug"]} ocupa {doc.page} páginas.')
    shutil.copyfile(target,ASSETS/'documents'/name)
    metadata[product['slug']]={'file':name,'pdfSha256':hashlib.sha256(target.read_bytes()).hexdigest()}

fingerprint=hashlib.sha256()
for filename in ['site.json','productos.json','imagenes.json']:fingerprint.update((CONTENT/filename).read_bytes())
for p in products:fingerprint.update((ASSETS/'source'/registry[p['image']]).read_bytes())
(CONTENT/'fichas-pdf.json').write_text(json.dumps({'contentSha256':fingerprint.hexdigest(),'products':metadata,'generator':'scripts/create-instrumental-sheets.py'},indent=2)+'\n',encoding='utf-8')
print(json.dumps({'fichas':len(metadata),'output':str(OUT)}))
