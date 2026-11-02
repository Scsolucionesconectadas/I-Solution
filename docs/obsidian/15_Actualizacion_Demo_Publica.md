# Actualización de la demo pública verificada

Fecha: 02/11/2026, America/Buenos_Aires.

## Alcance autorizado

El usuario pidió publicar las mejoras locales de [[14_Funcionalidad_y_Calidad]] en las demos existentes. Se realizó commit/push al repositorio propio y Cloudflare actualizó el sitio mediante la conexión automática de main. No se activó correo, indexación, cambio de plan o dominio definitivo.

URL: https://isolution-demo.scsolucionesconectadas.com.ar/

## Publicación comprobada

- Commit funcional: dbd21f0e34e761a07f3520b13bf9f5ae41ff638c.
- Check de Cloudflare: completed / success.
- Build: 7e5df2c2-e4e8-4a4c-b886-c6ee5f8a9659.
- Validación previa: check, 22 pruebas y build:demo correctos. El hook obligatorio de pre-push también pasó pruebas y build.
- Recursos públicos verificados: 142, todos HTTP 200/noindex y comparados contra el artefacto. Los 23 PDF de i-Solution se conservaron por SHA-256.
- Textos comparados normalizando CRLF/LF. Cloudflare añade su beacon Analytics a los HTML y contenido administrado a robots.txt; se confirmó esa diferencia concreta sin cambiar el servicio. La comparación excluye solo esa inyección conocida.
- 31 páginas conjuntas en 390/1366 px: 62 casos públicos sin desbordes, imágenes rotas detectadas, H1 faltantes/duplicados o errores JavaScript.
- Búsqueda radar 80 y cambio de instrumento comprobados en i-Solution publicado. Validación nueva cargada y botón de envío deshabilitado en ambos sitios; endpoints vacíos.
- 404 propias y rutas de fuentes/docs/entorno no expuestas. Un agente personalizado recibió 403 en rutas inexistentes; con navegador y User-Agent normal se confirmó HTTP 404. No se modificó la protección de Cloudflare.

## Documentación de cierre

Un commit solo documental posterior a dbd21f0 registra las comprobaciones, sin cambiar el contenido funcional. La evidencia del último check y sincronización se conserva en la nota interna70_Publicacion_Mejoras_Demos de Solution Group.

## Límites conservados

Demos noindex/nofollow/noarchive, 404 propia y formulario sin transporte. Cero envíos o activaciones. QA, consultas, transcripciones ficticias, presupuestos y material pendiente de permiso quedan excluidos. El destinatario institucional fuente se conserva; recepción real pendiente.

Material/fotos/validación técnica y subtítulos revisados del video original siguen pendientes. Los puntos5/6 permanecen aplazados; esta tarea utilizó el flujo de publicación existente.
