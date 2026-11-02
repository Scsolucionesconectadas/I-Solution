import {contactEndpoint,submitConsultation} from './contact-model.js';

export function enhanceInquiry(form,context) {
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
    if(!form.reportValidity())return;
    const product=context.products.find(p=>p.id===f.producto.value);
    const service=context.services.find(s=>s.id===new URL(location.href).searchParams.get('servicio'));
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
