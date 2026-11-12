/* Safe text/RTF reading and native in-page PDF display. No remote viewer. */
'use strict';
window.createDQDocumentPreview = (titleId='documentTitle') => {
  let generation = 0;
  const urls = new Set();
  let dialog = null, returnFocus = null;
  const ansi = new TextDecoder('windows-1252');
  function decodeText(bytes) {
    if(bytes[0]===0xff&&bytes[1]===0xfe)return new TextDecoder('utf-16le').decode(bytes.subarray(2));
    if(bytes[0]===0xfe&&bytes[1]===0xff)return new TextDecoder('utf-16be').decode(bytes.subarray(2));
    try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}
    catch{return ansi.decode(bytes);}
  }
  function parseRTF(source) {
    if(!/^\s*\{\\rtf\d/.test(source))throw Error('Il file non contiene un documento RTF valido.');
    const runs=[],stack=[];
    let state={skip:false,bold:false,italic:false,underline:false,hidden:false,uc:1},fallback=0;
    const destinations=new Set(['fonttbl','colortbl','stylesheet','info','pict','object','objdata','filetbl','listtable','listoverridetable','generator','header','footer','headerl','headerr','footerl','footerr','fldinst','datastore','xmlnstbl','themedata','colorschememapping']);
    function append(text,unicode=false){
      if(state.skip||state.hidden)return;
      if(fallback&&!unicode){fallback--;return;}
      const previous=runs.at(-1);
      if(previous&&previous.bold===state.bold&&previous.italic===state.italic&&previous.underline===state.underline)previous.text+=text;
      else runs.push({text,bold:state.bold,italic:state.italic,underline:state.underline});
    }
    for(let i=0;i<source.length;){
      const char=source[i++];
      if(char==='{'){stack.push({...state});continue;}
      if(char==='}'){state=stack.pop()||state;continue;}
      if(char==='\r'||char==='\n')continue;
      if(char!=='\\'){append(char.charCodeAt(0)>127?ansi.decode(Uint8Array.of(char.charCodeAt(0))):char);continue;}
      const next=source[i++];
      if(next==='\\'||next==='{'||next==='}'){append(next);continue;}
      if(next==='*'){state.skip=true;continue;}
      if(next==="'"){
        const value=source.slice(i,i+2);i+=2;
        if(/^[a-f\d]{2}$/i.test(value))append(ansi.decode(Uint8Array.of(parseInt(value,16))));
        continue;
      }
      if(next==='~'){append('\u00a0');continue;}
      if(next==='_'){append('\u2011');continue;}
      if(!next||!/[a-z]/i.test(next))continue;
      let word=next;
      while(i<source.length&&/[a-z]/i.test(source[i]))word+=source[i++];
      let digits='';if(source[i]==='-')digits+=source[i++];
      while(i<source.length&&/\d/.test(source[i]))digits+=source[i++];
      const number=digits&&digits!=='-'?Number(digits):null;
      if(source[i]===' ')i++;
      if(destinations.has(word)){state.skip=true;continue;}
      if(word==='bin'&&number!==null){i+=Math.max(0,number);continue;}
      if(state.skip)continue;
      if(word==='b')state.bold=number!==0;
      else if(word==='i')state.italic=number!==0;
      else if(word==='ul')state.underline=number!==0;
      else if(word==='ulnone')state.underline=false;
      else if(word==='v')state.hidden=number!==0;
      else if(word==='plain'){state.bold=state.italic=state.underline=state.hidden=false;}
      else if(word==='uc'&&number!==null)state.uc=Math.max(0,Math.min(16,number));
      else if(word==='u'&&number!==null){append(String.fromCharCode((number+65536)%65536),true);fallback=state.uc;}
      else if(word==='par'||word==='line')append('\n');
      else if(word==='tab')append('\t');
      else if(word==='page')append('\n\n');
      else if(word==='emdash')append('—');
      else if(word==='endash')append('–');
      else if(word==='bullet')append('•');
      else if(word==='lquote'||word==='rquote')append(word==='lquote'?'‘':'’');
      else if(word==='ldblquote'||word==='rdblquote')append(word==='ldblquote'?'“':'”');
    }
    return runs;
  }
  function format(name){const extension=name.split('.').pop().toLowerCase();return ['txt','rtf','pdf','md','csv','json'].includes(extension)?extension:null;}
  function parseCSV(text){
    text=text.replace(/^\uFEFF/,'');
    const choices=[',',';','\t'],samples=[];let counts={',':0,';':0,'\t':0},quoted=false;
    for(let i=0;i<Math.min(text.length,20000)&&samples.length<25;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){i++;continue;}quoted=!quoted;}else if(!quoted){if(c in counts)counts[c]++;else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;samples.push(counts);counts={',':0,';':0,'\t':0};}}}
    if(!samples.length||Object.values(counts).some(Boolean))samples.push(counts);
    const score=delimiter=>{const frequencies=new Map();for(const row of samples)if(row[delimiter])frequencies.set(row[delimiter],(frequencies.get(row[delimiter])||0)+1);const mode=[...frequencies].sort((a,b)=>b[1]-a[1])[0]||[0,0];return (samples[0][delimiter]?1000:0)+mode[1]/samples.length*100+Math.min(mode[0],20);};
    const delimiter=choices.sort((a,b)=>score(b)-score(a))[0];
    const rows=[];let row=[],cell='',inside=false,truncated=false;
    const pushCell=()=>{if(row.length<100)row.push(cell.slice(0,10000));else truncated=true;if(cell.length>10000)truncated=true;cell='';};
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(c==='"'){if(inside&&text[i+1]==='"'){cell+='"';i++;}else if(inside)inside=false;else if(cell==='')inside=true;else cell+=c;}
      else if(!inside&&c===delimiter)pushCell();
      else if(!inside&&(c==='\n'||c==='\r')){if(c==='\r'&&text[i+1]==='\n')i++;pushCell();rows.push(row);row=[];if(rows.length>=10000){truncated=truncated||i<text.length-1;return {rows,delimiter,truncated};}}
      else cell+=c;
    }
    if(inside)throw Error('Virgolette non chiuse nel CSV.');if(cell!==''||row.length){pushCell();rows.push(row);}return {rows,delimiter,truncated};
  }
  function node(tag,className,text){const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;}
  function close(){if(dialog?.open)dialog.close();}
  function clear(){generation++;close();for(const url of urls)URL.revokeObjectURL(url);urls.clear();}
  function render(host,doc,expanded,state={}){
    host.replaceChildren();
    if(doc.type==='pdf'){
      if(navigator.pdfViewerEnabled===false){host.append(node('p','preview-status','La visualizzazione PDF integrata non è disponibile in questo browser. Usa un browser con lettore PDF integrato.'));return;}
      const iframe=node('iframe','pdf-preview');iframe.title=doc.name;iframe.src=doc.url+(expanded?'#toolbar=1&view=FitH':'#toolbar=0&navpanes=0&scrollbar=0&view=FitH');host.append(iframe);return;
    }
    if(doc.warning)host.append(node('p','preview-status',doc.warning));
    if(doc.type==='csv'&&doc.rows){
      const rows=state.query?doc.rows.filter(row=>row.some(cell=>cell.toLocaleLowerCase().includes(state.query.toLocaleLowerCase()))):doc.rows;
      const size=expanded?100:5;state.page=Math.max(0,Math.min(state.page||0,Math.max(0,Math.ceil(rows.length/size)-1)));
      const start=state.page*size,wrap=node('div','document-table'),table=node('table'),body=node('tbody');
      table.setAttribute('aria-label','Dati CSV');
      for(const row of rows.slice(start,start+size)){const tr=node('tr');for(const value of row)tr.append(node('td',undefined,value));body.append(tr);}table.append(body);wrap.append(table);host.append(wrap);
      if(expanded){const controls=node('div','reader-pagination'),previous=node('button','btn light small','← Precedenti'),next=node('button','btn light small','Successive →');previous.type=next.type='button';previous.disabled=start===0;next.disabled=start+size>=rows.length;previous.onclick=()=>{state.page--;render(host,doc,true,state)};next.onclick=()=>{state.page++;render(host,doc,true,state)};controls.append(previous,node('span','hint',rows.length?`Righe ${start+1}–${Math.min(start+size,rows.length)} di ${rows.length}`:'Nessuna riga corrispondente'),next);host.append(controls);}
      if(doc.truncated)host.append(node('p','preview-status','Visualizzazione limitata a 10.000 righe, 100 colonne e 10.000 caratteri per cella. Scarica il file per il contenuto originale.'));
      return;
    }
    const text=node('div','document-text');text.style.fontSize=(state.fontSize||14)+'px';text.style.whiteSpace=state.wrap===false?'pre':'pre-wrap';
    let remaining=expanded?Infinity:1600;let matches=0;
    for(const run of doc.runs){
      if(remaining<=0)break;const value=run.text.slice(0,remaining),span=node('span');span.classList.toggle('rtf-bold',!!run.bold);span.classList.toggle('rtf-italic',!!run.italic);span.classList.toggle('rtf-underline',!!run.underline);
      if(expanded&&state.query){const lower=value.toLocaleLowerCase(),query=state.query.toLocaleLowerCase();let at=0,index;
        while(matches<1000&&(index=lower.indexOf(query,at))!==-1){span.append(document.createTextNode(value.slice(at,index)),node('mark',undefined,value.slice(index,index+query.length)));at=index+query.length;matches++;}span.append(document.createTextNode(value.slice(at)));
      }else span.textContent=value;
      text.append(span);remaining-=run.text.length;
    }
    if(!doc.runs.some(r=>r.text.trim()))text.append(node('span','preview-status','Documento vuoto.'));
    if(expanded&&state.query)host.append(node('p','preview-status',matches===1000?'Mostrati i primi 1.000 risultati.':matches+' risultati'));
    host.append(text);
  }

  function expand(doc,trigger){
    if(!dialog){
      dialog=node('dialog','document-dialog');dialog.setAttribute('aria-labelledby',titleId);
      const header=node('header','document-toolbar'),label=node('div');
      const title=node('h2',undefined);title.id=titleId;label.append(title,node('p','document-format'));
      const button=node('button','btn light small','Chiudi');button.type='button';button.autofocus=true;button.onclick=close;
      header.append(label,button);dialog.append(header,node('div','reader-controls'),node('div','document-full'));document.body.append(dialog);
      dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}});
      dialog.addEventListener('close',()=>{dialog.querySelector('.document-full').replaceChildren();if(returnFocus?.isConnected)returnFocus.focus();returnFocus=null;});
      dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
    }
    returnFocus=trigger;dialog.querySelector('h2').textContent=doc.name;dialog.querySelector('.document-format').textContent=doc.type.toUpperCase();
    const controls=dialog.querySelector('.reader-controls');controls.replaceChildren();const state={wrap:true,fontSize:14,query:'',page:0};
    const redraw=()=>render(dialog.querySelector('.document-full'),doc,true,state);
    if(doc.type!=='pdf'){
      if(doc.type!=='csv'){const label=node('label',undefined,'Dimensione del testo '),size=node('select');size.setAttribute('aria-label','Dimensione del testo');for(const n of [12,14,18,22]){const option=node('option',undefined,n+' px');option.value=n;size.append(option);}size.value='14';size.onchange=()=>{state.fontSize=Number(size.value);redraw()};label.append(size);const wrap=node('button','btn light small','A capo');wrap.type='button';wrap.setAttribute('aria-pressed','true');wrap.onclick=()=>{state.wrap=!state.wrap;wrap.setAttribute('aria-pressed',String(state.wrap));redraw()};controls.append(label,wrap);}
      const search=node('input');search.type='search';search.maxLength=200;search.placeholder=doc.type==='csv'?'Filtra le righe…':'Cerca nel testo…';search.setAttribute('aria-label',doc.type==='csv'?'Filtra le righe CSV':'Cerca nel documento');search.oninput=()=>{state.query=search.value;state.page=0;redraw()};controls.append(search);
      if(doc.type!=='csv'){let index=-1;const next=node('button','btn light small','Risultato successivo');next.type='button';next.onclick=()=>{const marks=dialog.querySelectorAll('.document-full mark');if(marks.length){index=(index+1)%marks.length;marks[index].scrollIntoView({block:'center'});marks.forEach((m,i)=>m.classList.toggle('current-match',i===index));}};controls.append(next);}
    }else controls.append(node('p','hint','Zoom e ricerca dipendono dal lettore PDF del browser. Le scansioni senza testo richiedono OCR, non disponibile nel portale.'));
    redraw();dialog.showModal();
  }
  function mount(host,attachments,options){
    const current=generation;
    if(!attachments.length){host.append(node('p','muted','Nessun documento collegato.'));return;}
    for(const file of attachments){
      const type=format(file.file_name),card=node('article','document-card'),header=node('div','document-card-header'),label=node('div','document-label');
      label.append(node('span','document-type',type?type.toUpperCase():'FILE'),node('b','document-name',file.file_name),node('small','muted',Math.ceil(file.size/1024)+' KB'));
      const actions=node('div','document-actions'),download=node('button','btn light small','Scarica');download.type='button';download.onclick=()=>options.download(file.id);actions.append(download);
      header.append(label,actions);card.append(header);host.append(card);
      if(!type){card.append(node('p','preview-status','Formato scaricabile. Anteprima per TXT, RTF, PDF, Markdown, CSV e JSON; DOCX, XLSX e ODT richiedono un programma esterno.'));continue;}
      const viewport=node('div','document-thumbnail');viewport.setAttribute('aria-label','Anteprima di '+file.file_name);viewport.append(node('p','preview-status','Caricamento anteprima…'));card.append(viewport);
      const open=node('button','btn light small','Espandi');open.type='button';open.disabled=true;actions.prepend(open);
      let pending;
      async function load(){
        if(!pending)pending=(async()=>{
          const {blob}=await options.load(file.id),bytes=new Uint8Array(await blob.arrayBuffer());
          if(type==='pdf'){
            if(!new TextDecoder().decode(bytes.subarray(0,1024)).includes('%PDF-'))throw Error('Il file non contiene un PDF valido.');
            const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
            if(current!==generation){URL.revokeObjectURL(url);return null;}
            urls.add(url);return {type,name:file.file_name,url};
          }
          const text=decodeText(bytes);
          if(type==='csv'){try{return {type,name:file.file_name,...parseCSV(text.replace(/^\uFEFF/,''))};}catch(error){return {type:'txt',name:file.file_name,runs:[{text}],warning:'CSV non interpretabile: '+error.message+' Mostrato come testo.'};}}
          let value=text,warning=type==='md'?'Markdown letto come testo: i marcatori sono conservati, HTML e script non vengono eseguiti.':null;
          if(type==='json'){try{value=JSON.stringify(JSON.parse(text.replace(/^\uFEFF/,'')),null,2);}catch{warning='JSON non valido: mostrato il testo originale.';}}
          const runs=type==='rtf'?parseRTF(Array.from(bytes,b=>String.fromCharCode(b)).join('')):[{text:value}];
          return {type,name:file.file_name,runs,warning};
        })().catch(error=>{pending=null;throw error;});
        return pending;
      }
      open.onclick=async()=>{try{const doc=await load();if(current===generation&&doc)expand(doc,open);}catch(error){viewport.replaceChildren(node('p','preview-status',error.message));}};
      load().then(doc=>{if(current!==generation||!doc)return;render(viewport,doc,false);open.disabled=false;}).catch(error=>{if(current!==generation)return;viewport.replaceChildren(node('p','preview-status',error.message));open.disabled=false;open.textContent='Riprova';open.onclick=async()=>{try{const doc=await load();if(current!==generation||!doc)return;render(viewport,doc,false);open.textContent='Espandi';open.onclick=()=>expand(doc,open);}catch(e){viewport.replaceChildren(node('p','preview-status',e.message));}};});
    }
  }
  return {mount,clear,close,parseRTF,decodeText,parseCSV,format};
};
window.DocumentPreview = window.createDQDocumentPreview();
