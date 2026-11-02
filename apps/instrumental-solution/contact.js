import {contactEndpoint,submitConsultation} from './contact-model.js';
import {installFormValidation} from './form-validation.js';

export function installDraftGuard(form) {
  const fields=['nombre','empresa','correo','telefono','motivo','producto','mensaje'];
  const snapshot=()=>JSON.stringify(fields.map(name=>form.elements.namedItem(name)?.value||''));
  let initial=snapshot(),listening=false;
  const warn=event=>{event.preventDefault();event.returnValue='';};
  const sync=()=>{
    const dirty=snapshot()!==initial;
    form.dataset.dirty=String(dirty);
    if(dirty&&!listening){addEventListener('beforeunload',warn);listening=true;}
    else if(!dirty&&listening){removeEventListener('beforeunload',warn);listening=false;}
  };
  const clean=()=>{initial=snapshot();sync();};
  form.addEventListener('input',sync);
  form.addEventListener('change',sync);
  addEventListener('pageshow',sync);
  sync();
  return {clean};
}

export function enhanceInquiry(form,context) {
  const validation=installFormValidation(form);
  const draft=installDraftGuard(form);
  const submit=form.querySelector('[type=submit]');
  const label=submit.querySelector('[data-submit-label]');
  const status=form.querySelector('[data-inquiry-status]');
  let endpoint='';
  try{endpoint=contactEndpoint(form.dataset.endpoint);}catch{}
  submit.disabled=!endpoint;
  submit.removeAttribute('aria-label');
  const show=(state,text)=>{
    form.dataset.state=state;
    status.textContent=text;
    status.hidden=false;
    if(state!=='sending')status.focus({preventScroll:true});
  };
  form.addEventListener('input',event=>{
    event.target.setCustomValidity?.('');
    if(form.dataset.state!=='sending'){form.dataset.state='idle';status.hidden=true;}
  });
  // Installing the handler performs no network request. Only a visitor's submit sends.
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(form.dataset.state==='sending')return;
    if(!endpoint){show('error','No pudimos completar el envío por este medio. Podés escribirnos a info@solution.com.ar.');return;}
    const f=form.elements;
    f.nombre.setCustomValidity(f.nombre.value.trim()?'':'Escribí tu nombre.');
    f.mensaje.setCustomValidity(f.mensaje.value.trim().length>=10?'':'Contanos tu consulta en al menos 10 caracteres.');
    if(!validation.validate())return;
    const product=context.products.find(p=>p.id===f.producto.value);
    const service=f.motivo.value==='servicio'?context.services.find(s=>s.id===form.dataset.service):null;
    const fields={name:f.nombre.value,company:f.empresa.value,email:f.correo.value,phone:f.telefono.value,reason:f.motivo.selectedOptions[0].textContent,instrument:product?.label??'',service:service?.label??'',message:f.mensaje.value,_honey:f._honey.value,subject:form.dataset.subject,source:location.origin+location.pathname};
    const reasonValue=f.motivo.value,productValue=f.producto.value;
    const controls=[...form.querySelectorAll('input,select,textarea,button')];
    const disabled=controls.map(c=>c.disabled);
    controls.forEach(c=>c.disabled=true);
    form.setAttribute('aria-busy','true');
    label.textContent='Enviando consulta…';
    show('sending','Estamos enviando tu consulta.');
    try{
      await submitConsultation(endpoint,fields);
      form.reset();
      f.motivo.value=reasonValue;
      f.producto.value=productValue;
      draft.clean();
      show('success','Tu consulta fue enviada. Gracias por comunicarte con i-Solution.');
    }catch(error){
      const message=error.code==='RATE_LIMIT'?'Hubo varios intentos seguidos. Esperá unos minutos antes de volver a enviar.':error.code==='NETWORK'||error.code==='TIMEOUT'?'No pudimos confirmar el envío. Conservamos tu consulta para que puedas reintentar o escribirnos por correo.':'No pudimos completar el envío por este medio. Conservamos tu consulta; también podés escribirnos a info@solution.com.ar.';
      show('error',message);
    }finally{
      controls.forEach((c,i)=>c.disabled=disabled[i]);
      form.removeAttribute('aria-busy');
      label.textContent='Enviar consulta';
    }
  });
}
