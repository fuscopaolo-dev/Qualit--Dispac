import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
const source=await readFile(new URL('../web/data-service.js',import.meta.url),'utf8');
const content=JSON.parse(await readFile(new URL('../content.json',import.meta.url),'utf8'));
function setup(){
 const storage=new Map();let quota=false;
 const context=vm.createContext({window:{DISPAC_CONTENT:content,DISPAC_CONFIG:{}},crypto:webcrypto,TextEncoder,Uint8Array,URL,Blob,atob,setTimeout,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(quota)throw Error('quota');storage.set(k,v)}}});
 vm.runInContext(source,context);
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
