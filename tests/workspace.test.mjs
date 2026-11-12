import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
const context=vm.createContext({window:{createDQDocumentPreview:()=>({}),addEventListener(){}},document:{addEventListener(){}},Blob,TextEncoder,crypto:webcrypto,setInterval(){}});
vm.runInContext(await readFile(new URL('../web/workspace.js',import.meta.url),'utf8'),context);
const {noteName,createNote,readTree}=context.window.DQWorkspace;
test('nomi delle note compatibili con percorsi Mac e Windows',()=>{
 assert.equal(noteName(' Verbale qualità.txt '),'Verbale qualità');
 for(const name of ['', '../fuori','sotto/cartella','C:\\file','CON','con.txt','LPT1','COM9','nome.','a?b','.nascosto','a\u0000b'])assert.throws(()=>noteName(name),/nome/i,name);
});
test('nuove note senza sovrascrivere file e pulizia in caso di scrittura fallita',async()=>{
 const writes=[];const root={getFileHandle:async(name,options)=>{if(!options)throw Object.assign(Error(),{name:'NotFoundError'});return {createWritable:async()=>({write:async value=>writes.push([name,value]),close:async()=>{}})}}};
 const name=await createNote(root,'Riunione Paperina','Decisioni da conservare');assert.match(name,/^Riunione Paperina-.*\.txt$/);assert.equal(writes[0][1],'Decisioni da conservare');
 const collisions={getFileHandle:async()=>({})};await assert.rejects(createNote(collisions,'Nota','contenuto'),/Esiste già/);
 let removed=false,aborted=false;const failing={getFileHandle:async(name,options)=>{if(!options)throw Object.assign(Error(),{name:'NotFoundError'});return {createWritable:async()=>({write:async()=>{throw Error('quota')},abort:async()=>{aborted=true}})}},removeEntry:async()=>{removed=true}};
 await assert.rejects(createNote(failing,'Nota','contenuto'),/quota/);assert.equal(removed,true);assert.equal(aborted,true);
});
test('lettura ricorsiva, limite esplicito e nessuna modifica alla cartella',async()=>{
 const file=name=>({kind:'file',name,getFile:async()=>({size:40,lastModified:100})});
 const nested={kind:'directory',name:'Verbali',async *values(){yield file('Paperina.txt')}};
 const folder={async *values(){yield nested;yield file('.nascosto');yield file('Pico.txt')}};
 const result=await readTree(folder);assert.deepEqual(Array.from(result.files,f=>f.path),['Pico.txt','Verbali/Paperina.txt']);assert.equal(result.partial,false);
 const huge={async *values(){for(let i=0;i<502;i++)yield file('file-'+i+'.txt')}};
 const capped=await readTree(huge);assert.equal(capped.files.length,500);assert.equal(capped.partial,true);
});
