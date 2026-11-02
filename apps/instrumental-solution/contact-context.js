import {enhanceInquiry} from './contact.js';
const dataNode=document.querySelector('#contact-context-data');
const panel=document.querySelector('[data-contact-context]');
const form=document.querySelector('[data-inquiry-form]');
const context=dataNode?JSON.parse(dataNode.textContent):null;
// Same-page quote links preserve a draft and never replace a chosen reason.
document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-quote-trigger]');
  if(!trigger||!form)return;
  const reason=form.elements.motivo;
  if(reason&&!reason.value){reason.value='cotizacion';reason.dispatchEvent(new Event('change',{bubbles:true}));}
});
if(context&&panel){
  const data=context;
  const params=new URL(location.href).searchParams;
  const product=data.products.find(x=>x.id===params.get('producto'));
  const service=data.services.find(x=>x.id===params.get('servicio'));
  const entry=product??service;
  const documentation=params.get('consulta')==='documentacion';
  const reason=document.querySelector('#inquiry-reason');
  const instrument=document.querySelector('#inquiry-product');
  const validReasons=['cotizacion','asesoramiento','servicio','documentacion','otra'];
  const requestedReason=params.get('motivo');
  if(reason) reason.value=documentation?'documentacion':service?'servicio':product?'cotizacion':validReasons.includes(requestedReason)?requestedReason:'';
  if(instrument&&product) instrument.value=product.id;
  if(entry||documentation){
    const label=entry?.label??'Documentación técnica';
    const title=document.createElement('strong');title.textContent=label;panel.append(title);
    const description=document.createElement('p');description.textContent=documentation?'Consulta de manuales y documentación del instrumento.':entry?.model?`Modelo: ${entry.model}`:product?'Consulta por este instrumento.':'Consulta por este servicio técnico.';panel.append(description);panel.hidden=false;
    const text=`Hola, quisiera ${documentation?'consultar documentación de':'información sobre'} ${label}.${entry?.model?` Modelo: ${entry.model}.`:''} `;
    const whatsapp=document.querySelector('[data-context-whatsapp]');const mail=document.querySelector('[data-context-email]');
    const waUrl=new URL(whatsapp.href);waUrl.searchParams.set('text',text);whatsapp.href=waUrl.href;
    const mailUrl=new URL(mail.href);mailUrl.searchParams.set('subject',`Consulta · ${label}`);mailUrl.searchParams.set('body',text);mail.href=mailUrl.href;
  }
}
if(form&&context)enhanceInquiry(form,context);
