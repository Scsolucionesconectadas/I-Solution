import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateCatalogue} from '../apps/instrumental-solution/content-validation.mjs';
const read=name=>readFile(new URL(`../content/instrumental-solution/${name}.json`,import.meta.url),'utf8').then(JSON.parse);
const [products,images]=await Promise.all(['productos','imagenes'].map(read));

test('el catálogo actual y una entrada adicional válida no dependen de una cantidad fija',()=>{
  assert.doesNotThrow(()=>validateCatalogue(products,images));
  assert.doesNotThrow(()=>validateCatalogue([...products,{...products[0],slug:'equipo-adicional'}],images));
});

test('datos incompletos, recursos inexistentes o rutas externas no generan una ficha rota',()=>{
  for(const change of [p=>p.name='',p=>p.image='imagen-inexistente',p=>p.imageAlt='',p=>p.slug='../fuera',p=>p.parameters=[['Variable']],p=>p.documents=[{id:'manual',title:'Manual',type:'Manual',file:'../privado.pdf'}],p=>p.gallery=[{image:p.image,caption:'Vista'}],p=>p.video={title:'Video',file:'https://example.invalid/video.mp4'}]){
    const entry=structuredClone(products[0]);change(entry);
    assert.throws(()=>validateCatalogue([entry],images),/Catálogo: revisar/);
  }
  assert.throws(()=>validateCatalogue([products[0],products[0]],images),/slug único/);
});
