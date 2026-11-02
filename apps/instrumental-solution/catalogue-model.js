export const normalizeSearch=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es-AR').trim();
export function catalogueState(url,families) {
  const params=new URL(url).searchParams;
  const family=params.get('familia')??'';
  const resource=params.get('recurso')??'';
  return {query:(params.get('q')??'').slice(0,100),family:families.includes(family)?family:'',documents:params.get('documentos')==='1',resource:['manual','video'].includes(resource)?resource:''};
}
export function matchesProduct(product,state) {
  return (!state.family||product.family===state.family)&&(!state.documents||product.documents)&&(!state.resource||product[state.resource]===true)&&normalizeSearch(product.search).includes(normalizeSearch(state.query));
}
