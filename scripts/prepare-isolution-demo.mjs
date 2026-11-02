import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildInstrumental} from './build-instrumental.mjs';

export const root=resolve(import.meta.dirname,'..');
export const demoDirectory=join(root,'.qa/cloudflare/isolution-demo');

export async function prepareIsolutionDemo(){
  const report=await buildInstrumental({outDir:demoDirectory,sitePath:'/',contactEndpoint:'',requireDocuments:true});
  await writeFile(join(demoDirectory,'_headers'),`/*
  X-Robots-Tag: noindex, nofollow, noarchive
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Cache-Control: no-cache
`);
  await writeFile(join(demoDirectory,'404.html'),`<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Página no encontrada · i-Solution</title><link rel="stylesheet" href="/assets/site.css"></head><body><main class="container" style="padding-block:5rem"><a href="/"><img src="/assets/logo.webp" width="200" alt="i-Solution"></a><h1 style="margin-top:2rem">No encontramos esta página.</h1><p>Podés volver al inicio o explorar nuestros instrumentos.</p><a class="button" href="/productos/">Explorar instrumentos</a></main></body></html>`);
  const inventory=[];
  async function inspect(dir){for(const file of await readdir(dir,{withFileTypes:true})){const path=join(dir,file.name);if(file.isDirectory())await inspect(path);else inventory.push({path:relative(demoDirectory,path).replaceAll('\\','/'),bytes:(await readFile(path)).length});}}
  await inspect(demoDirectory);
  if(inventory.length>20000||inventory.some(file=>file.bytes>25*1024*1024))throw new Error('El artefacto excede los límites de Static Assets.');
  const summary={...report,files:inventory.length,bytes:inventory.reduce((sum,file)=>sum+file.bytes,0),inventory};
  await writeFile(join(root,'.qa/cloudflare/isolution-demo-report.json'),JSON.stringify(summary,null,2)+'\n');
  return {...summary,inventory:undefined};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await prepareIsolutionDemo(),null,2));
