// Public delivery address; never SMTP credentials or a secret key.
export const RECIPIENT='info@solution.com.ar';
export function contactEndpoint(value='') {
  if(value==='')return '';
  if(value!==`https://formsubmit.co/ajax/${RECIPIENT}`)throw new Error('El formulario de i-Solution solo admite el destinatario institucional configurado.');
  return value;
}

export class ContactError extends Error {
  constructor(code){super(code);this.name='ContactError';this.code=code;}
}

export function consultationPayload(fields) {
  const limits={name:100,company:140,email:160,phone:40,reason:100,instrument:220,service:160,message:1800,subject:120};
  const values={};
  for(const [key,max] of Object.entries(limits)){
    if(typeof fields[key]!=='string'&&fields[key]!==undefined)throw new ContactError('INVALID');
    const value=String(fields[key]??'').trim();
    if(value.length>max)throw new ContactError('INVALID');
    values[key]=value;
  }
  if(!values.name||!values.reason||values.message.length<10||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)||/[\r\n]/.test(values.email+values.subject)||String(fields._honey??'').trim())throw new ContactError('INVALID');
  let source;
  try{source=new URL(fields.source);}catch{throw new ContactError('INVALID');}
  if(!['http:','https:'].includes(source.protocol)||source.username||source.password)throw new ContactError('INVALID');
  const {subject,...content}=values;
  return {...content,_subject:subject||'[i-Solution] Consulta desde la web',_replyto:values.email,_template:'table',_honey:'',_url:source.origin+source.pathname};
}

export async function submitConsultation(endpoint,fields,{fetchImpl=globalThis.fetch,timeoutMs=15000}={}) {
  let target;
  try{target=contactEndpoint(endpoint);}catch{throw new ContactError('UNAVAILABLE');}
  if(!target)throw new ContactError('UNAVAILABLE');
  const payload=consultationPayload(fields);
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetchImpl(target,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify(payload),credentials:'omit',mode:'cors',redirect:'error',signal:controller.signal});
    if(response.status===429)throw new ContactError('RATE_LIMIT');
    if(!response.ok)throw new ContactError('REJECTED');
    const result=await response.json();
    if(result&&/needs?\s+activation|activate\s+(?:your\s+)?form/i.test(String(result.message??'')))throw new ContactError('ACTIVATION_REQUIRED');
    if(!result||typeof result!=='object'||'error' in result||'errors' in result||![true,'true'].includes(result.success))throw new ContactError('REJECTED');
    // Provider acceptance is not proof of inbox placement or actual reception.
    return {accepted:true};
  }catch(error){
    if(error instanceof ContactError)throw error;
    throw new ContactError(controller.signal.aborted?'TIMEOUT':'NETWORK');
  }finally{clearTimeout(timer);}
}
