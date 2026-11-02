export const normalizeSearch=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es-AR').trim();
export function catalogueState(url,families) {
  const params=new URL(url).searchParams;
  const family=params.get('familia')??'';
  const resource=params.get('recurso')??'';
  return {query:(params.get('q')??'').slice(0,100),family:families.includes(family)?family:'',documents:params.get('documentos')==='1',resource:['manual','video'].includes(resource)?resource:''};
}
export function matchesProduct(product,state) {
  const terms=normalizeSearch(state.query).split(/\s+/).filter(Boolean);
  const text=normalizeSearch(product.search);
  return (!state.family||product.family===state.family)&&(!state.documents||product.documents)&&(!state.resource||product[state.resource]===true)&&terms.every(term=>text.includes(term));
}
