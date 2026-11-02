import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {productMedia} from '../apps/instrumental-solution/components.mjs';
import {validateCatalogue} from '../apps/instrumental-solution/content-validation.mjs';
const read=name=>readFile(new URL(`../content/instrumental-solution/${name}.json`,import.meta.url),'utf8').then(JSON.parse);
const [products,images]=await Promise.all(['productos','imagenes'].map(read));
const entry=()=>({...structuredClone(products[0]),video:{title:'Video del instrumento',file:'radar-26.mp4',captions:[{file:'radar-es.vtt',language:'es',label:'Español',default:true}]}});

test('un video admite subtítulos locales sin activar reproducción o descarga anticipada',()=>{
  const p=entry();
  assert.doesNotThrow(()=>validateCatalogue([p],images));
  const html=productMedia({href:path=>'/instrumental-solution/'+path},p);
  assert.match(html,/<track kind="captions" src="\/instrumental-solution\/assets\/videos\/radar-es.vtt" srclang="es" label="Español" default>/);
  assert.match(html,/preload="none"/);
  assert.doesNotMatch(html,/autoplay/);
  delete p.video.captions;
  assert.doesNotMatch(productMedia({href:path=>'/'+path},p),/<track/);
});

test('subtítulos rechazan rutas externas, idiomas repetidos y varios predeterminados',()=>{
  for(const change of [p=>p.video.captions[0].file='../privado.vtt',p=>p.video.captions[0].language='es" onload="x',p=>p.video.captions.push({...p.video.captions[0]}),p=>p.video.captions.push({...p.video.captions[0],language:'en'})]){
    const p=entry();change(p);
    assert.throws(()=>validateCatalogue([p],images),/Catálogo: revisar/);
  }
});
