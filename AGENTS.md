# i-Solution: repositorio independiente

- Fuente local: C:/Proyectos/I-Solution. Remoto autorizado: https://github.com/Scsolucionesconectadas/I-Solution. No modificar LMR, ERP o archivos Python ajenos.
- Leer docs/obsidian/00_Contexto_Proyecto.md y 05_Pendientes.md. Actualizar notas relevantes con cada cambio.
- apps/instrumental-solution y content/instrumental-solution contienen solo este sitio; fuentes/logos de agencia fueron independizados. shared/html.mjs es propio de este repo.
- Repo público: no agregar presupuestos, .env, credenciales, consultas, adjuntos privados o procedencia interna que no sea publicable. Todos los23 PDF versionados son documentos públicos que ya se ofrecen en las fichas.
- Demo autorizada: isolution-demo.scsolucionesconectadas.com.ar, Cloudflare Worker isolution-demo, configuración deploy/isolution-demo/wrangler.jsonc. Mantener noindex y transporte vacío en build:demo; nunca enviar pruebas o activaciones al cliente.
- Destino institucional fuente info@solution.com.ar no implica recepción validada. No prometer Recibidos, no cambiar a un destinatario de LMR y no habilitar envío/indexación por una demo.
- El catálogo tiene17 entradas: seis configuraciones y once líneas, no inventar SKU o extender especificaciones de un modelo a una familia. Contacto y navegación se generan desde la misma fuente.
- JSON comercial y PDF preservan bytes mediante .gitattributes; fingerprints detectan documentos obsoletos. Tras cambios de datos/fotos, regenerar fichas/catálogo/portada y revisar. build:demo falla si la documentación está desactualizada.
- npm run check, npm test y npm run build:demo antes de commit/push autorizado. Verificar check remoto y URL después. No force-push ni credenciales en el repo. Git usa helper local con sesión aislada de la cuenta autorizada, sin cambiar credenciales globales.
- SOLUTION-GROUP conserva archivo/planning y procedencia interna. No editar su copia histórica como fuente activa ni mantener sincronización bidireccional silenciosa.
