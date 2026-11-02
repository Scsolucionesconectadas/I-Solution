# Funcionalidad y calidad hasta el punto 4

Fecha: 02/11/2026, America/Buenos_Aires.

## Alcance vigente

El usuario aprobó avanzar con funcionalidad, contenido, formularios y calidad de las mismas webs. Los puntos 5 (operación) y 6 (dominio/lanzamiento) quedan para después. Implementación local, sin commit/push, publicación o DNS en esta sesión. La demo pública conserva su versión anterior hasta una subida posterior autorizada.

## Cambios implementados

- Búsqueda por varias palabras: radar 80 coincide aunque el nombre incluya palabras intermedias; mantiene filtros y normalización de acentos.
- Cambiar instrumento o motivo en Contacto actualiza el resumen, correo y WhatsApp. La URL conserva solo identificadores comerciales y motivo, nunca datos personales. El motivo explícito se conserva al volver a abrir ese enlace.
- Protección del borrador en memoria mediante beforeunload, sin localStorage/sessionStorage ni persistencia de consultas. El envío fallido conserva campos; la aceptación simulada limpia datos y estado dirty.
- Validación accesible: resumen enfocable con enlaces a campos, mensajes junto al campo y aria-describedby/aria-invalid, manteniendo ayudas existentes. Sin JavaScript permanecen las restricciones HTML nativas.
- Validación del contenido comercial antes de generar fichas: campos necesarios, URLs únicas, imágenes registradas, galería con texto alternativo, tablas coherentes y documentos/videos locales. No agrega modelos o especificaciones.
- Indicadores y miniaturas de galería agrupados semánticamente con role=group.
- Soporte opcional de subtítulos WebVTT por video, con idioma, etiqueta y un único predeterminado. Validación de rutas/idiomas, copia al artefacto y MIME text/vtt en servidor local.

**Archivos:** apps/instrumental-solution/catalogue-model.js, contact-context.js, contact.js, form-validation.js, content-validation.mjs, components.mjs, polish.css; scripts/build-instrumental.mjs y serve.mjs; tests/content-validation.test.mjs, instrumental.test.mjs, instrumental-contact.test.mjs y video-captions.test.mjs.

## Subtítulos preparados, contenido pendiente

La inspección de las pistas del radar-26.mp4 confirma una pista de video y otra de audio (6.925.178 bytes). Todavía no se revisó o transcribió esa pista. Se preparó soporte nativo de subtítulos sin inventar una transcripción o cargar archivos de ejemplo en el catálogo real.

Cuando exista un WebVTT revisado, guardar el archivo en apps/instrumental-solution/assets/video/ y añadir captions al objeto video/videos del producto, por ejemplo:

```json
"captions": [{"file":"radar-es.vtt","language":"es","label":"Español","default":true}]
```

Es una estructura de referencia, no un archivo actualmente cargado. El build valida nombre/idioma, un único predeterminado y encabezado WEBVTT antes de copiar; las fichas generan track kind=captions sin autoplay. Después de cambiar productos, regenerar documentación según el procedimiento habitual de huellas. [Elemento track y WebVTT](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track).

Pendiente: revisar audio, transcribir/traducir si corresponde y aprobar los subtítulos del video original. La presencia de una pista de audio no demuestra por sí sola que tenga narración.

## Validación

- npm run check correcto; 22 pruebas correctas con npm test; npm run build:demo correcto (143 archivos / 24.597.592 bytes).
- Revisión conjunta de 31 páginas en 320, 390, 768 y 1366 px: 124 casos sin desborde, un H1 por página, sin IDs duplicados, imágenes rotas detectadas o errores JavaScript.
- axe-core 4.14.0, solo herramienta QA ignorada, sin dependencia runtime: ninguna infracción automática en las reglas WCAG A/AA ejecutadas sobre las 31 páginas. Fondos con fotografías/gradientes y video requieren comprobaciones manuales; este resultado no acredita por sí solo toda la accesibilidad.
- Formularios de ambas webs revisados localmente con transporte interceptado: campos obligatorios, foco/enlaces del resumen, respuesta 429 conservando texto y aceptación simulada limpiando campos/errores. Cero solicitudes de envío al proveedor o a una casilla real.
- Galería con flechas de teclado y un solo fotograma visible; servicios LMR con Escape y devolución del foco. El aria-controls del servicio apunta al diálogo existente que está cerrado inicialmente.
- Sin JavaScript, 17 entradas del catálogo y diez servicios permanecen visibles a 390 px, sin desborde.
- Respeto a prefers-reduced-motion; cero animaciones activas en la muestra medida. No se descargan PDF/MP4 automáticamente en Inicio o en la ficha de radar revisada; video con preload=none.
- Las medidas de carga son locales/representativas, no estadísticas de usuarios reales o una medición de Core Web Vitals en producción.

## Correo y límites

Destinatario institucional fuente conservado. El artefacto build:demo y la copia local servida para revisar tienen endpoint vacío y botón de envío deshabilitado. El endpoint de QA solo se inyectó en una respuesta HTML interceptada, nunca en archivos fuente o demos públicas. No se enviaron pruebas, correos o activaciones. No afirmar recepción real ni entrega garantizada a Recibidos.

Preparación de transporte y errores verificada con respuestas simuladas; habilitación y prueba real siguen pendientes de autorización. Contrato oficial: [FormSubmit](https://formsubmit.co/documentation). Validación progresiva: [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation).

## Revisión local y continuidad

Abrir http://127.0.0.1:4175/instrumental-solution/. Servidor local iniciado en esta sesión. Para reconstruir manteniendo envíos apagados, ver [[06_Comandos_Runbook]]. npm run dev usa la configuración fuente habitual y puede habilitar su endpoint; no usarlo para revisar sin comprobar el transporte.

Fotos, modelos y documentación original por versión; validación técnica del cliente. Las 17 entradas siguen siendo seis configuraciones y once líneas, no 17 SKU confirmados. No se modificaron los JSON comerciales ni se regeneraron PDF.

No se añadieron dependencias al package/lock, no se desarrolló administrador y no se abordaron los puntos 5/6. Continuidad de diseño: [[10_UI_UX_Diseno]]. Estado y pendientes: [[00_Contexto_Proyecto]] y [[05_Pendientes]].
