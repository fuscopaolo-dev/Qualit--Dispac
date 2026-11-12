/* Browser-only personal workspace. Folder contents never leave the device unless
   the user explicitly attaches a copy to an activity. */
'use strict';
window.DQWorkspace = (() => {
 const DocumentPreview=window.createDQDocumentPreview('workspaceDocumentTitle');
 const supported=()=>window.isSecureContext&&typeof window.showDirectoryPicker==='function';
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const LIMIT=500, MAX_PREVIEW=20*1024*1024;
 let directory=null, snapshot=null, files=[], dialog=null, generation=0, busy=null, current=null, lastRead=null, partial=false, noteDirty=false, context=()=>({records:[],canAttach:false}), attach=null;
 const $=id=>document.getElementById(id);
 async function remember(handle){
  const db=await new Promise((resolve,reject)=>{const req=indexedDB.open('dispac-personal-workspace',1);req.onupgradeneeded=()=>req.result.createObjectStore('settings');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
  try{return await new Promise((resolve,reject)=>{const tx=db.transaction('settings',handle===undefined?'readonly':'readwrite');const store=tx.objectStore('settings');const req=handle===undefined?store.get('directory'):handle===null?store.delete('directory'):store.put(handle,'directory');let value;req.onsuccess=()=>value=req.result;tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}finally{db.close()}
 }
 async function readTree(root){
  const entries=[];let truncated=false;
  async function visit(folder,prefix='',depth=0){
   for await(const handle of folder.values()){
    if(handle.name.startsWith('.'))continue;
    if(handle.kind==='directory') {if(depth<8)await visit(handle,prefix+handle.name+'/',depth+1);else truncated=true;}
    else if(handle.kind==='file') {if(entries.length>=LIMIT){truncated=true;return;}const file=await handle.getFile();entries.push({path:prefix+handle.name,name:handle.name,size:file.size,modified:file.lastModified,handle});}
    if(entries.length>=LIMIT){truncated=true;return;}
   }
  }
  await visit(root);return {files:entries.sort((a,b)=>a.path.localeCompare(b.path,'it')),partial:truncated};
 }
 function noteName(value){
  const name=String(value).trim().normalize('NFC').replace(/\.txt$/i,'');
  if(!name||name.length>100||/[<>:"/\\|?*\u0000-\u001f]/.test(name)||/[. ]$/.test(name)||name.startsWith('.')||/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(name))throw Error('Scegli un nome di 1–100 caratteri, senza simboli di percorso o nomi riservati di Windows.');
  return name;
 }
 async function createNote(root,name,text){
  const base=noteName(name);if(!text.trim())throw Error('Scrivi il contenuto della nota.');if(new Blob([text]).size>2*1024*1024)throw Error('La nota può occupare al massimo 2 MB.');
  const filename=base+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomUUID().slice(0,8)+'.txt';
  if(new TextEncoder().encode(filename).length>240)throw Error('Nome troppo lungo per un file portabile: abbrevialo.');
  // A new unique filename, never an update of a file another program is editing.
  try{await root.getFileHandle(filename);throw Error('Esiste già una nota con questo nome. Riprova.');}catch(error){if(error.name!=='NotFoundError')throw error;}
  const handle=await root.getFileHandle(filename,{create:true});let writer;
  try{writer=await handle.createWritable();await writer.write(text);await writer.close();}catch(error){if(writer)await writer.abort().catch(()=>{});await root.removeEntry(filename).catch(()=>{});throw error;}
  return filename;
 }
 function errorText(error){if(error.name==='AbortError')return 'Operazione annullata.';if(['NotAllowedError','SecurityError'].includes(error.name))return 'Accesso alla cartella non consentito. Ricollegala e conferma il permesso del browser.';if(error.name==='NotFoundError')return 'Il file o la cartella non è più disponibile: controlla se è stato spostato o eliminato.';return error.message||'Operazione non riuscita.';}
 function status(message,error=false){if($('workspaceStatus')){$('workspaceStatus').textContent=message;$('workspaceStatus').className=error?'error':'hint';}}
 function resetPreview(){current=null;DocumentPreview.clear();if($('workspacePreview'))$('workspacePreview').innerHTML='';}
 function draw(){
  $('folderName').textContent=directory?directory.name:snapshot?'Cartella importata in lettura':'Nessuna cartella collegata';
  $('folderMode').textContent=directory?'Cartella collegata · rilettura ogni 15 secondi mentre questa finestra è visibile':snapshot?'Lettura temporanea · riseleziona la cartella per vedere le modifiche':'';
  $('folderRefresh').disabled=!directory||busy!==null;$('folderDisconnect').hidden=!directory&&!snapshot;$('workspaceNewNote').hidden=!directory;
  const q=$('workspaceSearch').value.trim().toLocaleLowerCase('it');const list=files.filter(f=>f.path.toLocaleLowerCase('it').includes(q));
  $('workspaceCount').textContent=`${list.length} di ${files.length} documenti${partial?' · elenco parziale (massimo 500 file, 8 sottocartelle di profondità)':''}${lastRead?' · lettura '+lastRead.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):''}`;
  $('workspaceFiles').innerHTML=list.length?list.map(f=>`<button type="button" class="personal-file" data-local-file="${escape(f.path)}" aria-pressed="${current===f.path}"><span>${escape(f.path)}</span><small>${(f.size?Math.max(1,Math.ceil(f.size/1024)):0).toLocaleString('it-IT')} KB</small></button>`).join(''):'<p class="hint">'+(directory||snapshot?'Nessun documento corrisponde alla ricerca.':'Collega una cartella per vedere qui gli stessi file presenti nel Finder o in Esplora file.')+'</p>';
  $('workspaceFiles').querySelectorAll('[data-local-file]').forEach(button=>button.onclick=()=>preview(button.dataset.localFile));
 }
 async function refresh(){
  if(!directory||busy===generation||!dialog?.open)return;const token=generation;busy=token;
  try{if(await directory.queryPermission({mode:'read'})!=='granted'){status('Il browser richiede di ricollegare la cartella per autorizzare la lettura.',true);return;}
   const result=await readTree(directory);if(token!==generation)return;
   const previous=files.find(f=>f.path===current);files=result.files;partial=result.partial;lastRead=new Date();
   if(previous){const next=files.find(f=>f.path===current);if(!next||next.modified!==previous.modified||next.size!==previous.size){resetPreview();status(next?'Il documento aperto è cambiato sul computer. Aprilo di nuovo per leggere la nuova versione.':'Il documento aperto è stato spostato o eliminato.');}}
   draw();
  }catch(error){if(token===generation)status(errorText(error),true)}finally{if(busy===token)busy=null;if(token===generation&&$('folderRefresh'))$('folderRefresh').disabled=!directory;}
 }
 async function preview(path){
  const entry=files.find(f=>f.path===path);if(!entry)return;const token=++generation;resetPreview();current=path;draw();status('Lettura del documento…');
  try{const file=entry.handle?await entry.handle.getFile():entry.file;if(token!==generation||!dialog.open)return;
   const info=document.createElement('p');info.className='hint';info.textContent=entry.handle?'Anteprima della versione letta ora. Le modifiche si fanno dal programma abituale nella cartella sul computer.':'Anteprima della copia acquisita alla selezione. Riseleziona la cartella per vedere eventuali modifiche.';$('workspacePreview').append(info);
   const host=document.createElement('div');$('workspacePreview').append(host);
   const download=()=>{const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
   if(file.size>MAX_PREVIEW){host.innerHTML='<p class="hint">Anteprima disponibile per documenti fino a 20 MB. Apri il file dalla cartella sul computer.</p>';}else DocumentPreview.mount(host,[{id:1,file_name:file.name,size:file.size}],{load:async()=>({blob:file}),download});
   const ctx=context();if(ctx.canAttach&&ctx.records.length){const panel=document.createElement('div');panel.className='soft-panel workspace-transfer';panel.innerHTML='<label for="workspaceRecord">Allega una copia a un’attività</label><select id="workspaceRecord">'+ctx.records.map(r=>`<option value="${r.id}">${escape(r.subject)}</option>`).join('')+'</select><p class="hint">Trasferisci solo questo file. Le modifiche successive nella cartella non aggiornano la copia allegata.</p><button type="button" class="btn light" id="workspaceAttach">Allega copia</button>';$('workspacePreview').append(panel);$('workspaceAttach').onclick=async()=>{const button=$('workspaceAttach');button.disabled=true;try{await attach(file,Number($('workspaceRecord').value));status('Copia allegata all’attività. Il file nella cartella resta indipendente.')}catch(error){status(errorText(error),true)}finally{button.disabled=false}};}
   status('Documento letto dal computer.');
  }catch(error){if(token===generation)status(errorText(error),true)}
 }
 function discardNote(){if(noteDirty&&!confirm('Cambiare cartella e abbandonare la nota non salvata?'))return false;noteDirty=false;$('workspaceNoteForm').reset();return true;}
 function chooseSnapshot(){ $('workspaceFolderInput').click(); }
 async function choose(){
  if(!supported()){chooseSnapshot();return;}
  try{const picked=await window.showDirectoryPicker({id:'dispac-personal',mode:'readwrite',startIn:'documents'});if(!discardNote())return;generation++;resetPreview();directory=picked;snapshot=null;files=[];partial=false;lastRead=null;$('workspaceNoteForm').hidden=true;draw();status('Cartella collegata. Lettura in corso…');try{await remember(picked)}catch{status('Cartella collegata per questa sessione. Il browser non ha potuto ricordare il collegamento.');}await refresh();}catch(error){status(errorText(error),error.name!=='AbortError');}
 }
 async function reconnect(){
  if(!directory)return choose();try{if(await directory.requestPermission({mode:'readwrite'})!=='granted')throw new DOMException('Permesso non concesso','NotAllowedError');await refresh()}catch(error){status(errorText(error),true)}
 }
 async function disconnect(){
  if(!discardNote())return;generation++;directory=null;snapshot=null;files=[];partial=false;lastRead=null;resetPreview();$('workspaceNoteForm').hidden=true;draw();try{await remember(null);status('Cartella scollegata. Nessun file sul computer è stato eliminato.')}catch{status('Cartella scollegata per questa sessione. Impossibile cancellare il collegamento memorizzato: controlla i dati del sito nel browser.',true)}
 }
 function makeDialog(){
  dialog=document.createElement('dialog');dialog.id='personalWorkspace';dialog.className='personal-workspace';dialog.setAttribute('aria-labelledby','workspaceTitle');
  dialog.innerHTML=`<div class="help-toolbar"><h2 id="workspaceTitle">Spazio personale</h2><button type="button" class="btn light" id="workspaceClose">Chiudi ×</button></div><div class="workspace-body"><aside class="eli-box"><p>La cartella resta sul tuo computer. Qui leggi gli stessi documenti che apri dal Finder o da Esplora file. Nessun file viene caricato nell’archivio finché non scegli “Allega copia”.</p></aside><p class="hint">Su Mac e Windows usa Chrome o Edge su HTTPS (o localhost) per il collegamento diretto. Negli altri browser puoi selezionare una cartella in lettura e riselezionarla per aggiornarla. Le modifiche vengono rilevate solo mentre lo spazio personale è aperto: a browser chiuso non c’è sincronizzazione.</p><div class="workspace-actions"><button type="button" class="btn primary" id="folderChoose">${supported()?'Collega cartella':'Seleziona cartella in lettura'}</button><button type="button" class="btn light" id="folderRefresh">Rileggi cartella</button><button type="button" class="text-btn" id="folderReconnect">Ripristina accesso</button><button type="button" class="text-btn" id="folderDisconnect" hidden>Scollega</button><input type="file" id="workspaceFolderInput" webkitdirectory multiple hidden></div><h3 id="folderName"></h3><p class="hint" id="folderMode"></p><p id="workspaceStatus" class="hint" role="status" aria-live="polite"></p><div class="workspace-grid"><section><label for="workspaceSearch">Cerca per nome o sottocartella</label><input id="workspaceSearch" type="search" placeholder="Es. verbale, Erasmus…"><p class="hint" id="workspaceCount"></p><div id="workspaceFiles" class="personal-files"></div></section><section><div id="workspacePreview"></div><button type="button" class="btn light" id="workspaceNewNote" hidden>＋ Crea una nota nella cartella</button><form id="workspaceNoteForm" class="form-stack" hidden><p class="hint">Verrà creato un nuovo file TXT con un nome univoco. I file già presenti non vengono sovrascritti.</p><div class="field"><label for="workspaceNoteName">Nome della nota</label><input id="workspaceNoteName" required maxlength="100" placeholder="Es. Appunti riunione"></div><div class="field"><label for="workspaceNoteText">Contenuto</label><textarea id="workspaceNoteText" required maxlength="1000000"></textarea></div><div class="form-actions"><button type="submit" class="btn primary">Crea file TXT</button><button type="button" class="btn light" id="workspaceNoteCancel">Annulla</button></div></form></section></div></div>`;
  document.body.append(dialog);
  $('workspaceClose').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{generation++;resetPreview()});
  $('folderChoose').onclick=choose;$('folderRefresh').onclick=refresh;$('folderReconnect').onclick=reconnect;$('folderDisconnect').onclick=disconnect;$('workspaceSearch').oninput=draw;
  $('folderReconnect').hidden=!supported();
  $('workspaceFolderInput').onchange=e=>{const selected=Array.from(e.target.files||[]);if(!selected.length)return;if(!discardNote()){e.target.value='';return;}generation++;directory=null;snapshot=true;files=selected.slice(0,LIMIT).map(file=>({name:file.name,path:file.webkitRelativePath||file.name,size:file.size,modified:file.lastModified,file}));partial=selected.length>LIMIT;lastRead=new Date();resetPreview();$('workspaceNoteForm').hidden=true;draw();status('Cartella letta. Per rilevare modifiche, selezionala di nuovo.');e.target.value=''};
  $('workspaceNewNote').onclick=()=>{$('workspaceNoteForm').hidden=false;$('workspaceNoteName').focus()};$('workspaceNoteCancel').onclick=()=>{if(noteDirty&&!confirm('Abbandonare la nota non salvata?'))return;noteDirty=false;$('workspaceNoteForm').reset();$('workspaceNoteForm').hidden=true};
  $('workspaceNoteForm').addEventListener('input',()=>noteDirty=true);
  $('workspaceNoteForm').onsubmit=async e=>{e.preventDefault();if(!directory)return;const button=e.target.querySelector('[type=submit]');button.disabled=true;try{if(await directory.requestPermission({mode:'readwrite'})!=='granted')throw new DOMException('Permesso non concesso','NotAllowedError');const name=await createNote(directory,$('workspaceNoteName').value,$('workspaceNoteText').value);noteDirty=false;$('workspaceNoteForm').reset();$('workspaceNoteForm').hidden=true;await refresh();status('Creata la nota: '+name)}catch(error){status(errorText(error),true)}finally{button.disabled=false}};
 }
 async function open(trigger){
  if(!dialog)makeDialog();dialog.onclose=()=>{if(trigger?.isConnected)trigger.focus()};dialog.showModal();$('workspaceClose').focus();draw();
  if(!directory&&!snapshot&&supported()){const token=generation;try{const stored=await remember();if(token!==generation||!dialog.open||directory||snapshot)return;if(stored){directory=stored;draw();if(await stored.queryPermission({mode:'read'})!=='granted')status('Cartella ricordata. Premi Ripristina accesso per concedere nuovamente il permesso.');else await refresh();}}catch{status('Collega una cartella. In questo browser il collegamento non può essere recuperato automaticamente.');}}
  else if(directory)await refresh();
 }
 setInterval(()=>{if(dialog?.open&&!document.hidden)refresh()},15000);
 window.addEventListener('beforeunload',event=>{if(noteDirty){event.preventDefault();event.returnValue=''}});
 window.addEventListener('focus',()=>{if(dialog?.open)refresh()});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&dialog?.open)refresh()});
 return {open,configure(options){context=options.context;attach=options.attach;},readTree,noteName,createNote,supported};
})();
