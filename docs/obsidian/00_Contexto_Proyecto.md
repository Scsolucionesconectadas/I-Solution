# Contexto de i-Solution

## 02/11/2026 — Actualización pública autorizada

El usuario solicitó publicar las mejoras locales. [[15_Actualizacion_Demo_Publica]] registra alcance y verificación de esta publicación; tiene prioridad sobre el estado local histórico de [[14_Funcionalidad_y_Calidad]]. Correo apagado y noindex conservados; dominio final/operación ampliada pendientes.

## 02/11/2026 — Funcionalidad y calidad locales

[[14_Funcionalidad_y_Calidad]] registra las correcciones y la revisión aprobada hasta el punto 4. 22 pruebas/check/build:demo correctos; auditoría conjunta de 31 páginas/124 casos responsive. Cambios locales sin commit/push: demo pública aún conserva su versión anterior. Copia local servida en http://127.0.0.1:4175/instrumental-solution/ sin envío. Puntos 5 (operación) y 6 (dominio) diferidos. Material del cliente y activación/prueba real de correo pendientes, sin envíos. [[10_UI_UX_Diseno]].

02/11/2026, America/Buenos_Aires. Fuente local C:/Proyectos/I-Solution; remoto https://github.com/Scsolucionesconectadas/I-Solution. Proyecto independiente de LMR y del monorepo anterior.

## Objetivo y estado

Instrumentación industrial, información institucional/equipo/servicios y catálogo con fichas/documentos.26 HTML,17 entradas (seis configuraciones y once líneas),23 PDF y un video. Estética vigente conservada.

Demo publicada: https://isolution-demo.scsolucionesconectadas.com.ar/, pública noindex, transporte de correo vacío. Worker isolution-demo con GitHub main y comandos de check/test/build/deploy; commit1c543e2, build7f21997f correcto y versión195e170f lista. Ver [[13_Deploy_Infraestructura]].141 recursos y23 PDF correctos;18 casos responsive sin desbordes, imágenes rotas o errores JavaScript.

## Stack y ejecución

Node>=22, Sharp0.35.5, HTML/CSS/JS nativos y JSON. Python solo para autoría PDF, con requisitos fijados; la web se construye desde documentos públicos versionados. Sin backend o administrador.

`npm ci`, `npm run dev`; http://127.0.0.1:4175/instrumental-solution/. Validar `npm run check`, `npm test`, `npm run build:demo`.

No enviar correos o activaciones ni prometer entrega. Fuente institucional info@solution.com.ar conservada; demo sin envío. No publicar presupuestos/procedencia privada. SOLUTION-GROUP queda como archivo interno, no fuente activa de esta web.

[[05_Pendientes]] · [[02_Decisiones_Tecnicas]] · [[06_Comandos_Runbook]] · [[13_Deploy_Infraestructura]].
