# i-Solution · Instrumentación industrial

Sitio institucional y catálogo: **26 páginas, 17 entradas y23 documentos PDF**, incluidos catálogo, resúmenes técnicos y manuales originales disponibles. Las líneas sin modelo confirmado no son SKU.

- Repositorio: https://github.com/Scsolucionesconectadas/I-Solution
- Fuente local: `C:\Proyectos\I-Solution`
- Demo pública: https://isolution-demo.scsolucionesconectadas.com.ar/
- Cloudflare Workers Static Assets, Worker `isolution-demo`, separado de LMR.

## Desarrollo

Node.js22 o superior:

```powershell
npm ci
npm run dev
```

Abrir http://127.0.0.1:4175/instrumental-solution/.

```powershell
npm run check
npm test
npm run build:demo
```

El artefacto publicable está en `.qa/cloudflare/isolution-demo`, con rutas desde `/`, cabeceras noindex y404. La demo pública conserva el formulario visual con envío desactivado. No se envían pruebas ni activaciones. Noindex no hace privado el enlace.

## Publicación automática

Integración oficial GitHub → Cloudflare Builds, rama `main`, raíz `/`.

- Build: `npm run check && npm test && npm run build:demo`.
- Deploy: `npx --yes wrangler@4.156.1 deploy --config deploy/isolution-demo/wrangler.jsonc`.

Editar → validar → commit → push → comprobar build y web. Guardar en la PC no publica por sí solo. No se guardan tokens en este repositorio; Cloudflare gestiona la credencial de la integración.

## Actualizar el catálogo y sus documentos

Los JSON en `content/instrumental-solution/` alimentan catálogo, fichas, selector de consultas y metadatos. PDF públicos en `apps/instrumental-solution/assets/documents/`; fotos, video y portadas en sus directorios hermanos. Fuentes y logos de agencia propios: no requiere carpetas de LMR.

Los documentos actuales se versionan y no necesitan Python para construir la web. Para cambiar datos/fotos y regenerar PDF, usar un entorno de autoría separado:

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements-authoring.txt
.venv\Scripts\python scripts/create-instrumental-sheets.py
.venv\Scripts\python scripts/create-instrumental-catalog.py
.venv\Scripts\python scripts/render-instrumental-cover.py
npm run build:demo
```

Revisar visualmente los PDF generados y versionarlos junto con sus manifests. `.gitattributes` conserva los bytes de los JSON comerciales para que sus huellas coincidan también en Linux. El build de demo rechaza documentación obsoleta, evitando una publicación con descargas omitidas.

El administrador aún no está desarrollado. No cargar secretos o datos internos en archivos que se publican.
