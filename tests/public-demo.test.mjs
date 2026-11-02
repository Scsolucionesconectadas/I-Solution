import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {join} from 'node:path';
import {prepareIsolutionDemo,demoDirectory,root} from '../scripts/prepare-isolution-demo.mjs';
import {buildInstrumental} from '../scripts/build-instrumental.mjs';

test('demo pública raíz con catálogo y manuales completos, sin transporte de correo',async()=>{
  const report=await prepareIsolutionDemo();
  assert.equal(report.pages,26);assert.equal(report.basePath,'/');
  const manifest=JSON.parse(await readFile(join(root,'.qa/cloudflare/isolution-demo-report.json'),'utf8'));
  assert.equal(manifest.inventory.filter(file=>file.path.endsWith('.pdf')).length,23);
  assert.ok(manifest.inventory.some(file=>file.path==='assets/documentos/catalogo-isolution.pdf'));
  for(const file of manifest.inventory.filter(file=>file.path.endsWith('/index.html')||file.path==='index.html')){
    const html=await readFile(join(demoDirectory,file.path),'utf8');
    assert.match(html,/name="robots" content="noindex, nofollow"/);
    assert.doesNotMatch(html,/formsubmit\.co\/ajax|href="\/instrumental-solution\/|src="\/instrumental-solution\//);
    for(const link of html.matchAll(/(?:href|src)="([^"]+)"/g)){
      const url=new URL(link[1].replaceAll('&amp;','&'),'https://example.invalid/'+file.path);
      if(url.origin!=='https://example.invalid')continue;
      await access(join(demoDirectory,decodeURIComponent(url.pathname),url.pathname.endsWith('/')?'index.html':''));
    }
  }
  assert.match(await readFile(join(demoDirectory,'contacto/index.html'),'utf8'),/data-endpoint=""/);
  assert.match(await readFile(join(demoDirectory,'_headers'),'utf8'),/X-Robots-Tag: noindex/);
  await assert.rejects(buildInstrumental({sitePath:'/../escape/'}),/Ruta del sitio/);
});
