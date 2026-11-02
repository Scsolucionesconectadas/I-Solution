"""Render the existing catalogue cover without modifying its PDF.

Development tool: uses the PyMuPDF installation already in .qa/pdf-review.
Run after regenerating the commercial catalogue. No public runtime dependency.
"""
from pathlib import Path
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parent.parent
import pymupdf

source = ROOT / 'apps/instrumental-solution/assets/documents/catalogo-isolution.pdf'
output = ROOT / 'apps/instrumental-solution/assets/derived'
output.mkdir(exist_ok=True)
with pymupdf.open(source) as document:
    document[0].get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), alpha=False).save(output / 'catalogo-portada.png')
(output / 'catalogo-portada.json').write_text(json.dumps({
    'pdfSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'source': source.name,
    'page': 1,
}, indent=2) + '\n', encoding='utf-8')
print('Portada real actualizada; el PDF original permanece intacto.')
