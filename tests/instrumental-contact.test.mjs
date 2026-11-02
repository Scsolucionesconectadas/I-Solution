import test from 'node:test';
import assert from 'node:assert/strict';
import {contactEndpoint,consultationPayload,submitConsultation,ContactError} from '../apps/instrumental-solution/contact-model.js';

// All transport tests inject a local fake fetch. No provider or mailbox is contacted.
const endpoint='https://formsubmit.co/ajax/info@solution.com.ar';
const fields={name:'Persona local',email:'persona@example.invalid',company:'Empresa',phone:'123',reason:'Cotización de instrumentos',instrument:'Radar de nivel · Serie 26 GHz',service:'',message:'Consulta local con datos suficientes.',subject:'[i-Solution] Consulta desde la web',source:'https://example.invalid/instrumental-solution/contacto/?producto=radar#formulario',_honey:''};
const code=expected=>error=>error instanceof ContactError&&error.code===expected;

test('i-Solution solo admite su destinatario y no acepta otro correo, parámetros o credenciales',()=>{
  assert.equal(contactEndpoint(endpoint),endpoint);
  assert.equal(contactEndpoint(''),'');
  for(const value of ['https://formsubmit.co/ajax/otro@example.invalid',endpoint+'?cc=otra','http://formsubmit.co/ajax/info@solution.com.ar','https://usuario:clave@formsubmit.co/ajax/info@solution.com.ar'])assert.throws(()=>contactEndpoint(value));
});

test('payload explícito con Reply-To, sin CC, autorespuesta, redirecciones o datos de URL',()=>{
  const p=consultationPayload({...fields,to:'otro@example.invalid',_cc:'otro@example.invalid',_next:'https://example.invalid',_autoresponse:'no'});
  assert.equal(p._replyto,fields.email);
  assert.equal(p._url,'https://example.invalid/instrumental-solution/contacto/');
  assert.equal(p._template,'table');
  for(const name of ['to','_cc','_next','_autoresponse','_captcha'])assert.equal(p[name],undefined);
  assert.equal(p.instrument,fields.instrument);
});

test('configuración ausente y campos inválidos no invocan el transporte',async()=>{
  let calls=0;
  const options={fetchImpl:async()=>{calls++;}};
  await assert.rejects(submitConsultation('',fields,options),code('UNAVAILABLE'));
  for(const patch of [{name:'  '},{reason:''},{email:'sin-correo'},{message:'corto'},{message:'x'.repeat(1801)},{_honey:'bot'},{subject:'Asunto\r\nCC: tercero'},{source:'javascript:alert(1)'}])await assert.rejects(submitConsultation(endpoint,{...fields,...patch},options),code('INVALID'));
  assert.equal(calls,0);
});

test('aceptación requiere el éxito explícito del proveedor; no basta HTTP200',async()=>{
  let calls=0;
  const fake=async(target,options)=>{calls++;assert.equal(target,endpoint);assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');assert.equal(options.method,'POST');assert.equal(JSON.parse(options.body).email,fields.email);return new Response('{"success":"true"}',{status:200});};
  assert.deepEqual(await submitConsultation(endpoint,fields,{fetchImpl:fake}),{accepted:true});
  assert.equal(calls,1);
  for(const body of [{},{success:false},{success:'false'},{success:true,errors:[]}])await assert.rejects(submitConsultation(endpoint,fields,{fetchImpl:async()=>new Response(JSON.stringify(body),{status:200})}),code('REJECTED'));
});

test('activación, límite y caída de red se distinguen y no se reintentan automáticamente',async()=>{
  await assert.rejects(submitConsultation(endpoint,fields,{fetchImpl:async()=>new Response('{"success":false,"message":"This form needs Activation."}',{status:200})}),code('ACTIVATION_REQUIRED'));
  await assert.rejects(submitConsultation(endpoint,fields,{fetchImpl:async()=>new Response('{}',{status:429})}),code('RATE_LIMIT'));
  let calls=0;
  await assert.rejects(submitConsultation(endpoint,fields,{fetchImpl:async()=>{calls++;throw new Error('offline');}}),code('NETWORK'));
  assert.equal(calls,1);
});

test('una solicitud que agota el tiempo se cancela sin repetir el envío',async()=>{
  let calls=0;
  await assert.rejects(submitConsultation(endpoint,fields,{timeoutMs:10,fetchImpl:async(_url,{signal})=>{
    calls++;
    return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('cancelado')),{once:true}));
  }}),code('TIMEOUT'));
  assert.equal(calls,1);
});
