import { escapeHtml as e, arrow } from '../../shared/html.mjs';
import { productResources } from './product-details.mjs';
export { e, arrow };

const symbols = {
  flow:'<path d="M3 10h18M3 16h18M8 5l4 5-4 5m7-4 4 5-4 5"/>',
  level:'<path d="M5 3v18h14V3M8 8h8M8 12h8M8 16h8M10 3h4"/>',
  pressure:'<path d="M5 19a9 9 0 1 1 14 0M5 19h14M12 15l4-6M5 12H3m18 0h-2M12 3v2"/>',
  analysis:'<path d="M9 3h6m-5 0v7L5 18a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3M8 15h8"/>',
  file:'<path d="M14 3H6v18h12V7l-4-4Zm0 0v5h4M9 12h6m-6 4h6"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  chat:'<path d="M21 11a9 9 0 0 1-9 9 11 11 0 0 1-4-.8L3 21l1.8-5A9 9 0 1 1 21 11ZM8 9h8m-8 4h5"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  up:'<path d="M12 20V4m-6 6 6-6 6 6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  chevron:'<path d="m6 9 6 6 6-6"/>',
  rocket:'<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2a2 2 0 0 0-3-3Zm7.5-1.5-3-3a22 22 0 0 1 2-4A13 13 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2Z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0m1 7v5s3-.6 4-2c1.1-1.6 0-5 0-5"/><circle cx="16" cy="8" r="1.5"/>',
  growth:'<path d="m3 17 6-6 4 4 8-10m-6 0h6v6"/>',
};
export const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[name] ?? symbols.file}</svg>`;
export const button = (url,label,kind='primary',extra='') => `<a class="button button--${kind}" href="${e(url)}" ${extra}><span>${e(label)}</span>${arrow}</a>`;
export const productPath = product => `productos/${product.slug}/`;
const productIdentity = p => [p.brand,p.family].filter(Boolean).join(' · ');
export function quote(ctx,subject='') {
  const text = subject ? `Hola, quiero consultar por ${subject}. Mi aplicación es: ` : 'Hola, quisiera asesoramiento sobre instrumentación para mi proceso. ';
  return {whatsapp:`https://wa.me/${ctx.site.whatsapp}?text=${encodeURIComponent(text)}`,email:`mailto:${ctx.site.email}?subject=${encodeURIComponent(subject?`Consulta · ${subject}`:'Consulta de instrumentación')}&body=${encodeURIComponent(text)}`};
}
export function photo(ctx,key,alt,{hero=false,className='',sizes='(max-width: 700px) 85vw, 500px'}={}) {
  const image=ctx.images[key];
  if(!image) throw new Error(`Imagen no registrada: ${key}`);
  return `<img class="${e(className)}" src="${ctx.href(`assets/${image.variants[0].file}`)}" srcset="${image.variants.map(v=>`${ctx.href(`assets/${v.file}`)} ${v.width}w`).join(', ')}" sizes="${e(sizes)}" width="${image.width}" height="${image.height}" alt="${e(alt)}" ${hero?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
}
export const productImage = (ctx,p,options={}) => photo(ctx,p.image,p.imageAlt,{...options,className:`instrument-image ${options.className??''}`,sizes:options.sizes??'(max-width: 700px) 65vw, 300px'});

export function mosaic(ctx,{hero=false}={}) {
  const selection=['radar','caudal','presion','programador'].map(key=>ctx.products.find(p=>p.image===key));
  return `<div class="product-mosaic">${selection.map((p,i)=>`<a class="mosaic-tile" href="${ctx.href(productPath(p))}" aria-label="${e(`${p.name} · ${p.series}`)}"><span>${e(p.family)}</span>${productImage(ctx,p,{hero:hero&&i===0,sizes:'(max-width: 700px) 38vw, 190px'})}<strong>${e(p.name.replace(' electromagnético',''))}</strong></a>`).join('')}</div>`;
}
export function productCards(ctx,products=ctx.products) {
  return products.map(p=>{const resources=productResources(p);const line=p.kind==='line';return `<article class="product-result" data-product-family="${e(p.family)}" data-product-search="${e([p.name,p.series,p.brand,p.model??'',p.family,p.summary,...p.features,...p.parameters.flat(),...(p.searchTerms??[])].join(' '))}" data-product-documents="${p.documents.length?'true':'false'}" data-product-manual="${resources.manual}" data-product-video="${resources.video}"><a class="product-card" href="${ctx.href(productPath(p))}"><div class="product-card-image">${productImage(ctx,p,{sizes:'(max-width: 700px) 60vw, 230px'})}</div><div class="product-card-copy"><p class="small-label">${e(productIdentity(p))}</p><h3>${e(p.name)}${p.slug==='transmisor-presion-smart-alta-temperatura'?'<span class="product-variant">Alta temperatura</span>':''}</h3><p class="product-series">${e(p.series)}</p><p class="product-card-description">${e(p.summary)}</p><span class="product-card-action">${line?'Explorar la línea':'Ver instrumento'} ${arrow}</span></div></a></article>`;}).join('');
}

export function documentCards(ctx,p) {
  return `<ul class="document-list">${p.documents.map(d=>`<li class="document-item" id="documento-${e(p.slug)}-${e(d.id)}"><a class="document-open" href="${ctx.href(`assets/documentos/${d.file}`)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir documento: ${e(d.title)}"><span class="document-open-icon">${icon('file')}</span><span class="document-name">${e(d.title)}</span></a><a class="document-download" href="${ctx.href(`assets/documentos/${d.file}`)}" download aria-label="Descargar ${e(d.title)}">${icon('download')}<span>Descargar</span></a></li>`).join('')}</ul>`;
}

export function closingCta(ctx,key) {
  const copy=ctx.copy.closing[key];
  if(!copy) throw new Error(`Cierre editorial no definido: ${key}`);
  const heading=e(copy.title).replaceAll('\n','<br>');
  const feature=['feature','dark'].includes(copy.variant);
  return `<section class="section closing-section closing--${e(copy.variant)}" aria-labelledby="cierre-titulo"><div class="container"><div class="closing-inner" data-reveal>${copy.variant==='support'?`<span class="closing-symbol">${icon('file')}</span>`:''}<div class="closing-copy"><h2 id="cierre-titulo">${heading}</h2><p>${e(copy.text)}</p></div><div class="closing-action">${button(ctx.href(copy.target),copy.action,feature?'light':copy.variant==='editorial'?'outline':'primary')}${feature?'<small>Instrumentación · Control · Automatización</small>':''}</div></div></div></section>`;
}

export function photoHero(ctx,{image,title,text,actions='',className=''}) {
  return `<section class="photo-page-hero ${e(className)}">${photo(ctx,image,'',{hero:true,className:'photo-page-background',sizes:'100vw'})}<div class="container"><div class="photo-page-copy"><h1>${e(title).replaceAll('\n','<br>')}</h1><p>${e(text)}</p>${actions?`<div class="hero-actions">${actions}</div>`:''}</div></div></section>`;
}

export function companyMetrics(ctx) {
  if(ctx.copy.about.metrics.some(m=>!Number.isSafeInteger(m.value)||m.value<0)) throw new Error('Los indicadores requieren valores enteros no negativos.');
  return `<div class="company-metrics" aria-label="i-Solution en cifras"><div class="metrics-background" aria-hidden="true">${photo(ctx,'empresa-hero','',{sizes:'100vw'})}</div>${ctx.copy.about.metrics.map(m=>`<div class="company-metric"><p class="metric-value"><span aria-hidden="true">${e(m.prefix??'')}</span><span class="metric-animation" data-counter="${m.value}" aria-hidden="true">${m.value}</span><span aria-hidden="true">${e(m.suffix??'')}</span><span class="sr-only">${e(m.prefix??'')}${m.value}${e(m.suffix??'')}</span></p><p>${e(m.label)}</p></div>`).join('')}</div>`;
}

export function productGallery(ctx,p) {
  const items=[{image:p.image,alt:p.imageAlt,caption:p.image.startsWith('esquema-')?'Principio de medición':'Vista principal'},...(p.gallery??[])];
  return `<div class="product-gallery" data-product-gallery><div class="product-gallery-stage">${items.map((item,i)=>`<figure id="vista-${e(p.slug)}-${i}" data-gallery-slide>${photo(ctx,item.image,item.alt,{hero:i===0,className:'gallery-photo',sizes:'(max-width:700px) 70vw, 300px'})}<figcaption>${e(item.caption)}</figcaption></figure>`).join('')}</div>${items.length>1?`<div class="product-gallery-thumbs" aria-label="Vistas del instrumento" data-gallery-controls hidden>${items.map((item,i)=>`<button type="button" aria-label="${e(item.caption)}" aria-controls="vista-${e(p.slug)}-${i}" aria-pressed="${i===0}" data-gallery-index="${i}">${photo(ctx,item.image,'',{sizes:'64px'})}</button>`).join('')}</div>`:''}<span class="gallery-identification">${e(productIdentity(p))}</span></div>`;
}

export function productMedia(ctx,p) {
  const videos=p.videos??(p.video?[p.video]:[]);
  return videos.length?`<section class="product-videos" aria-label="Videos del instrumento">${videos.map(v=>{const poster=v.poster?`assets/${ctx.images[v.poster].variants[0].file}`:ctx.videoPosters?.[v.file];return `<figure><video controls preload="none" playsinline aria-label="${e(v.title)}" ${poster?`poster="${ctx.href(poster)}"`:''}><source src="${ctx.href(`assets/videos/${v.file}`)}" type="video/mp4"><a href="${ctx.href(`assets/videos/${v.file}`)}">Ver video: ${e(v.title)}</a></video><figcaption>${e(v.title)}</figcaption></figure>`;}).join('')}</section>`:'';
}

export function manualTeaser(ctx) {
  return `<section class="section resources-section"><div class="container resources-teaser"><div data-reveal><h2>La documentación,<br>junto a tu instrumento.</h2><p>Elegí el equipo para acceder a sus <strong>fichas, manuales y recursos disponibles</strong>, reunidos en una misma página.</p>${button(ctx.href('productos/#instrumentos'),'Ver documentación por instrumento','light')}</div><ul class="resource-preview" data-reveal>${[['Manuales de producto','Instalación y uso del equipo'],['Fichas técnicas','Características y condiciones de trabajo'],['Guías de configuración','Ajustes según el modelo']].map(([a,b])=>`<li><span class="resource-symbol">${icon('file')}</span><span><strong>${a}</strong><small>${b}</small></span></li>`).join('')}</ul></div></section>`;
}

export function serviceCards(ctx,limit=ctx.institution.services.length) {
  return ctx.institution.services.slice(0,limit).map(original=>{const s={...original,...ctx.copy.services?.[original.id]};return `<article class="service-tile" id="${e(s.id)}" data-reveal><div class="service-photo">${photo(ctx,s.image,s.imageAlt??s.name,{sizes:'(max-width: 700px) 90vw, 500px'})}</div><div class="service-tile-copy"><h3>${e(s.name)}</h3><p>${e(s.summary)}</p>${limit<ctx.institution.services.length?'':`<ul class="feature-list">${s.items.map(t=>`<li>${icon('check')}${e(t)}</li>`).join('')}</ul>`}<a class="text-link" href="${ctx.href(`contacto/?servicio=${s.id}#formulario`)}">${e(s.action??'Consultar servicio')} ${arrow}</a></div></article>`;}).join('');
}

export function teamCards(ctx,limit=ctx.institution.team.length) {
  return ctx.institution.team.slice(0,limit).map(person=>`<article class="person-card" data-reveal><div class="person-portrait${person.photo?'':' person-portrait--placeholder'}">${person.photo?photo(ctx,person.photo,person.name,{sizes:'(max-width:700px) 80vw, 340px'}):`<span class="portrait-initials" aria-hidden="true">${e(person.initials)}</span>`}<span class="portrait-line" aria-hidden="true"></span></div><h2>${e(person.name)}</h2><p>${e(person.role)}</p></article>`).join('');
}

export function credits(ctx) {
  return `<div class="agency-credits"><div class="container credits-inner"><span>Diseño y desarrollo</span><a href="https://scsolucionesconectadas.com.ar/" target="_blank" rel="noopener noreferrer" aria-label="SC Soluciones Conectadas"><img src="${ctx.href('assets/agency-sc.webp')}" alt="SC Soluciones Conectadas"><span>Soluciones Conectadas</span></a><a href="https://clicksolucionesdigital.com/" target="_blank" rel="noopener noreferrer" aria-label="Cl!ck Soluciones Digitales"><img src="${ctx.href('assets/agency-click.webp')}" alt="Cl!ck Soluciones Digitales"><span>Cl!ck</span></a></div></div>`;
}
