import {escapeHtml as e,jsonScript} from '../../shared/html.mjs';

export function publicBaseUrl(value) {
  const url=new URL(value);
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||['localhost','127.0.0.1','example.invalid'].includes(url.hostname))throw new Error('SEO requiere una URL HTTPS pública, sin credenciales, consulta ni fragmento.');
  url.pathname=url.pathname.replace(/\/+$/,'')+'/';
  return url.href;
}

// Pure preparation: this module never activates indexing, deploys or connects accounts.
export function publicationPlan({baseUrl,site,products,pages,images={}}) {
  const base=publicBaseUrl(baseUrl);
  const absolute=path=>new URL(path,base).href;
  const organization={'@type':'Organization','@id':absolute('#empresa'),name:'Instrumental Solution SRL',alternateName:site.name,url:base,email:site.email,telephone:site.phone,address:{'@type':'PostalAddress',streetAddress:'Castellanos 317',postalCode:'2000',addressLocality:'Rosario',addressRegion:'Santa Fe',addressCountry:'AR'}};
  const records=pages.map(page=>{
    const product=products.find(p=>page.slug===`productos/${p.slug}/`);
    const image=images[product?.image??'empresa-hero']?.variants?.at(-1)?.file;
    const canonical=absolute(page.slug==='descargas/'?'productos/':page.slug);
    const graph=[organization];
    if(product){
      const entry={'@type':product.kind==='line'?'ProductGroup':'Product',name:`${product.name} · ${product.series}`,description:product.summary,url:canonical};
      if(product.brand)entry.brand={'@type':'Brand',name:product.brand};
      if(product.model)entry.model=product.model;
      if(image)entry.image=absolute(`assets/${image}`);
      graph.push(entry);
    }
    return {slug:page.slug,canonical,title:page.title,description:page.description,image:image?absolute(`assets/${image}`):null,type:product?'product':'website',schema:{'@context':'https://schema.org','@graph':graph}};
  });
  const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+records.filter(page=>page.slug!=='descargas/').map(page=>`<url><loc>${e(page.canonical)}</loc></url>`).join('')+'</urlset>\n';
  const migrations=products.filter(p=>p.source).map(p=>({from:p.source,to:absolute(`productos/${p.slug}/`),status:'Revisar e implementar en el hosting de origen; no aplicada'}));
  return {baseUrl:base,status:'Preparación local; dominio propuesto, sin publicación ni indexación activada',pages:records,sitemap,robots:`User-agent: *\nAllow: /\nSitemap: ${absolute('sitemap.xml')}\n`,migrations};
}

export function seoHead(record) {
  return `<link rel="canonical" href="${e(record.canonical)}"><meta property="og:locale" content="es_AR"><meta property="og:type" content="${record.type}"><meta property="og:site_name" content="i-Solution"><meta property="og:url" content="${e(record.canonical)}"><meta property="og:title" content="${e(record.title)}"><meta property="og:description" content="${e(record.description)}">${record.image?`<meta property="og:image" content="${e(record.image)}"><meta name="twitter:card" content="summary_large_image">`:'<meta name="twitter:card" content="summary">'}<script type="application/ld+json">${jsonScript(record.schema)}</script>`;
}
