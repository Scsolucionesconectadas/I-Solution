# Contexto de i-Solution

02/11/2026, America/Buenos_Aires. Fuente local C:/Proyectos/I-Solution; remoto https://github.com/Scsolucionesconectadas/I-Solution. Proyecto independiente de LMR y del monorepo anterior.

## Objetivo y estado

Instrumentación industrial, información institucional/equipo/servicios y catálogo con fichas/documentos.26 HTML,17 entradas (seis configuraciones y once líneas),23 PDF y un video. Estética vigente conservada.

Demo autorizada: https://isolution-demo.scsolucionesconectadas.com.ar/, pública noindex, transporte de correo vacío. Worker isolution-demo con GitHub main y comandos de check/test/build/deploy; publicación en configuración, registrar evidencia real al cerrar en [[13_Deploy_Infraestructura]].

## Stack y ejecución

Node>=22, Sharp0.35.5, HTML/CSS/JS nativos y JSON. Python solo para autoría PDF, con requisitos fijados; la web se construye desde documentos públicos versionados. Sin backend o administrador.

`npm ci`, `npm run dev`; http://127.0.0.1:4175/instrumental-solution/. Validar `npm run check`, `npm test`, `npm run build:demo`.

No enviar correos o activaciones ni prometer entrega. Fuente institucional info@solution.com.ar conservada; demo sin envío. No publicar presupuestos/procedencia privada. SOLUTION-GROUP queda como archivo interno, no fuente activa de esta web.

[[05_Pendientes]] · [[02_Decisiones_Tecnicas]] · [[06_Comandos_Runbook]] · [[13_Deploy_Infraestructura]].
