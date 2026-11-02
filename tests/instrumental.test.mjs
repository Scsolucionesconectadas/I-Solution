import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { buildInstrumental } from '../scripts/build-instrumental.mjs';
import { pages } from '../apps/instrumental-solution/pages.mjs';
import { catalogueState, matchesProduct } from '../apps/instrumental-solution/catalogue-model.js';
import { contact } from '../apps/instrumental-solution/institutional-pages.mjs';
import { counterValue } from '../apps/instrumental-solution/counter-model.js';
import {specificationGroups,productResources} from '../apps/instrumental-solution/product-details.mjs';
import {publicationPlan,publicBaseUrl,seoHead} from '../apps/instrumental-solution/seo.mjs';

const root=resolve(import.meta.dirname,'..');
const hash=data=>createHash('sha256').update(data).digest('hex');

test('i-Solution construye páginas y documentos sin borrar el sitio hermano',async()=>{
  const outDir=join(root,'.qa/test-instrumental');
  await mkdir(join(outDir,'lmr'),{recursive:true});
  await writeFile(join(outDir,'lmr/index.html'),'LMR debe conservarse');
  const report=await buildInstrumental({outDir});
  assert.equal(report.pages,26);
  assert.equal(await readFile(join(outDir,'lmr/index.html'),'utf8'),'LMR debe conservarse');
  const data=JSON.parse(await readFile(join(root,'content/instrumental-solution/productos.json'),'utf8'));
  const titles=[],descriptions=[];
  const copy=JSON.parse(await readFile(join(root,'content/instrumental-solution/textos.json'),'utf8'));
  for(const {slug} of pages(data)){
    const html=await readFile(join(outDir,'instrumental-solution',slug,'index.html'),'utf8');
    assert.equal((html.match(/<h1[ >]/g)??[]).length,1);
    assert.match(html,/name="robots" content="noindex, nofollow"/);
    assert.match(html,/<html lang="es-AR"/);
    assert.doesNotMatch(html,/infolmr@|orisrojas11|formspree|correo enviado|ISO 17025|24 horas|próximamente|Demo local|HH2402210026003/i);
    if(slug!=='contacto/')assert.doesNotMatch(html,/formsubmit/);
    assert.equal(new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1])).size,[...html.matchAll(/\sid="([^"]+)"/g)].length,`IDs duplicados: ${slug}`);
    titles.push(html.match(/<title>(.*?)<\/title>/)[1]);
    descriptions.push(html.match(/name="description" content="([^"]+)"/)[1]);
    assert.equal(titles.at(-1),pages(data,copy).find(page=>page.slug===slug).title);
    assert.equal(descriptions.at(-1),pages(data,copy).find(page=>page.slug===slug).description);
    assert.doesNotMatch(html,/La selección empieza|por una buena consulta|class="contact-panel"|class="eyebrow"|Empresa<span aria-hidden="true">⌄/);
    for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
      const url=new URL(match[1].replaceAll('&amp;','&'),`https://example.invalid/instrumental-solution/${slug}`);
      if(url.origin!=='https://example.invalid')continue;
      const decoded=decodeURIComponent(url.pathname);
      await access(join(outDir,decoded,decoded.endsWith('/')?'index.html':''));
      if(url.hash){
        const target=await readFile(join(outDir,decoded,decoded.endsWith('/')?'index.html':''),'utf8');
        assert.ok(target.includes(`id="${url.hash.slice(1)}"`),`Ancla inexistente ${url.href}`);
      }
    }
  }
  assert.equal(new Set(titles).size,26);
  assert.equal(new Set(descriptions).size,26);
  const home=await readFile(join(outDir,'instrumental-solution/index.html'),'utf8');
  const hero=home.match(/<section class="home-photo-hero"[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero);
  assert.equal((hero.match(/class="button /g)??[]).length,2);
  assert.match(hero,/Explorar instrumentos/);
  assert.match(hero,/Ver catálogo digital/);
  assert.doesNotMatch(hero,/mosaic-tile|Solicitar asesoramiento|Mostrar más instrumentos|hero-foot/);
  assert.match(hero,/inicio-hero-/);
  assert.match(home,/Ver documentación por instrumento/);
  assert.match(home,/productos\/\?familia=An%C3%A1lisis%20de%20l%C3%ADquidos#instrumentos/);
  assert.doesNotMatch(home,/class="resource-preview"[^>]*>\s*<a/);
  assert.doesNotMatch(home,/Inglés|Español|\d+ páginas/);
  const contact=await readFile(join(outDir,'instrumental-solution/contacto/index.html'),'utf8');
  assert.match(contact,/<form class="inquiry-form"[^>]+data-inquiry-form/);
  assert.match(contact,/<button[^>]+type="submit" disabled/);
  assert.doesNotMatch(contact,/El envío desde este formulario está desactivado/);
  assert.match(contact,/data-endpoint="https:\/\/formsubmit.co\/ajax\/info@solution.com.ar"/);
  assert.match(contact,/data-inquiry-status[^>]+hidden/);
  assert.match(contact,/class="photo-page-hero contact-photo-hero"/);
  assert.match(contact,/href="#formulario"[^>]*><span>Solicitar cotización/);
  assert.match(contact,/<option value="otra">Otras consultas<\/option>/);
  for(const field of ['name','company','email','phone','reason','product','message']) assert.match(contact,new RegExp(`for="inquiry-${field}"`));
  assert.doesNotMatch(contact,/fetch\(|formspree|correo enviado/i);
  assert.match(contact,/jmaradona@solution.com.ar/);
  const site=JSON.parse(await readFile(join(root,'content/instrumental-solution/site.json'),'utf8'));
  assert.equal(site.contactEndpoint,''); // Legacy commercial snapshot, not the transport settings.
  const transport=JSON.parse(await readFile(join(root,'content/instrumental-solution/contacto.json'),'utf8'));
  assert.equal(transport.recipient,site.email);
  assert.equal(transport.endpoint,'https://formsubmit.co/ajax/info@solution.com.ar');
  const formScript=await readFile(join(outDir,'instrumental-solution/assets/contact-context.js'),'utf8');
  assert.match(formScript,/enhanceInquiry\(form,context\)/);
  assert.doesNotMatch(formScript,/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/);
  const formUi=await readFile(join(outDir,'instrumental-solution/assets/contact.js'),'utf8');
  assert.match(formUi,/addEventListener\('submit',async event/);
  assert.doesNotMatch(formUi,/localStorage|sessionStorage|innerHTML|sendBeacon/);
  const company=await readFile(join(outDir,'instrumental-solution/quienes-somos/index.html'),'utf8');
  assert.match(company,/class="company-photo-hero"/);
  assert.match(company,/empresa-hero-1600.webp/);
  assert.doesNotMatch(company,/<section class="company-hero section"/);
  assert.match(company,/Instrumental Solution SRL es una empresa nacional/);
  for(const value of [8,150,350,100])assert.match(company,new RegExp(`data-counter="${value}"`));
  const endings=[];
  for(const slug of ['','nuestra-propuesta/','descargas/']){
    const html=await readFile(join(outDir,'instrumental-solution',slug,'index.html'),'utf8');
    endings.push(html.match(/closing--([a-z]+)/)[1]);
  }
  assert.equal(new Set(endings).size,3);
  const services=await readFile(join(outDir,'instrumental-solution/servicios/index.html'),'utf8');
  assert.match(services,/service-grid--complete/);
  assert.match(services,/Consultar al servicio técnico/);
  for(const id of ['laboratorio','planta','calibracion','automatizacion','analiticos'])assert.match(services,new RegExp(`servicio-${id}-`));
  assert.doesNotMatch(services,/closing-section/);
  for(const slug of ['quienes-somos/','equipo/','productos/','catalogo/',...data.map(p=>`productos/${p.slug}/`)]){
    const html=await readFile(join(outDir,'instrumental-solution',slug,'index.html'),'utf8');
    assert.doesNotMatch(html,/closing-section|contact-panel/);
  }
  for(const doc of data.flatMap(p=>p.documents)){
    const original=await readFile(join(root,'apps/instrumental-solution/assets/documents',doc.file));
    const output=await readFile(join(outDir,'instrumental-solution/assets/documentos',doc.file));
    assert.equal(hash(output),hash(original));
  }
  const metadata=JSON.parse(await readFile(join(root,'content/instrumental-solution/catalogo-pdf.json'),'utf8'));
  const pdf=await readFile(join(outDir,'instrumental-solution/assets/documentos/catalogo-isolution.pdf'));
  assert.equal(hash(pdf),metadata.pdfSha256);
  const catalogue=await readFile(join(outDir,'instrumental-solution/catalogo/index.html'),'utf8');
  assert.match(catalogue,/Descargar catálogo PDF/);
  assert.match(catalogue,/download="catalogo-isolution.pdf"/);
  assert.match(catalogue,/data-catalogue-download/);
  assert.match(catalogue,/abrir el catálogo en otra pestaña/);
  assert.match(catalogue,/catalogo-portada.webp/);
  const sheets=JSON.parse(await readFile(join(root,'content/instrumental-solution/fichas-pdf.json'),'utf8'));
  for(const p of data){
    const html=await readFile(join(outDir,'instrumental-solution/productos',p.slug,'index.html'),'utf8');
    assert.match(html,/id="descripcion"/);assert.match(html,/id="caracteristicas"/);assert.match(html,/id="documentacion"/);
    assert.match(html,new RegExp(sheets.products[p.slug].file));
    const sheet=await readFile(join(outDir,'instrumental-solution/assets/documentos',sheets.products[p.slug].file));
    assert.equal(hash(sheet),sheets.products[p.slug].pdfSha256);
    assert.ok(p.description.length&&p.applications.length&&p.parameters.length);
  }
  const caudal=await readFile(join(outDir,'instrumental-solution/productos/caudalimetro-electromagnetico-sanitario/index.html'),'utf8');
  assert.equal((caudal.match(/data-gallery-index=/g)??[]).length,3);
  const radar26=await readFile(join(outDir,'instrumental-solution/productos/radar-nivel-26-ghz/index.html'),'utf8');
  assert.match(radar26,/<video controls preload="none" playsinline/);
  assert.match(radar26,/id="multimedia"/);
  assert.match(radar26,/poster="[^"]*radar26-video-poster.webp"/);
});

test('un instrumento nuevo aparece en Contacto y recibe una URL sin duplicar listas de metadatos',async()=>{
  const read=name=>readFile(join(root,`content/instrumental-solution/${name}.json`),'utf8').then(JSON.parse);
  const [data,site,institution,copy]=await Promise.all(['productos','site','institucional','textos'].map(read));
  const added={...data[0],slug:'nuevo-instrumento',name:'Instrumento adicional',series:'Modelo nuevo',documents:[]};
  const all=[...data,added];
  const ctx={products:all,site,institution,copy,href:p=>`/instrumental-solution/${p}`,images:{'contacto-hero':{width:100,height:100,variants:[{width:100,file:'hero.webp'}]}}};
  assert.match(contact(ctx),/<option value="nuevo-instrumento">Instrumento adicional · Modelo nuevo<\/option>/);
  const addedPage=pages(all,copy).find(p=>p.slug==='productos/nuevo-instrumento/');
  assert.ok(addedPage);assert.match(addedPage.title,/Instrumento adicional/);assert.ok(addedPage.description);
});

test('contadores se mantienen acotados y finalizan exactamente en el valor confirmado',()=>{
  for(const target of [8,150,350,100]){
    assert.equal(counterValue(target,0),0);assert.equal(counterValue(target,1),target);
    assert.equal(counterValue(target,2),target);assert.equal(counterValue(target,-1),0);
    const values=Array.from({length:21},(_,i)=>counterValue(target,i/20));
    assert.ok(values.every((v,i)=>v>=0&&v<=target&&(!i||v>=values[i-1])));
  }
});

test('filtros de instrumentos normalizan acentos, combinan documentos y conservan solo familias válidas',()=>{
  const families=['Nivel','Caudal','Presión','Configuración'];
  assert.deepEqual(catalogueState('https://example.invalid/productos/?familia=Presi%C3%B3n&documentos=1&q=smart',families),{query:'smart',family:'Presión',documents:true,resource:''});
  assert.equal(catalogueState('https://example.invalid/?familia=%3Cscript%3E',families).family,'');
  const p={family:'Presión',documents:false,search:'i-Solution Transmisor de presión Smart SM315TGP'};
  assert.equal(matchesProduct(p,{family:'Presión',query:'presion',documents:false}),true);
  assert.equal(matchesProduct(p,{family:'Presión',query:'smart',documents:true}),false);
  assert.equal(matchesProduct(p,{family:'Nivel',query:'',documents:false}),false);
  assert.equal(matchesProduct(p,{family:'',query:'<script>',documents:false}),false);
});

test('manuales y videos filtran recursos reales y se combinan con búsqueda y familia',()=>{
  const families=['Nivel','Caudal'];
  const state=catalogueState('https://example.invalid/?familia=Nivel&recurso=video&q=radar',families);
  assert.equal(state.resource,'video');
  assert.equal(matchesProduct({family:'Nivel',search:'Radar 26 GHz',video:true},state),true);
  assert.equal(matchesProduct({family:'Nivel',search:'Radar 80 GHz',video:false},state),false);
  assert.equal(matchesProduct({family:'Caudal',search:'Radar',video:true},state),false);
  assert.equal(catalogueState('https://example.invalid/?recurso=inventado',families).resource,'');
  assert.deepEqual(productResources({documents:[{title:'Ficha técnica'}]}),{manual:false,video:false});
  assert.deepEqual(productResources({documents:[{title:'Manual de instalación'}],videos:[{}]}),{manual:true,video:true});
});

test('agrupar características conserva cada fila y valor técnico exactamente una vez',async()=>{
  const products=JSON.parse(await readFile(join(root,'content/instrumental-solution/productos.json'),'utf8'));
  for(const p of products){
    const groups=specificationGroups(p.parameters);
    assert.deepEqual(groups.flatMap(g=>g.rows).map(JSON.stringify).sort(),p.parameters.map(JSON.stringify).sort());
    assert.ok(groups.every(g=>g.rows.length));
  }
});

test('SEO prepara URLs y datos reales sin inventar ofertas o valoraciones ni activar producción',async()=>{
  const read=name=>readFile(join(root,`content/instrumental-solution/${name}.json`),'utf8').then(JSON.parse);
  const [site,products,copy]=await Promise.all(['site','productos','textos'].map(read));
  const plan=publicationPlan({baseUrl:'https://solution.com.ar/',site,products,pages:pages(products,copy)});
  assert.equal(plan.pages.length,26);
  assert.equal((plan.sitemap.match(/<loc>/g)??[]).length,25);
  assert.equal(plan.migrations.length,6);
  const record=plan.pages.find(p=>p.slug.includes('radar-nivel-26-ghz'));
  assert.equal(record.canonical,'https://solution.com.ar/productos/radar-nivel-26-ghz/');
  assert.match(seoHead(record),/application\/ld\+json/);
  assert.doesNotMatch(JSON.stringify(plan),/aggregateRating|reviewCount|priceCurrency|"offers"/);
  assert.equal(plan.pages.find(p=>p.slug==='descargas/').canonical,'https://solution.com.ar/productos/');
  assert.equal(publicBaseUrl('https://example.com/grupo'),'https://example.com/grupo/');
  for(const url of ['http://solution.com.ar','https://u:p@solution.com.ar','https://solution.com.ar/?x=1','https://solution.com.ar/#x','https://localhost/'])assert.throws(()=>publicBaseUrl(url));
});

test('i-Solution rechaza producción y salidas/prefijos inseguros antes de escribir',async()=>{
  await assert.rejects(buildInstrumental({mode:'production'}),/solo admite preview/);
  await assert.rejects(buildInstrumental({outDir:root}),/dentro de dist/);
  await assert.rejects(buildInstrumental({outDir:resolve(root,'../fuera')}),/dentro de dist/);
  for(const deploymentPrefix of ['/../otra','//external','/solucion/','/a?x=1'])await assert.rejects(buildInstrumental({deploymentPrefix}),/Prefijo/);
});

test('i-Solution admite un prefijo Pages sin enlaces al dominio antiguo',async()=>{
  const outDir=join(root,'.qa/test-instrumental-prefix');
  const report=await buildInstrumental({outDir,deploymentPrefix:'/solution-group'});
  assert.equal(report.basePath,'/solution-group/instrumental-solution/');
  const html=await readFile(join(outDir,'solution-group/instrumental-solution/index.html'),'utf8');
  assert.match(html,/href="\/solution-group\/instrumental-solution\/productos\/"/);
  assert.doesNotMatch(html,/href="https:\/\/solution\.com\.ar\/producto/);
});

test('las líneas del folleto se distinguen de modelos y conservan recursos específicos',async()=>{
  const products=JSON.parse(await readFile(join(root,'content/instrumental-solution/productos.json'),'utf8'));
  assert.equal(products.length,17);
  const lines=products.filter(p=>p.kind==='line');
  assert.equal(lines.length,11);
  assert.ok(lines.every(p=>!p.model&&!p.brand&&p.documents.length===0));
  assert.equal(products.filter(p=>p.family==='Análisis de líquidos').length,2);
  const site=JSON.parse(await readFile(join(root,'content/instrumental-solution/site.json'),'utf8'));
  const copy=JSON.parse(await readFile(join(root,'content/instrumental-solution/textos.json'),'utf8'));
  const plan=publicationPlan({baseUrl:'https://solution.com.ar/',site,products,pages:pages(products,copy)});
  const record=plan.pages.find(p=>p.slug==='productos/analizadores-cloro-libre/');
  const group=record.schema['@graph'].find(x=>x['@type']==='ProductGroup');
  assert.ok(group);assert.equal(group.brand,undefined);assert.equal(group.model,undefined);
  const html=await readFile(join(root,'.qa/test-instrumental/instrumental-solution/productos/analizadores-cloro-libre/index.html'),'utf8');
  assert.match(html,/class="product-guidance"/);assert.match(html,/Solicitar documentación por modelo/);
  assert.match(html,/Ver documentación/);assert.doesNotMatch(html,/document-indicator|Ficha de línea|Ficha de producto|Ficha del producto|class="line-scope"|Manual.*CLX|marca.*HF scientific/i);
});
