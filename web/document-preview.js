/* Safe text/RTF reading and native in-page PDF display. No remote viewer. */
'use strict';
window.DocumentPreview = (() => {
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
  function format(name){const extension=name.split('.').pop().toLowerCase();return ['txt','rtf','pdf'].includes(extension)?extension:null;}
  function node(tag,className,text){const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;}
  function close(){if(dialog?.open)dialog.close();}
  function clear(){generation++;close();for(const url of urls)URL.revokeObjectURL(url);urls.clear();}
  function render(host,doc,expanded){
    host.replaceChildren();
    if(doc.type==='pdf'){
      if(navigator.pdfViewerEnabled===false){host.append(node('p','preview-status','La visualizzazione PDF integrata non è disponibile in questo browser. Usa un browser con lettore PDF integrato.'));return;}
      const iframe=node('iframe','pdf-preview');iframe.title=doc.name;iframe.src=doc.url+(expanded?'#toolbar=1&view=FitH':'#toolbar=0&navpanes=0&scrollbar=0&view=FitH');host.append(iframe);return;
    }
    const text=node('div','document-text');
    let remaining=expanded?Infinity:1600;
    for(const run of doc.runs){if(remaining<=0)break;const span=node('span',undefined,run.text.slice(0,remaining));span.classList.toggle('rtf-bold',run.bold);span.classList.toggle('rtf-italic',run.italic);span.classList.toggle('rtf-underline',run.underline);text.append(span);remaining-=run.text.length;}
    if(!doc.runs.some(r=>r.text.trim()))text.append(node('span','preview-status','Documento vuoto.'));
    host.append(text);
  }
  function expand(doc,trigger){
    if(!dialog){
      dialog=node('dialog','document-dialog');dialog.setAttribute('aria-labelledby','documentTitle');
      const header=node('header','document-toolbar'),label=node('div');
      const title=node('h2',undefined);title.id='documentTitle';label.append(title,node('p','document-format'));
      const button=node('button','btn light small','Chiudi');button.type='button';button.autofocus=true;button.onclick=close;
      header.append(label,button);dialog.append(header,node('div','document-full'));document.body.append(dialog);
      dialog.addEventListener('close',()=>{dialog.querySelector('.document-full').replaceChildren();if(returnFocus?.isConnected)returnFocus.focus();returnFocus=null;});
      dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
    }
    returnFocus=trigger;dialog.querySelector('h2').textContent=doc.name;dialog.querySelector('.document-format').textContent=doc.type.toUpperCase();
    render(dialog.querySelector('.document-full'),doc,true);dialog.showModal();
  }
  function mount(host,attachments,options){
    const current=generation;
    if(!attachments.length){host.append(node('p','muted','Nessun documento collegato.'));return;}
    for(const file of attachments){
      const type=format(file.file_name),card=node('article','document-card'),header=node('div','document-card-header'),label=node('div','document-label');
      label.append(node('span','document-type',type?type.toUpperCase():'FILE'),node('b','document-name',file.file_name),node('small','muted',Math.ceil(file.size/1024)+' KB'));
      const actions=node('div','document-actions'),download=node('button','btn light small','Scarica');download.type='button';download.onclick=()=>options.download(file.id);actions.append(download);
      header.append(label,actions);card.append(header);host.append(card);
      if(!type){card.append(node('p','preview-status','Anteprima disponibile per TXT, RTF e PDF.'));continue;}
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
          const runs=type==='rtf'?parseRTF(Array.from(bytes,b=>String.fromCharCode(b)).join('')):[{text:decodeText(bytes)}];
          return {type,name:file.file_name,runs};
        })().catch(error=>{pending=null;throw error;});
        return pending;
      }
      open.onclick=async()=>{try{const doc=await load();if(current===generation&&doc)expand(doc,open);}catch(error){viewport.replaceChildren(node('p','preview-status',error.message));}};
      load().then(doc=>{if(current!==generation||!doc)return;render(viewport,doc,false);open.disabled=false;}).catch(error=>{if(current!==generation)return;viewport.replaceChildren(node('p','preview-status',error.message));open.disabled=false;open.textContent='Riprova';open.onclick=async()=>{try{const doc=await load();if(current!==generation||!doc)return;render(viewport,doc,false);open.textContent='Espandi';open.onclick=()=>expand(doc,open);}catch(e){viewport.replaceChildren(node('p','preview-status',e.message));}};});
    }
  }
  return {mount,clear,close,parseRTF,decodeText};
})();
