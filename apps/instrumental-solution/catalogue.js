import {catalogueState,matchesProduct} from './catalogue-model.js';
const form=document.querySelector('[data-catalogue-controls]');
const items=[...document.querySelectorAll('[data-product-family]')].map(node=>({node,family:node.dataset.productFamily,documents:node.dataset.productDocuments==='true',manual:node.dataset.productManual==='true',video:node.dataset.productVideo==='true',search:node.dataset.productSearch}));
if(form&&items.length){
  const query=form.elements.q,family=form.elements.familia,resource=form.elements.recurso;
  const families=[...family.options].map(option=>option.value).filter(Boolean);
  const count=document.querySelector('[data-catalogue-count]'),empty=document.querySelector('[data-catalogue-empty]');
  function update(writeUrl=false){
    const state={query:query.value,family:family.value,resource:resource.value};let total=0;
    items.forEach(item=>{const visible=matchesProduct(item,state);item.node.hidden=!visible;if(visible)total++;});
    count.textContent=`${total} ${total===1?'resultado':'resultados'}`;
    empty.hidden=total!==0;
    if(writeUrl){const url=new URL(location.href);for(const key of ['q','familia','documentos','recurso'])url.searchParams.delete(key);if(query.value.trim())url.searchParams.set('q',query.value.trim());if(family.value)url.searchParams.set('familia',family.value);if(resource.value)url.searchParams.set('recurso',resource.value);history.replaceState(null,'',url);}
  }
  function restore(){const state=catalogueState(location.href,families);query.value=state.query;family.value=state.family;resource.value=state.resource;update();}
  form.addEventListener('input',()=>update(true));
  form.addEventListener('change',()=>update(true));
  form.addEventListener('submit',event=>{event.preventDefault();update(true);});
  form.addEventListener('reset',event=>{event.preventDefault();query.value='';family.value='';resource.value='';update(true);});
  addEventListener('popstate',restore);
  restore();form.hidden=false;
}
