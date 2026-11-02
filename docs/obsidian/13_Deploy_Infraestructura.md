# Publicación

## 02/11/2026 — Mejoras publicadas y verificadas

Commitdbd21f0, check Cloudflare completed/success, build7e5df2c2-e4e8-4a4c-b886-c6ee5f8a9659. 142 recursos públicos correctos y revisión conjunta de62 casos responsive. Evidencia en [[15_Actualizacion_Demo_Publica]]. Transporte vacío/noindex conservados; sin correos/activaciones o cambios de DNS/plan/dominio final. Documentación de cierre sincronizada mediante un commit posterior sin cambios funcionales.

## 02/11/2026 — Actualización de mejoras autorizada

Publicar [[14_Funcionalidad_y_Calidad]] mediante el flujo main → isolution-demo. Ver [[15_Actualizacion_Demo_Publica]] para el resultado vigente. Conservar endpoint vacío/noindex; no modificar dominios finales o servicio de correo.

02/11/2026. Demo autorizada https://isolution-demo.scsolucionesconectadas.com.ar/, Worker isolution-demo; raíz /, auto-trailing-slash y404-page. Zona SC existente; no cambiar raíz, correo ni servidores DNS.

Repositorio https://github.com/Scsolucionesconectadas/I-Solution, main. Integración oficial Cloudflare Workers and Pages limitada a LRM e I-Solution. No se autoriza acceso general a todos los repositorios.

Build `npm run check && npm test && npm run build:demo`; deploy `npx --yes wrangler@4.156.1 deploy --config deploy/isolution-demo/wrangler.jsonc`; raíz /. Node22 en .nvmrc; npm lock reproducible.

Artefacto en .qa/cloudflare/isolution-demo; informe fuera de ese directorio.26 páginas y23 documentos PDF. Cabeceras/meta noindex y robots Disallow: /. El formulario tiene endpoint vacío; la fuente institucional permanece configurada sin probar entrega. No se enviaron correos.

Publicación efectiva: commit1c543e2788184369d7f278370def1114c0ff018e, build7f21997f-2733-4646-b066-253e4651f678, versión195e170f-fd6d-49d8-8857-b8bd957c32ea. Logs de Cloudflare: Node22.23.4,16 pruebas correctas, build de26 páginas/142 archivos/24.589.470 bytes en Linux, deploy correcto y dominio personalizado creado automáticamente por Wrangler. Credencial propia Workers Builds - isolution-demo gestionada en Cloudflare, sin valor en Git.

Verificación pública:141 recursos200 con noindex,23 PDF intactos,404 correcta para rutas inexistentes y archivos internos.18 casos de nueve páginas en390/1365px sin overflow, imágenes rotas o errores JavaScript; formulario disabled. Se comparan finales de línea normalizados para texto y huellas binarias para documentos/imágenes. Cloudflare añade contenido administrado a robots.txt, conservando Disallow: /.

Las notas finales y validación completa por slug se suben en un segundo push para verificar el disparador automático desde GitHub. No se enviaron consultas o activaciones; el dominio del cliente no se modificó.
