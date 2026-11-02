import { readFile, mkdir, cp, rm, writeFile } from 'node:fs/promises';
import { resolve, join, relative, sep, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { layout, pages } from '../apps/instrumental-solution/render.mjs';
import {contactEndpoint,RECIPIENT} from '../apps/instrumental-solution/contact-model.js';
import {validateCatalogue} from '../apps/instrumental-solution/content-validation.mjs';

const projectRoot = resolve(import.meta.dirname, '..');
export async function buildInstrumental(input = {}) {
  if ((input.mode ?? 'preview') !== 'preview') throw new Error('i-Solution: esta primera etapa solo admite preview. Producción requiere validación comercial y de dominio.');
  const outDir = resolve(input.outDir ?? join(projectRoot, 'dist'));
  const outputRelative = relative(projectRoot, outDir);
  if (isAbsolute(outputRelative) || outputRelative.startsWith(`..${sep}`) || !['dist', '.qa'].includes(outputRelative.split(sep)[0])) throw new Error('La salida debe estar dentro de dist/ o .qa/ del proyecto.');
  const prefix = input.deploymentPrefix ?? '';
  if (typeof prefix !== 'string' || (prefix && !/^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+$/.test(prefix))) throw new Error('Prefijo de despliegue inválido.');
  const sitePath = input.sitePath ?? '/instrumental-solution/';
  if (typeof sitePath !== 'string' || !/^\/(?:[a-z0-9-]+\/)*$/.test(sitePath)) throw new Error('Ruta del sitio inválida.');
  const basePath = `${prefix}${sitePath}`;
  const target = join(outDir, basePath.slice(1));
  // Never clear the shared artifact root: LMR may already be built alongside this site.
  if ((target !== outDir && !target.startsWith(outDir + sep)) || relative(outDir, target).split(sep).includes('..')) throw new Error('Destino de i-Solution fuera del artefacto.');
  const assets = join(target, 'assets');
  const app = join(projectRoot, 'apps/instrumental-solution');
  const load = name => readFile(join(projectRoot, 'content/instrumental-solution', `${name}.json`), 'utf8').then(JSON.parse);
  const [site, products, institution, registry, copy] = await Promise.all(['site', 'productos', 'institucional', 'imagenes', 'textos'].map(load));
  const contact=await load('contacto');
  contact.endpoint=contactEndpoint(input.contactEndpoint ?? contact.endpoint);
  if(contact.recipient!==RECIPIENT||contact.recipient!==site.email||typeof contact.subject!=='string'||contact.subject.length>120||/[\r\n]/.test(contact.subject))throw new Error('Revisar la configuración institucional de contacto de i-Solution.');
  validateCatalogue(products,registry);
  if(Object.keys(copy.images).some(key=>Object.hasOwn(registry,key))) throw new Error('Las imágenes editoriales no deben sustituir recursos del catálogo.');
  await rm(target, { force: true, recursive: true });
  await mkdir(join(assets, 'documentos'), { recursive: true });
  const images={};
  // Source files and product associations are explicit; never enlarge small source photos.
  for(const [key,file] of Object.entries({...registry,...copy.images})) {
    if(!/^[a-z0-9-]+$/.test(key)||!/^[a-zA-Z0-9-]+\.(?:png|jpe?g)$/.test(file)) throw new Error('Registro de imagen inválido.');
    const source=join(app,'assets/source',file);
    const {width,height}=await sharp(source).metadata();
    images[key]={width,height,variants:[]};
    const widths=copy.imageWidths[key]??[480,800];
    if(!Array.isArray(widths)||widths.some(size=>!Number.isInteger(size)||size<320||size>2400)) throw new Error('Anchos de imagen inválidos.');
    for(const size of new Set(widths.map(size=>Math.min(width,size)).sort((a,b)=>a-b))) {
      const output=`${key}-${size}.webp`;
      await sharp(source).resize({width:size,withoutEnlargement:true}).webp({quality:90}).toFile(join(assets,output));
      images[key].variants.push({width:size,file:output});
    }
  }
  const documentSizes = {};
  const videoPosters={};
  const posterSource=join(app,'assets/derived/radar26-video-poster.png');
  const posterMetadata=join(app,'assets/derived/radar26-video-poster.json');
  if(existsSync(posterSource)&&existsSync(posterMetadata)){
    const metadata=JSON.parse(await readFile(posterMetadata,'utf8'));
    const video=await readFile(join(app,'assets/video/radar-26.mp4'));
    if(createHash('sha256').update(video).digest('hex')===metadata.videoSha256){
      await sharp(posterSource).resize({width:960,withoutEnlargement:true}).webp({quality:90}).toFile(join(assets,'radar26-video-poster.webp'));
      videoPosters['radar-26.mp4']='assets/radar26-video-poster.webp';
    }
  }
  // Generated product sheets use the same data as the website; never serve stale copies.
  let sheets={};
  const sheetsFile=join(projectRoot,'content/instrumental-solution/fichas-pdf.json');
  if(existsSync(sheetsFile)){
    const metadata=JSON.parse(await readFile(sheetsFile,'utf8'));
    const fingerprint=createHash('sha256');
    for(const name of ['site','productos','imagenes'])fingerprint.update(await readFile(join(projectRoot,'content/instrumental-solution',`${name}.json`)));
    for(const p of products)fingerprint.update(await readFile(join(app,'assets/source',registry[p.image])));
    if(metadata.contentSha256===fingerprint.digest('hex'))sheets=metadata.products;
    else console.warn('Fichas de producto omitidas: regenerar con npm run products:pdf para los datos actuales.');
  }
  for (const product of products) {
    if(product.kind&&product.kind!=='line')throw new Error(`Tipo de ficha inválido: ${product.slug}`);
    if(product.kind==='line'&&product.model)throw new Error(`Una línea sin modelo confirmado no debe declarar un SKU: ${product.slug}`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug)) throw new Error('Slug de instrumento inválido.');
    if (!Object.hasOwn(images,product.image)) throw new Error(`Imagen de instrumento no registrada: ${product.slug}`);
    for(const item of product.gallery??[])if(!Object.hasOwn(images,item.image)||!item.alt) throw new Error(`Vista de instrumento inválida: ${product.slug}`);
    for(const video of product.videos??(product.video?[product.video]:[])){
      if(!/^[a-z0-9-]+\.mp4$/.test(video.file)||!video.title) throw new Error('Video de instrumento inválido.');
      if(video.poster&&!Object.hasOwn(images,video.poster))throw new Error('Portada de video no registrada.');
      await mkdir(join(assets,'videos'),{recursive:true});
      await cp(join(app,'assets/video',video.file),join(assets,'videos',video.file));
      for(const track of video.captions??[]){
        const source=join(app,'assets/video',track.file);
        const text=await readFile(source,'utf8');
        if(!/^\uFEFF?WEBVTT(?:[ \t].*)?(?:\r?\n|$)/.test(text))throw new Error(`Subtítulo WebVTT inválido: ${track.file}`);
        await cp(source,join(assets,'videos',track.file));
      }
    }
    const sheet=sheets[product.slug];
    if(sheet){
      if(!/^[a-z0-9-]+\.pdf$/.test(sheet.file))throw new Error('Ficha de producto inválida.');
      const bytes=await readFile(join(app,'assets/documents',sheet.file));
      if(createHash('sha256').update(bytes).digest('hex')!==sheet.pdfSha256)throw new Error('Ficha PDF modificada sin regeneración.');
      product.documents.unshift({id:'ficha-producto',file:sheet.file,title:`${product.name} · ${product.series}`,type:product.kind==='line'?'Ficha de línea':'Ficha técnica del equipo',description:product.kind==='line'?'Resumen de tecnologías, opciones y aplicaciones de la línea.':'Resumen de características y aplicaciones de la configuración presentada.'});
    }
    for (const doc of product.documents) {
      if (!/^[a-z0-9-]+\.pdf$/.test(doc.file)) throw new Error('Nombre de documento inválido.');
      const source = join(app, 'assets/documents', doc.file);
      const data = await readFile(source);
      if (data.subarray(0,5).toString() !== '%PDF-') throw new Error(`Documento PDF inválido: ${doc.file}`);
      await cp(source, join(assets, 'documentos', doc.file));
      documentSizes[doc.file] = data.length < 1e6 ? `${Math.round(data.length / 1000)} KB` : `${(data.length / 1e6).toFixed(1).replace('.', ',')} MB`;
    }
  }
  await sharp(join(app,'assets/source/logo.png')).resize({width:600,withoutEnlargement:true}).webp({lossless:true}).toFile(join(assets,'logo.webp'));
  for (const agency of ['sc','click']) {
    const prepared=await sharp(join(projectRoot,`apps/instrumental-solution/assets/agency/agency-${agency}.png`)).trim({background:'#ffffff',threshold:12,margin:8}).png().toBuffer();
    await sharp(prepared).autoOrient().resize({width:240,withoutEnlargement:true}).webp({quality:88,lossless:true,smartSubsample:true}).toFile(join(assets,`agency-${agency}.webp`));
  }
  await cp(join(projectRoot,'apps/instrumental-solution/assets/fonts'),join(assets,'fonts'),{recursive:true});
  for (const name of ['site.css','website.css','polish.css','app.js','counters.js','counter-model.js','product-media.js','catalogue.js','catalogue-model.js','contact-context.js','contact.js','contact-model.js','form-validation.js']) await cp(join(app,name),join(assets,name));
  await writeFile(join(assets,'favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#102b47"/><path d="M15 17h7l-4 15h-7z" fill="#00a4e9"/><circle cx="21" cy="9" r="4" fill="#00a4e9"/></svg>');
  let cataloguePdf='';
  let catalogueCover;
  const metadataFile=join(projectRoot,'content/instrumental-solution/catalogo-pdf.json');
  const catalogueFile=join(app,'assets/documents/catalogo-isolution.pdf');
  if(existsSync(metadataFile)&&existsSync(catalogueFile)){
    const metadata=JSON.parse(await readFile(metadataFile,'utf8'));
    const fingerprint=createHash('sha256');
    for(const name of ['site','productos','institucional','imagenes']) fingerprint.update(await readFile(join(projectRoot,'content/instrumental-solution',`${name}.json`)));
    for(const p of products) fingerprint.update(await readFile(join(app,'assets/source',registry[p.image])));
    for(const service of institution.services)fingerprint.update(await readFile(join(app,'assets/source',copy.images['servicio-'+service.id]??registry[service.image])));
    const pdf=await readFile(catalogueFile);
    if(fingerprint.digest('hex')===metadata.contentSha256&&createHash('sha256').update(pdf).digest('hex')===metadata.pdfSha256){
      await cp(catalogueFile,join(assets,'documentos/catalogo-isolution.pdf'));
      cataloguePdf='assets/documentos/catalogo-isolution.pdf';
      const coverSource=join(app,'assets/derived/catalogo-portada.png');
      const coverMetadata=join(app,'assets/derived/catalogo-portada.json');
      if(existsSync(coverSource)&&existsSync(coverMetadata)){
        const cover=JSON.parse(await readFile(coverMetadata,'utf8'));
        if(cover.pdfSha256===metadata.pdfSha256){
          const info=await sharp(coverSource).metadata();
          await sharp(coverSource).resize({width:800,withoutEnlargement:true}).webp({quality:92}).toFile(join(assets,'catalogo-portada.webp'));
          catalogueCover={file:'assets/catalogo-portada.webp',width:info.width,height:info.height};
        }
      }
    } else console.warn('Catálogo PDF omitido: regenerar con scripts/create-instrumental-catalog.py para los datos actuales.');
  }
  if (input.requireDocuments && (!cataloguePdf || Object.keys(sheets).length !== products.length || products.some(product => !sheets[product.slug]))) throw new Error('Documentación desactualizada: regenerar fichas y catálogo antes de publicar la demo.');
  const ctx={site,contact,products,institution,copy,documentSizes,images,cataloguePdf,catalogueCover,videoPosters,href:path=>`${basePath}${path}`};
  const sitePages = pages(products,copy);
  if(sitePages.some(page=>!page.title||!page.description)) throw new Error('Faltan títulos o descripciones editoriales.');
  if(new Set(sitePages.map(page=>page.title)).size!==sitePages.length||new Set(sitePages.map(page=>page.description)).size!==sitePages.length) throw new Error('Cada página requiere un título y una descripción únicos.');
  for (const page of sitePages) {
    const html = layout(ctx,page);
    if ((html.match(/<h1[ >]/g) ?? []).length !== 1) throw new Error(`H1 inválido en i-Solution: ${page.slug}`);
    const directory=join(target,page.slug);
    await mkdir(directory,{recursive:true});
    await writeFile(join(directory,'index.html'),html,'utf8');
  }
  await writeFile(join(target,'robots.txt'),'User-agent: *\nDisallow: /\n');
  return {pages:sitePages.length,basePath,outDir,mode:'preview'};
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const report=await buildInstrumental({mode:process.env.BUILD_MODE ?? 'preview',deploymentPrefix:process.env.DEPLOY_PREFIX ?? ''});
  console.log(`${report.pages} páginas i-Solution generadas · preview · ${report.basePath}`);
}
