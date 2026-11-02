import {enhanceInquiry} from './contact.js';
const dataNode=document.querySelector('#contact-context-data');
const panel=document.querySelector('[data-contact-context]');
const form=document.querySelector('[data-inquiry-form]');
const context=dataNode?JSON.parse(dataNode.textContent):null;

// Same-page quote links preserve the visitor's draft.
document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-quote-trigger]');
  if(!trigger||!form)return;
  const reason=form.elements.motivo;
  if(reason&&!reason.value){reason.value='cotizacion';reason.dispatchEvent(new Event('change',{bubbles:true}));}
});
if(context&&panel&&form){
  const params=new URL(location.href).searchParams;
  const requestedProduct=context.products.find(x=>x.id===params.get('producto'));
  const requestedService=context.services.find(x=>x.id===params.get('servicio'));
  const reason=form.elements.motivo,instrument=form.elements.producto;
  const validReasons=['cotizacion','asesoramiento','servicio','documentacion','otra'];
  const requestedReason=params.get('motivo');
  reason.value=params.get('consulta')==='documentacion'?'documentacion':validReasons.includes(requestedReason)?requestedReason:requestedService?'servicio':requestedProduct?'cotizacion':'';
  if(requestedProduct)instrument.value=requestedProduct.id;
  const whatsapp=document.querySelector('[data-context-whatsapp]'),mail=document.querySelector('[data-context-email]');
  const originalWhatsapp=whatsapp.href,originalMail=mail.href;
  function updateContext(writeUrl=false){
    const product=context.products.find(x=>x.id===instrument.value);
    const service=reason.value==='servicio'?requestedService:null;
    const documentation=reason.value==='documentacion';
    const entry=product??service;
    form.dataset.service=service?.id??'';
    panel.replaceChildren();panel.hidden=!(entry||documentation);
    whatsapp.href=originalWhatsapp;mail.href=originalMail;
    if(entry||documentation){
      const label=entry?.label??'Documentación técnica';
      const title=document.createElement('strong');title.textContent=label;
      const description=document.createElement('p');description.textContent=documentation?'Consulta de manuales y documentación del instrumento.':entry?.model?`Modelo: ${entry.model}`:product?'Consulta por este instrumento.':'Consulta por este servicio técnico.';
      panel.append(title,description);
      const text=`Hola, quisiera ${documentation?'consultar documentación de':'información sobre'} ${label}.${entry?.model?` Modelo: ${entry.model}.`:''} `;
      const waUrl=new URL(originalWhatsapp);waUrl.searchParams.set('text',text);whatsapp.href=waUrl.href;
      const mailUrl=new URL(originalMail);mailUrl.searchParams.set('subject',`Consulta · ${label}`);mailUrl.searchParams.set('body',text);mail.href=mailUrl.href;
    }
    if(writeUrl){
      const url=new URL(location.href);
      for(const key of ['producto','servicio','consulta','motivo'])url.searchParams.delete(key);
      if(product)url.searchParams.set('producto',product.id);
      if(service)url.searchParams.set('servicio',service.id);
      if(reason.value)url.searchParams.set('motivo',reason.value);
      history.replaceState(null,'',url);
    }
  }
  reason.addEventListener('change',()=>updateContext(true));
  instrument.addEventListener('change',()=>updateContext(true));
  form.addEventListener('reset',()=>queueMicrotask(()=>updateContext()));
  updateContext();
}
if(form&&context)enhanceInquiry(form,context);
