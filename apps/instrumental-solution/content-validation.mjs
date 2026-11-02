// Reject incomplete entries before they become broken product pages or document links.
export function validateCatalogue(products,images) {
  const fail=(id,field)=>{throw new Error(`Catálogo: revisar ${field} en ${id}.`);};
  const text=value=>typeof value==='string'&&value.trim().length>0;
  const list=value=>Array.isArray(value)&&value.length>0&&value.every(text);
  const localFile=(value,extension)=>typeof value==='string'&&new RegExp(`^[a-z0-9-]+\\.${extension}$`).test(value);
  if(!Array.isArray(products)||!products.length)fail('catálogo','productos');
  const slugs=new Set();
  for(const p of products){
    if(!p||typeof p!=='object')fail('catálogo','producto');
    const id=p.slug||'producto sin URL';
    if(typeof p.slug!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||slugs.has(p.slug))fail(id,'slug único');
    slugs.add(p.slug);
    for(const field of ['name','series','family','summary','selectionNote','imageAlt'])if(!text(p[field]))fail(id,field);
    if(p.kind!==undefined&&p.kind!=='line')fail(id,'tipo de entrada');
    if(p.kind==='line'&&p.model)fail(id,'línea sin modelo confirmado');
    if(!Object.hasOwn(images,p.image))fail(id,'imagen principal');
    for(const field of ['features','description','applications'])if(!list(p[field]))fail(id,field);
    if(!Array.isArray(p.parameters)||!p.parameters.length||p.parameters.some(row=>!Array.isArray(row)||row.length!==2||!row.every(text)))fail(id,'parámetros');
    if(!Array.isArray(p.documents))fail(id,'documentos');
    const docIds=new Set();
    for(const d of p.documents){
      if(!d||!text(d.id)||docIds.has(d.id)||!text(d.title)||!text(d.type)||!localFile(d.file,'pdf'))fail(id,'documento con identificación, nombre y archivo local');
      docIds.add(d.id);
    }
    if(p.gallery!==undefined&&!Array.isArray(p.gallery))fail(id,'galería');
    for(const photo of p.gallery??[]){
      if(!photo||!Object.hasOwn(images,photo.image)||!text(photo.alt)||!text(photo.caption))fail(id,'imagen de galería con texto alternativo');
    }
    if(p.videos!==undefined&&!Array.isArray(p.videos))fail(id,'videos');
    for(const video of p.videos??(p.video?[p.video]:[])){
      if(!video||!text(video.title)||!localFile(video.file,'mp4'))fail(id,'video con título y archivo local');
      if(video.captions!==undefined&&!Array.isArray(video.captions))fail(id,'subtítulos');
      const languages=new Set();let defaults=0;
      for(const track of video.captions??[]){
        if(!track||!localFile(track.file,'vtt')||!text(track.label)||typeof track.language!=='string'||!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(track.language)||languages.has(track.language.toLowerCase())||track.default!==undefined&&typeof track.default!=='boolean')fail(id,'subtítulo con archivo local, idioma y etiqueta');
        languages.add(track.language.toLowerCase());
        if(track.default)defaults++;
      }
      if(defaults>1)fail(id,'un único subtítulo predeterminado por video');
    }
    if(p.comparison){
      const c=p.comparison;
      if(!text(c.title)||!text(c.note)||!list(c.headers)||!Array.isArray(c.rows)||!c.rows.length||c.rows.some(row=>!Array.isArray(row)||row.length!==c.headers.length||!row.every(text)))fail(id,'tabla comparativa');
    }
  }
}
