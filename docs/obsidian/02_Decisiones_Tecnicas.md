# Decisiones técnicas

## 2026-11-02 — Repositorio y demo independientes

**Decisión:** i-Solution pasa a C:/Proyectos/I-Solution y su repo, con Worker isolution-demo y publicación de main por Cloudflare. No cambiar la web de LMR.

**Motivo:** solicitud expresa de subir este proyecto a Scsolucionesconectadas/I-Solution; el usuario además aprobó demo pública y conexión automática, sin envío de correo/indexación.

**Impacto:** fonts y logos de agencia propios en assets/fonts y assets/agency. Generadores PDF ya no dependen de apps/lmr ni .qa/pdf-review. Documentos públicos versionados para builds sin Python. Fingerprints/JSON se preservan en Git, y la demo falla si documentos no coinciden con datos/fotos actuales. PDFs nuevos siguen requiriendo autoría y revisión antes de commit.

**Alternativas:** regenerar PDF en cada build (añade entorno/dependencias y posibles cambios involuntarios); seguir dependiendo del monorepo (impide independencia); omitir PDF ignorados (rompe descargas). Se eligió versionar la salida revisada y conservar generadores reproducibles.

**Archivos:** scripts/build-instrumental.mjs, prepare-isolution-demo.mjs, generadores Python, requirements-authoring.txt, .gitattributes y deploy/isolution-demo/wrangler.jsonc.
