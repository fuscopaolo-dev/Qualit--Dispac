import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
const source=await readFile(new URL('../web/data-service.js',import.meta.url),'utf8');
const demoSource=await readFile(new URL('../web/demo-data.js',import.meta.url),'utf8');
const content=JSON.parse(await readFile(new URL('../content.json',import.meta.url),'utf8'));
function setup(){
 const storage=new Map();let quota=false;
 const context=vm.createContext({window:{DISPAC_CONTENT:content,DISPAC_CONFIG:{}},crypto:webcrypto,TextEncoder,Uint8Array,URL,Blob,atob,btoa,setTimeout,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(quota)throw Error('quota');storage.set(k,v)}}});
 vm.runInContext(demoSource,context);vm.runInContext(source,context);
 return {service:context.window.DQService,storage,setQuota:()=>quota=true};
}
const account={username:'test.user',display_name:'Utente Test',password:'UnaPassword12345!'};
const record={code:'INT.00',step:null,subject:'Attività di prova',description:'Nota conservata',activity_date:'2026-11-11',status:'aperta'};
test('registrazione, accesso, attività, ricerca, storico, allegati e isolamento',async()=>{
 const {service:s,storage}=setup(),api=s.request;
 await assert.rejects(api('/api/records'),/Accedi/);
 await assert.rejects(api('/api/register','POST',{...account,password:'short'}),/password/);
 await api('/api/register','POST',account);
 await assert.rejects(api('/api/register','POST',{...account,username:'TEST.USER'}),/già utilizzato/);
 assert.equal([...storage.values()][0].includes(account.password),false);
 await assert.rejects(api('/api/login','POST',{...account,password:'wrong'}),/Credenziali/);
 await api('/api/login','POST',account);
 assert.equal((await api('/api/me')).user.role,'delegato');
 const {id}=await api('/api/records','POST',record);
 await api('/api/records','POST',{...record,id,status:'conclusa'});
 assert.equal((await api('/api/history/'+id)).history.length,2);
 assert.equal((await api('/api/records?status=aperta')).records.length,0);
 await api('/api/attachment','POST',{record_id:id,name:'verbale.txt',data:'dGVzdA=='});
 assert.equal((await api('/api/records?search=verbale')).records[0].attachments[0].size,4);
 const file=await s.attachment(1);assert.equal(await file.blob.text(),'test');
 assert.equal((await api('/api/records?search=assente')).records.length,0);
 await api('/api/logout','POST',{});
 await api('/api/register','POST',{...account,username:'second.user'});await api('/api/login','POST',{...account,username:'second.user'});
 assert.equal((await api('/api/records')).records.length,0);
 await api('/api/logout','POST',{});s.enterDemo();
 assert.equal((await api('/api/content')).process.subprocesses.length,8);
 await assert.rejects(api('/api/records','POST',record),/consultazione/);
});
test('errore quota non dichiara riuscito il salvataggio',async()=>{
 const {service:s,setQuota}=setup();await s.request('/api/register','POST',account);await s.request('/api/login','POST',account);setQuota();
 await assert.rejects(s.request('/api/records','POST',record),/Salvataggio non riuscito/);
 assert.equal((await s.request('/api/records')).records.length,0);
});
test('ripristino validato e rifiuto di copie non valide',async()=>{
 const {service:s}=setup();await s.request('/api/register','POST',account);await s.request('/api/login','POST',account);
 const id=(await s.request('/api/records','POST',record)).id;
 const rows=(await s.request('/api/records')).records;
 s.importArchive(JSON.stringify({format:'dispac-archive',version:1,archive:{records:rows,history:[],attachments:[]}}));
 assert.equal((await s.request('/api/records')).records[0].id,id);
 assert.throws(()=>s.importArchive('{"archive":{}}'),/non valida/);
 assert.equal((await s.request('/api/records')).records.length,1);
});

test('demo Paperopoli completa, documenti UTF-8 e laboratorio isolato',async()=>{
 const {service:s,storage}=setup();s.enterDemo();
 const demo=(await s.request('/api/records')).records;
 assert.equal(demo.length,9);
 assert.equal(new Set(demo.map(r=>r.code)).size,9);
 for(const row of demo){
  assert.equal(row.attachments.length,1);
  assert.ok((await s.request('/api/history/'+row.id)).history.length);
  const attachment=await s.attachment(row.attachments[0].id);
  assert.match(await attachment.blob.text(),/ESEMPIO FITTIZIO · PAPEROPOLI/);
 }
 await assert.rejects(s.request('/api/records','POST',record),/consultazione/);
 s.enterSandbox();const id=(await s.request('/api/records','POST',record)).id;
 await s.request('/api/attachment','POST',{record_id:id,name:'prova.txt',data:'dGVzdA=='});
 await s.request('/api/records','POST',{...record,id,status:'conclusa'});
 assert.equal((await s.request('/api/records')).records.length,10);
 assert.equal((await s.request('/api/history/'+id)).history.length,2);
 assert.equal(storage.size,0);
 assert.throws(()=>s.importArchive('{}'),/Accedi/);
 s.enterDemo();assert.equal((await s.request('/api/records')).records.length,9);
 await s.request('/api/register','POST',account);await s.request('/api/login','POST',account);
 assert.equal((await s.request('/api/records')).records.length,0);
});

test('modelli e bozze personali: isolamento, ripresa e completamento atomico',async()=>{
 const {service:s,storage,setQuota}=setup(),api=s.request;
 await api('/api/register','POST',account);await api('/api/login','POST',account);
 const templateId=(await api('/api/templates','POST',{name:'Verifica',kind:'activity',payload:{...record,id:99,status:'conclusa',attachments:[{id:42}]}})).id;
 const template=(await api('/api/templates')).templates[0];assert.equal(template.id,templateId);assert.equal(template.payload.status,undefined);assert.equal(template.payload.activity_date,undefined);assert.equal(template.payload.id,undefined);assert.equal(template.payload.attachments,undefined);
 await assert.rejects(api('/api/templates','POST',{name:'verifica',kind:'activity',payload:record}),/già/);
 const draftId=(await api('/api/drafts','POST',{kind:'activity',phase:1,payload:{...record,subject:'',activity_date:''}})).id;
 assert.equal((await api('/api/records')).records.length,0);
 await api('/api/logout','POST',{});await api('/api/login','POST',account);
 assert.equal((await api('/api/drafts')).drafts[0].payload.subject,'');
 await assert.rejects(api('/api/records','POST',{...record,subject:'',draft_id:draftId}),/Oggetto/);
 assert.equal((await api('/api/drafts')).drafts.length,1);
 const id=(await api('/api/records','POST',{...record,draft_id:draftId})).id;
 assert.equal((await api('/api/drafts')).drafts.length,0);assert.equal((await api('/api/history/'+id)).history.length,1);
 const editDraft=(await api('/api/drafts','POST',{kind:'activity',phase:2,record_id:id,payload:{...record,subject:'Modifica in bozza'}})).id;
 assert.equal((await api('/api/records')).records[0].subject,record.subject);
 await assert.rejects(api('/api/records','POST',{...record,draft_id:editDraft}),/altra|un’altra/);
 await api('/api/records','POST',{...record,id,draft_id:editDraft,subject:'Aggiornata'});
 assert.equal((await api('/api/history/'+id)).history.length,2);
 const docDraft=(await api('/api/drafts','POST',{kind:'document',phase:0,payload:{title:'',body:'Appunti',format:'rtf'}})).id;
 await assert.rejects(api('/api/documents','POST',{payload:{title:'',body:'Appunti',format:'rtf'},draft_id:docDraft}),/Completa/);
 const docId=(await api('/api/documents','POST',{payload:{title:'Verbale',body:'Città — decisioni',format:'rtf'},draft_id:docDraft})).id;
 assert.equal((await api('/api/drafts')).drafts.length,0);assert.equal((await api('/api/documents')).documents[0].id,docId);
 const exported=JSON.parse([...storage.values()][0]);const archive=Object.values(exported.archives)[0];
 s.importArchive(JSON.stringify({format:'dispac-archive',version:1,archive}));assert.equal((await api('/api/documents')).documents.length,1);assert.equal((await api('/api/templates')).templates.length,1);
 await api('/api/logout','POST',{});await api('/api/register','POST',{...account,username:'altro.user'});await api('/api/login','POST',{...account,username:'altro.user'});
 assert.equal((await api('/api/templates')).templates.length,0);assert.equal((await api('/api/documents')).documents.length,0);
 await assert.rejects(api('/api/templates/'+templateId,'DELETE'),/non trovato/);
 await api('/api/logout','POST',{});await api('/api/login','POST',account);
 const kept=(await api('/api/drafts','POST',{kind:'document',phase:0,payload:{title:'Documento',body:'Testo',format:'txt'}})).id;
 setQuota();await assert.rejects(api('/api/documents','POST',{payload:{title:'Documento',body:'Testo',format:'txt'},draft_id:kept}),/Salvataggio non riuscito/);
 assert.equal((await api('/api/drafts')).drafts[0].id,kept);assert.equal((await api('/api/documents')).documents.length,1);
});

test('validazione libreria, vecchi backup e ruoli',async()=>{
 const {service:s,storage}=setup(),api=s.request;s.enterDemo();await assert.rejects(api('/api/drafts','POST',{}),/consultazione/);
 s.enterSandbox();await api('/api/templates','POST',{name:'Sandbox',kind:'document',payload:{title:'',body:'',format:'txt'}});assert.equal(storage.size,0);
 s.enterDemo();assert.equal((await api('/api/templates')).templates.length,0);
 await api('/api/register','POST',account);await api('/api/login','POST',account);
 s.importArchive(JSON.stringify({format:'dispac-archive',version:1,archive:{records:[],history:[],attachments:[]}}));assert.equal((await api('/api/drafts')).drafts.length,0);
 const bad={format:'dispac-archive',version:1,archive:{records:[],history:[],attachments:[],templates:[{id:'test',name:'X',kind:'document',payload:{title:'',body:'',format:'exe'},created_at:'today',updated_at:'today'}]}};
 assert.throws(()=>s.importArchive(JSON.stringify(bad)),/Formato/);
 await assert.rejects(api('/api/drafts','POST',{kind:'document',phase:4,payload:{title:'',body:'',format:'txt'}}),/Passaggio/);
 await assert.rejects(api('/api/drafts','POST',{kind:'activity',phase:1,record_id:999,payload:record}),/origine/);
});
