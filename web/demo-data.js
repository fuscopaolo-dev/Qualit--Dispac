/* Archivio narrativo dimostrativo: nessun dato o documento reale. */
'use strict';
window.DQDemoArchive = () => {
 const examples = [
 ['INT.01','Paperino parte per Erasmus Studio','Paperino','conclusa','2026-10-02','Accordo formativo approvato da Pico de Paperis. Paperino ha completato il soggiorno all’Università di Topolinia. Crediti riconosciuti e relazione finale ricevuta.','Verbale riconoscimento crediti','Esami: Storia della numismatica, 6 crediti; Archeologia del deposito, 6 crediti. Esito: riconoscimento approvato. Prossima azione: archiviare la relazione finale.'],
 ['INT.02','Qui, Quo e Qua: tirocinio al Museo delle Giovani Marmotte','Qui, Quo e Qua','in_corso','2026-10-08','Convenzione firmata. I tre tirocinanti stanno catalogando le mappe del museo. Paperina raccoglierà il riscontro del tutor al termine del tirocinio.','Piano del tirocinio','Obiettivo: catalogare 30 mappe. Tutor: Paperina. Durata: 8 settimane. Verifica: registro delle attività e relazione finale.'],
 ['INT.03','Lezione di Pico de Paperis sulle monete antiche','Pico de Paperis','conclusa','2026-10-12','Mobilità per docenza conclusa con un seminario di 8 ore a Topolinia. Attestato e programma delle lezioni acquisiti.','Programma della docenza','Titolo: Dalla prima moneta al primo decino. Docente: Pico de Paperis. Argomenti: collezioni, conservazione, fonti storiche. Output: seminario e materiali didattici.'],
 ['INT.04','Archimede studia la gestione degli archivi digitali','Archimede Pitagorico','in_corso','2026-10-18','Visita di formazione presso il laboratorio di Topolinia. Archimede sperimenta una macchina per classificare i documenti. Resta da acquisire l’attestato di presenza.','Agenda di formazione','Giorno 1: organizzare i documenti. Giorno 2: denominare i file. Giorno 3: provare il recupero di una copia. Responsabile della verifica: Archimede.'],
 ['INT.05','Borsa di studio per un candidato della Calisota','Paperina','aperta','2026-10-23','Candidatura fittizia ricevuta. Paperina deve verificare i requisiti e richiedere il certificato mancante prima della valutazione.','Checklist candidatura','Ricevuti: domanda, curriculum e progetto di studio. Da ricevere: certificato del titolo. Prossima azione: inviare una richiesta di integrazione.'],
 ['INT.06','Nonna Papera visiting professor di storia rurale','Nonna Papera','in_corso','2026-10-27','Invito accettato per un ciclo di incontri sulla memoria delle campagne. Prenotata l’aula; il programma definitivo è in preparazione.','Lettera di invito','Ospite: Nonna Papera. Referente: Pico de Paperis. Tema: archivi rurali e tradizioni orali. Documenti attesi: programma definitivo e relazione del soggiorno.'],
 ['INT.07','Accordo di ricerca Paperopoli–Topolinia','Zio Paperone','aperta','2026-11-01','Bozza di accordo sulla conservazione delle collezioni numismatiche. Paperone verifica i costi; Pico de Paperis verifica gli obiettivi scientifici. Nessun accordo è ancora firmato.','Bozza accordo scientifico','Partner fittizi: Ateneo di Paperopoli e Ateneo di Topolinia. Obiettivo: catalogo condiviso delle monete. Da chiarire: costi e responsabilità. Stato: bozza da discutere.'],
 ['INT.08','Riunione di monitoraggio con Paperina e Paperino','Paperina','conclusa','2026-11-05','Riesaminate le attività di mobilità. Criticità: attestati consegnati tardi. Azione proposta: una checklist da inviare prima della partenza, affidata a Paperino.','Verbale del monitoraggio','Partecipanti: Paperina, Paperino, Pico de Paperis. Decisione: introdurre una checklist documentale. Responsabile: Paperino. Verifica successiva: controllare gli attestati mancanti.'],
 ['INT.00','Piano annuale dell’internazionalizzazione di Paperopoli','Pico de Paperis','aperta','2026-11-09','Raccolte le proposte dei referenti. Occorre scegliere le priorità e collegarle ai singoli sottoprocessi prima dell’approvazione del piano.','Nota sulle priorità annuali','Proposte: più tirocini al museo, docenze ospiti e accordi di ricerca. Coordinamento: Pico de Paperis. Output atteso: piano approvato.']
 ];
 const archive={records:[],attachments:[],history:[]};
 examples.forEach(([code,subject,author,status,date,description,title,text],i)=>{
  const id=i+1, at=date+'T10:00:00.000Z';
  const bytes=new TextEncoder().encode('ESEMPIO FITTIZIO · PAPEROPOLI\n'+title+'\n\n'+text+'\n\nDocumento dimostrativo: non costituisce un atto reale.');
  const data=btoa(Array.from(bytes,b=>String.fromCharCode(b)).join(''));
  const file={id,file_name:'paperopoli-'+code.toLowerCase().replace('.','-')+'.txt',size:bytes.length,created_at:at};
  const row={id,code,step:code==='INT.00'?null:1,subject,author,status,activity_date:date,description,created_at:at,updated_at:status==='aperta'?at:date+'T15:00:00.000Z',attachments:[file]};
  archive.records.push(row);archive.attachments.push({...file,data});
  archive.history.push({record_id:id,action:'creazione · esempio fittizio',author,at,snapshot:JSON.stringify({...row,status:'aperta',updated_at:at})});
  if(status!=='aperta')archive.history.push({record_id:id,action:'aggiornamento · esempio fittizio',author,at:date+'T15:00:00.000Z',snapshot:JSON.stringify(row)});
 });
 return archive;
};
