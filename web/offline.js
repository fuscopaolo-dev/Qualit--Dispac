/* Cache only the application shell. Personal files and API responses are excluded. */
'use strict';
(() => {
 const status=message=>{const el=document.getElementById('offlineStatus');if(el)el.textContent=message};
 if(!('serviceWorker' in navigator)||!['http:','https:'].includes(location.protocol)){status('Lo spazio personale funziona offline da un sito HTTPS già aperto almeno una volta.');return;}
 window.addEventListener('load',async()=>{
  let timer;
  try{await navigator.serviceWorker.register(new URL('./sw.js',location.href),{scope:'./'});await Promise.race([navigator.serviceWorker.ready,new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(Error('offline-timeout')),15000)})]);status('Interfaccia disponibile offline su questo browser. La connessione serve per l’archivio sul server.');}
  catch{status('Disponibilità offline non attivata: verifica HTTPS e le impostazioni del browser.');}
  finally{clearTimeout(timer)}
 });
})();
