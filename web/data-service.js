/* One boundary for browser storage or a future same-origin PHP/SQL endpoint. */
'use strict';
window.DQService = (() => {
  const key = 'dispac.qualita.v1';
  let session = null, demoArchive = null;
  const config = window.DISPAC_CONFIG || {};
  const local = !config.apiUrl;
  const clone = value => JSON.parse(JSON.stringify(value));
  const fail = message => { throw Error(message); };
  function read() {
    try {
      const raw = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : {version:1, users:[], archives:{}};
      if(data.version!==1 || !Array.isArray(data.users) || typeof data.archives!=='object') fail('Formato archivio non riconosciuto.');
      return data;
    } catch(error) { fail('Archivio locale non accessibile. Abilita il salvataggio nel browser e non cancellare i dati del sito. '+error.message); }
  }
  function write(data) {
    try { localStorage.setItem(key, JSON.stringify(data)); }
    catch { fail('Salvataggio non riuscito: spazio del browser esaurito o archiviazione disabilitata. Esporta una copia dei dati.'); }
  }
  async function hash(password, salt) {
    if(!crypto.subtle) fail('Questo browser richiede un contesto sicuro: apri il file HTML direttamente oppure usa HTTPS.');
    const material = await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt:Uint8Array.from(salt),iterations:210000,hash:'SHA-256'},material,256);
    return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
  }
  function validateRecord(row) {
    const sub=window.DISPAC_CONTENT.process.subprocesses.find(s=>s.code===row.code);
    if(row.code!=='INT.00'&&!sub) fail('Processo non valido.');
    if(typeof row.subject!=='string'||!row.subject.trim()||row.subject.length>250) fail('Oggetto non valido (massimo 250 caratteri).');
    if(typeof row.description!=='string'||row.description.length>10000) fail('Annotazioni troppo lunghe (massimo 10000 caratteri).');
    if(!['aperta','in_corso','conclusa'].includes(row.status)||!/^\d{4}-\d{2}-\d{2}$/.test(row.activity_date)) fail('Stato o data non validi.');
    if(row.step!==null&&(!sub||!Number.isInteger(Number(row.step))||Number(row.step)<1||Number(row.step)>sub.steps.length)) fail('Passaggio non valido.');
  }
  const formats=['txt','rtf','md'];
  function textField(value,max,label){if(typeof value!=='string'||value.length>max)fail(label+' non valido (massimo '+max+' caratteri).');return value;}
  function payload(kind,value,template=false){
    if(!value||typeof value!=='object'||Array.isArray(value))fail('Contenuto non valido.');
    if(kind==='document')return {title:textField(value.title??'',250,'Titolo'),body:textField(value.body??'',1000000,'Testo'),format:formats.includes(value.format)?value.format:fail('Formato non valido.')};
    if(kind!=='activity')fail('Tipo non valido.');
    const row={code:value.code??'INT.00',step:value.step==null||value.step===''?null:Number(value.step),subject:textField(value.subject??'',250,'Oggetto'),description:textField(value.description??'',10000,'Annotazioni')};
    validateRecord({...row,subject:row.subject.trim()||'Bozza',activity_date:'2026-01-01',status:'aperta'});
    if(!template){row.activity_date=value.activity_date??'';row.status=value.status??'aperta';if(row.activity_date!==''&&!/^\d{4}-\d{2}-\d{2}$/.test(row.activity_date))fail('Data non valida.');if(!['aperta','in_corso','conclusa'].includes(row.status))fail('Stato non valido.');}
    return row;
  }
  function validateLibrary(archive){
    for(const key of ['templates','drafts','documents']){if(archive[key]===undefined)archive[key]=[];if(!Array.isArray(archive[key]))fail('Raccolta '+key+' non valida.');}
    for(const key of ['templates','drafts','documents']){
      const ids=new Set();
      for(const item of archive[key]){
        if(!item||typeof item.id!=='string'||!/^[a-zA-Z0-9-]{1,64}$/.test(item.id)||ids.has(item.id)||typeof item.created_at!=='string'||typeof item.updated_at!=='string')fail('Identificativo o data non validi in '+key+'.');ids.add(item.id);
        if(key==='documents'){const data=payload('document',item.payload);if(!data.title.trim()||!data.body.trim()||typeof item.author!=='string')fail('Documento incompleto.');}
        else {payload(item.kind,item.payload,key==='templates');if(key==='templates'&&(!textField(item.name,100,'Nome modello').trim()))fail('Nome modello vuoto.');if(key==='drafts'&&(!Number.isInteger(item.phase)||item.phase<0||item.phase>2||item.kind==='document'&&item.phase!==0||item.record_id!=null&&(item.kind!=='activity'||!archive.records.some(r=>r.id===item.record_id))||item.document_id!=null&&(item.kind!=='document'||!archive.documents.some(d=>d.id===item.document_id))))fail('Riferimento bozza non valido.');}
      }
    }
  }
  function sourceDraft(archive,id,kind){if(id==null)return null;const draft=(archive.drafts||[]).find(d=>d.id===id&&d.kind===kind);if(!draft)fail('Bozza non trovata.');return draft;}
  function download(blob, name) {
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function request(url, method='GET', body=null, options={}) {
    if(!local) {
      // Only this function knows the HTTP transport. api.php receives ?route=/records.
      const parsed=new URL(url,'https://local.invalid');
      const target=new URL(config.apiUrl,location.href);
      for(const [name,value] of parsed.searchParams) target.searchParams.set(name,value);
      target.searchParams.set('route',parsed.pathname.replace(/^\/api/,''));
      const headers={Accept:'application/json'};
      if(method!=='GET'){headers['Content-Type']='application/json';headers['X-CSRF-Token']=session?.csrf||'';}
      const response=await fetch(target,{method,credentials:'same-origin',headers,body:body===null?undefined:JSON.stringify(body)});
      if(!response.ok){const error=await response.json().catch(()=>({}));fail(error.error||'Richiesta non riuscita ('+response.status+').');}
      if(parsed.pathname.startsWith('/api/attachment/')||parsed.pathname==='/api/backup'){
        const blob=await response.blob();if(options.preview)return {blob};download(blob,parsed.pathname==='/api/backup'?'dispac-backup.zip':'allegato');return {ok:true};
      }
      const result=await response.json();if(parsed.pathname==='/api/me')session=result.user;
      return result;
    }
    const parsed=new URL(url,'https://local.invalid'),path=parsed.pathname,q=parsed.searchParams;
    if(path==='/api/me')return {user:session};
    if(path==='/api/logout'){session=null;demoArchive=null;return {ok:true};}
    if(path==='/api/register') {
      const username=String(body.username||'').trim(),display_name=String(body.display_name||'').trim(),password=String(body.password||'');
      if(!/^[A-Za-z0-9._-]{3,40}$/.test(username))fail('Nome utente non valido.');
      if(!display_name||display_name.length>100)fail('Inserisci nome e cognome.');
      if(password.length<12||password.length>256)fail('La password deve contenere da 12 a 256 caratteri.');
      const salt=Array.from(crypto.getRandomValues(new Uint8Array(16))),password_hash=await hash(password,salt);
      const data=read();if(data.users.some(u=>u.username.toLowerCase()===username.toLowerCase()))fail('Nome utente già utilizzato in questo browser.');
      const id=crypto.randomUUID();data.users.push({id,username,display_name,salt,password_hash});data.archives[id]={records:[],history:[],attachments:[]};write(data);return {ok:true};
    }
    if(path==='/api/login') {
      const data=read(),account=data.users.find(u=>u.username.toLowerCase()===String(body.username).toLowerCase());
      if(!account||await hash(String(body.password),account.salt)!==account.password_hash)fail('Credenziali non valide.');
      session={id:account.id,username:account.username,display_name:account.display_name,role:'delegato'};return {ok:true};
    }
    if(!session)fail('Accedi per continuare.');
    if(path==='/api/content')return clone(window.DISPAC_CONTENT);
    const data=['demo','sandbox'].includes(session.id)?null:read(),archive=data?data.archives[session.id]:demoArchive;
    if(!archive)fail('Archivio non trovato. Accedi nuovamente.');
    if(method!=='GET'&&session.role==='lettore')fail('La demo permette solo la consultazione.');
    // Old archives remain valid; collections are created lazily, per account.
    archive.templates??=[];archive.drafts??=[];archive.documents??=[];
    const library=/^\/api\/(templates|drafts|documents)(?:\/([a-zA-Z0-9-]{1,64}))?$/.exec(path);
    if(library){
      const [,collection,itemId]=library,items=archive[collection];
      if(method==='GET'&&!itemId)return {[collection]:clone([...items].sort((a,b)=>b.updated_at.localeCompare(a.updated_at)))};
      if(method==='DELETE'&&itemId){if(collection==='documents')fail('Operazione non disponibile.');const index=items.findIndex(item=>item.id===itemId);if(index<0)fail('Elemento non trovato.');items.splice(index,1);if(data)write(data);return {ok:true};}
      if(method==='POST'&&!itemId){
        const prior=body.id==null?null:items.find(item=>item.id===body.id);if(body.id!=null&&!prior)fail('Elemento non trovato.');
        const now=new Date().toISOString(),id=prior?.id||crypto.randomUUID();let row;
        if(collection==='templates'){
          const name=textField(body.name,100,'Nome modello').trim();if(!name)fail('Dai un nome al modello.');if(items.some(item=>item.id!==id&&item.name.toLocaleLowerCase()===name.toLocaleLowerCase()))fail('Esiste già un modello con questo nome.');
          row={id,name,kind:body.kind,payload:payload(body.kind,body.payload,true),created_at:prior?.created_at||now,updated_at:now};
        }else if(collection==='drafts'){
          if(!Number.isInteger(body.phase)||body.phase<0||body.phase>2||body.kind==='document'&&body.phase!==0)fail('Passaggio di compilazione non valido.');
          if(body.record_id!=null&&(body.kind!=='activity'||!archive.records.some(r=>r.id===body.record_id)))fail('Attività di origine non trovata.');
          if(body.document_id!=null&&(body.kind!=='document'||!archive.documents.some(d=>d.id===body.document_id)))fail('Documento di origine non trovato.');
          row={id,kind:body.kind,payload:payload(body.kind,body.payload),phase:body.phase,record_id:body.record_id??null,document_id:body.document_id??null,created_at:prior?.created_at||now,updated_at:now};
        }else{
          const content=payload('document',body.payload);if(!content.title.trim()||!content.body.trim())fail('Completa titolo e testo, oppure salva come bozza.');
          const draft=sourceDraft(archive,body.draft_id,'document');if(draft&&(draft.document_id??null)!==(prior?.id??null))fail('La bozza appartiene a un altro documento.');
          row={id,payload:content,author:prior?.author||session.display_name,created_at:prior?.created_at||now,updated_at:now};
          if(draft)archive.drafts=archive.drafts.filter(d=>d.id!==draft.id);
        }
        if(prior)Object.assign(prior,row);else items.push(row);if(data)write(data);return {ok:true,id};
      }
      fail('Operazione non disponibile.');
    }
    if(path==='/api/records'&&method==='GET') {
      const search=(q.get('search')||'').toLowerCase();
      const records=archive.records.filter(r=>(!q.get('code')||q.get('code')==='all'||r.code===q.get('code'))&&(!q.get('status')||q.get('status')==='all'||r.status===q.get('status'))&&(!q.get('from')||r.activity_date>=q.get('from'))&&(!q.get('to')||r.activity_date<=q.get('to'))&&(!search||[r.subject,r.description,...r.attachments.map(a=>a.file_name)].some(v=>v.toLowerCase().includes(search))));
      return {records:clone(records.sort((a,b)=>b.activity_date.localeCompare(a.activity_date)||b.id-a.id))};
    }
    if(path==='/api/records'&&method==='POST') {
      validateRecord(body);
      const draft=sourceDraft(archive,body.draft_id,'activity');if(draft&&(draft.record_id??null)!==(body.id??null))fail('La bozza appartiene a un’altra attività.');
      const prior=body.id==null?null:archive.records.find(r=>r.id===Number(body.id));
      if(body.id!=null&&!prior)fail('Registrazione non trovata.');
      const now=new Date().toISOString(),id=prior?.id||Math.max(0,...archive.records.map(r=>r.id))+1;
      const row={id,code:body.code,step:body.step==null?null:Number(body.step),subject:body.subject.trim(),description:body.description,status:body.status,activity_date:body.activity_date,author:prior?.author||session.display_name,created_at:prior?.created_at||now,updated_at:now,attachments:prior?.attachments||[]};
      if(prior)Object.assign(prior,row);else archive.records.push(row);
      archive.history.push({record_id:id,action:prior?'aggiornamento':'creazione',author:session.display_name,at:now,snapshot:JSON.stringify(row)});
      if(draft)archive.drafts=archive.drafts.filter(d=>d.id!==draft.id);
      if(data)write(data);return {ok:true,id};
    }
    if(path.startsWith('/api/history/'))return {history:clone(archive.history.filter(h=>h.record_id===Number(path.split('/').pop())).reverse())};
    if(path==='/api/attachment'&&method==='POST') {
      const record=archive.records.find(r=>r.id===Number(body.record_id));if(!record)fail('Registrazione non trovata.');
      const bytes=Uint8Array.from(atob(body.data),c=>c.charCodeAt(0));if(bytes.length>2*1024*1024)fail('Dimensione massima locale: 2 MB.');
      if(!body.name||body.name.length>180)fail('Nome file non valido.');
      const id=Math.max(0,...archive.attachments.map(a=>a.id))+1;
      const attachment={id,file_name:body.name,size:bytes.length,created_at:new Date().toISOString()};
      record.attachments.push(attachment);archive.attachments.push({...attachment,data:body.data});if(data)write(data);return {ok:true};
    }
    if(path.startsWith('/api/attachment/')) {
      const item=archive.attachments.find(a=>a.id===Number(path.split('/').pop()));if(!item)fail('Allegato non trovato.');
      const blob=new Blob([Uint8Array.from(atob(item.data),c=>c.charCodeAt(0))],{type:'application/octet-stream'});if(options.preview)return {blob};download(blob,item.file_name);return {ok:true};
    }
    fail('Funzione non disponibile.');
  }
  return {
    local,request,
    attachment(id){return request('/api/attachment/'+id,'GET',null,{preview:true});},
    enterDemo(){demoArchive=window.DQDemoArchive();session={id:'demo',display_name:'Visitatore demo',role:'lettore'};},
    enterSandbox(){demoArchive=window.DQDemoArchive();session={id:'sandbox',display_name:'Paperino · laboratorio',role:'delegato'};},
    exportArchive(){if(!session||['demo','sandbox'].includes(session.id))fail('Accedi a un account locale.');const data=read();download(new Blob([JSON.stringify({format:'dispac-archive',version:1,archive:data.archives[session.id]},null,2)],{type:'application/json'}),'dispac-archivio.json');},
    importArchive(text){
      if(!session||['demo','sandbox'].includes(session.id))fail('Accedi a un account locale.');
      const backup=JSON.parse(text),a=backup.archive;
      if(backup.format!=='dispac-archive'||backup.version!==1||!a||!Array.isArray(a.records)||!Array.isArray(a.history)||!Array.isArray(a.attachments))fail('Copia di sicurezza non valida.');
      const ids=new Set();
      for(const r of a.records){validateRecord(r);if(!Number.isSafeInteger(r.id)||r.id<1||ids.has(r.id)||typeof r.author!=='string'||typeof r.created_at!=='string'||typeof r.updated_at!=='string'||!Array.isArray(r.attachments))fail('Registrazioni non valide.');ids.add(r.id);}
      const attachmentIds=new Set();
      for(const item of a.attachments){if(!Number.isSafeInteger(item.id)||attachmentIds.has(item.id)||typeof item.file_name!=='string'||typeof item.created_at!=='string'||typeof item.data!=='string'||atob(item.data).length>2*1024*1024||item.size!==atob(item.data).length)fail('Allegati non validi.');attachmentIds.add(item.id);}
      for(const r of a.records)for(const item of r.attachments){const original=a.attachments.find(x=>x.id===item.id);if(!original||original.file_name!==item.file_name||original.size!==item.size)fail('Riferimento allegato non valido.');}
      for(const h of a.history)if(!ids.has(h.record_id)||typeof h.action!=='string'||typeof h.author!=='string'||typeof h.at!=='string'||typeof h.snapshot!=='string')fail('Storico non valido.');
      validateLibrary(a);
      const data=read();data.archives[session.id]=clone(a);write(data);
    }
  };
})();
