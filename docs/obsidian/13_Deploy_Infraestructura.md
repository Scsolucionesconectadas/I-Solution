# Publicación

02/11/2026. Demo autorizada https://isolution-demo.scsolucionesconectadas.com.ar/, Worker isolution-demo; raíz /, auto-trailing-slash y404-page. Zona SC existente; no cambiar raíz, correo ni servidores DNS.

Repositorio https://github.com/Scsolucionesconectadas/I-Solution, main. Integración oficial Cloudflare Workers and Pages limitada a LRM e I-Solution. No se autoriza acceso general a todos los repositorios.

Build `npm run check && npm test && npm run build:demo`; deploy `npx --yes wrangler@4.156.1 deploy --config deploy/isolution-demo/wrangler.jsonc`; raíz /. Node22 en .nvmrc; npm lock reproducible.

Artefacto en .qa/cloudflare/isolution-demo; informe fuera de ese directorio.26 páginas y23 documentos PDF. Cabeceras/meta noindex y robots Disallow: /. El formulario tiene endpoint vacío; la fuente institucional permanece configurada sin probar entrega. No se enviaron correos.

Registrar commit/check/build/dominio y resultados HTTP/responsive después de la primera publicación. La copia aún no se considera publicada por tener una configuración local.
