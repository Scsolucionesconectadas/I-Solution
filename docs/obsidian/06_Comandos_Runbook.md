# Comandos

Desde C:/Proyectos/I-Solution: `npm ci`, `npm run dev`; puerto4175.

Antes de subir: `npm run check`, `npm test`, `npm run build:demo`, `git diff` y revisión de documentos. Commit convencional y `git push origin main` solo cuando esté autorizado. Comprobar check Workers Builds: isolution-demo y URL pública; no force-push.

Para PDFs usar los comandos de venv/requirements del README. Actualizar datos/fotos, generar fichas, catálogo y portada en ese orden. Los23 documentos actuales están versionados; no se depende de archivos ignorados de otra máquina. No alterar marcas/modelos/rangos por inferencia.

Git tiene helper local con configuración aislada de la cuenta autorizada fuera del repo; no cambiar la cuenta global de otros proyectos ni guardar tokens en Git. Cloudflare gestiona su credencial de build.

Rollback: restaurar una versión válida en Cloudflare y conciliar mediante commit de reversión antes del siguiente push. El dominio definitivo/SEO/correo siguen siendo otra etapa autorizada.
