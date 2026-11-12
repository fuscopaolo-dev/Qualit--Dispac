'use strict';
window.DQGuide = [
 {id:'inizio',category:'Primi passi',title:'Come funziona la piattaforma',eli:'Immagina un quaderno con dei cassetti. I processi sono le istruzioni; le attività sono le pagine che scrivi; i documenti sono le prove che metti nel cassetto.',body:'La Panoramica mostra i conteggi e le attività recenti. Processi contiene la scheda generale INT.00 e otto schede operative. Memoria e ricerca raccoglie le registrazioni. Nuova attività guida il salvataggio. Monitoraggio riassume gli stati presenti.',steps:['Consulta il processo che riguarda il tuo lavoro.','Registra un’attività con oggetto, data e stato.','Apri il dettaglio per aggiungere documenti e rileggere lo storico.'],example:'Paperino consulta Erasmus Studio, registra il suo soggiorno e collega il verbale di riconoscimento dei crediti.'},
 {id:'demo',category:'Primi passi',title:'Paperopoli: demo e laboratorio',eli:'La demo è un quaderno già scritto. Il laboratorio è una fotocopia su cui puoi fare le tue prove.',body:'Tutti i personaggi, le attività e gli allegati di Paperopoli sono esempi inventati. La demo è in sola lettura. Il laboratorio crea una copia temporanea modificabile: puoi salvare attività e allegati, ma al ricaricamento o all’uscita le prove si perdono. Gli account locali hanno archivi separati e inizialmente vuoti.',steps:['Entra con “Visita la piattaforma demo”.','Apri un’attività e leggi il suo documento fittizio.','Premi “Prova la compilazione” per iniziare un laboratorio nuovo.'],example:'Nel laboratorio puoi completare la candidatura seguita da Paperina senza cambiare la demo originale.'},
 {id:'processi',category:'Processi',title:'Schede, processi e passaggi',eli:'Il processo è una ricetta. Il passaggio è una riga della ricetta. L’attività racconta quando hai preparato davvero quel piatto.',body:'INT.00 descrive l’intero processo di internazionalizzazione. INT.01–INT.08 descrivono le procedure specifiche. Ogni scheda indica responsabilità, input, attività, output, evidenze e indicatori. Le registrazioni operative non modificano queste istruzioni.',steps:['Scegli una scheda dal menu Processi.','Leggi finalità e responsabilità.','Apri i passaggi per vedere cosa serve e cosa deve uscire.','Registra un’attività collegata quando hai informazioni da conservare.'],example:'Il soggiorno di Paperino va in INT.01; il tirocinio di Qui, Quo e Qua in INT.02.'},
 {id:'code',category:'Compilazione',title:'Scegliere il processo',eli:'Scegli il cassetto in cui cercheresti questa attività domani.',body:'Seleziona il processo più vicino all’attività. Usa INT.00 per coordinamento generale; INT.01 per Erasmus Studio, INT.02 per tirocinio, INT.03 per docenza, INT.04 per formazione, INT.05 per borse extra-UE, INT.06 per visiting, INT.07 per accordi e cotutele, INT.08 per monitoraggio.',steps:['Pensa allo scopo principale dell’attività.','Scegli il codice dal menu.','Se hai dubbi, consulta la relativa scheda in Processi.'],example:'Archimede visita un laboratorio per imparare: INT.04, Staff Mobility for Training.'},
 {id:'step',category:'Compilazione',title:'Collegare un passaggio',eli:'È come mettere un segnalibro sulla parte della ricetta che stai seguendo.',body:'Il passaggio è facoltativo. Le opzioni dipendono dal processo scelto. Se cambi processo, scegli nuovamente il passaggio. INT.00 non ha passaggi operativi selezionabili. Lascia “Nessun passaggio specifico” per un’annotazione generale.',steps:['Scegli prima il processo.','Confronta il lavoro svolto con i passaggi proposti.','Se nessuno è pertinente, lascia il campo vuoto.'],example:'Paperina può collegare una nota al passaggio di verifica dei documenti della candidatura.'},
 {id:'subject',category:'Compilazione',title:'Scrivere un oggetto riconoscibile',eli:'Scrivi il titolo che vorresti trovare sul dorso di una cartellina.',body:'L’oggetto è obbligatorio e può contenere al massimo 250 caratteri. Un titolo utile dice cosa è successo e a chi o a cosa si riferisce. Evita titoli generici come “Aggiornamento” o “Varie”.',steps:['Indica l’azione principale.','Aggiungi la persona, il progetto o la destinazione.','Rileggi il titolo pensando alla ricerca futura.'],example:'“Nonna Papera: invito per il seminario di storia rurale” è più facile da ritrovare di “Invito”.'},
 {id:'date',category:'Compilazione',title:'Data dell’attività',eli:'È il giorno in cui è successa la cosa, come la data sotto una fotografia.',body:'La data dell’attività è obbligatoria. Non deve necessariamente coincidere con il giorno in cui compili. Le attività vengono ordinate dalla data più recente. Lo storico conserva separatamente il momento del salvataggio.',steps:['Individua la data dell’evento o dell’aggiornamento.','Controlla giorno, mese e anno.','Usa il filtro della ricerca per ritrovare un periodo.'],example:'Pico registra oggi una lezione svolta il 12 ottobre: la data dell’attività resta il 12 ottobre.'},
 {id:'status',category:'Compilazione',title:'Aperta, in corso o conclusa?',eli:'Aperta: da fare. In corso: ci stai lavorando. Conclusa: hai finito.',body:'Lo stato descrive il punto attuale del lavoro. Aperta indica un’attività ancora da avviare o da definire; In corso un lavoro avviato; Conclusa un lavoro terminato. I conteggi del monitoraggio dipendono da questa scelta. Puoi aggiornarla modificando la registrazione.',steps:['Chiediti se il lavoro è iniziato.','Verifica se restano azioni o documenti attesi.','Aggiorna le note e lo stato quando cambia la situazione.'],example:'Per Archimede manca ancora l’attestato: la formazione rimane “In corso”.'},
 {id:'description',category:'Compilazione',title:'Annotazioni, esiti e prossima azione',eli:'Lascia un messaggio al te stesso di domani: cosa è successo e cosa resta da fare?',body:'Le annotazioni sono facoltative, fino a 10.000 caratteri. Scrivi fatti utili, decisioni, problemi e prossime azioni. Un documento può fornire i dettagli; la nota deve aiutare a capire rapidamente la situazione.',steps:['Descrivi brevemente cosa è successo.','Indica l’esito o il problema.','Scrivi chi farà la prossima cosa e quale documento si attende.'],example:'“Paperina ha verificato la domanda. Manca il certificato del titolo. Prossima azione: chiedere l’integrazione al candidato.”'},
 {id:'review',category:'Compilazione',title:'Riepilogo e salvataggio',eli:'Prima di chiudere la cartellina, controlla di aver scritto il nome giusto e messo tutto al suo posto.',body:'Il percorso ha tre passaggi: collegamento, racconto e riepilogo. Avanti controlla i campi obbligatori del passaggio corrente. Indietro conserva ciò che hai scritto. La registrazione completa avviene con “Salva attività”; “Salva bozza” conserva invece una compilazione incompleta. Annulla abbandona la compilazione.',steps:['Controlla processo, oggetto, data e stato nel riepilogo.','Torna indietro se devi correggere qualcosa.','Salva la registrazione completa e aggiungi eventuali documenti dal dettaglio; se mancano informazioni usa Salva bozza.'],example:'Paperino rilegge il titolo, corregge la data e solo dopo salva il verbale del soggiorno.'},
 {id:'search',category:'Archivio',title:'Ricerca, filtri ed esportazione CSV',eli:'È come cercare una cartellina per etichetta, cassetto e data.',body:'La ricerca trova parole nell’oggetto, nelle annotazioni e nei nomi degli allegati; non cerca dentro il contenuto dei documenti. I filtri per processo, stato e data iniziale si combinano. La data iniziale include quel giorno. Il CSV contiene le registrazioni dei risultati correnti, senza i file allegati.',steps:['Scrivi una parola e premi Cerca o Invio.','Scegli processo e stato se vuoi restringere i risultati.','Azzera la parola e scegli tutti i processi e gli stati per ampliare la ricerca.','Esporta CSV per lavorare sui risultati in un foglio di calcolo.'],example:'Cerca “Paperina”, poi seleziona “Aperta” per trovare le candidature che richiedono attenzione.'},
 {id:'attachments',category:'Archivio',title:'Allegati, anteprima e download',eli:'La nota dice cosa è successo. L’allegato è il foglio che lo racconta nei dettagli.',body:'Dopo aver salvato un’attività, apri il dettaglio in Memoria e ricerca e scegli un file. In modalità locale il limite è 2 MB per documento. Premi Carica documento per archiviarlo. TXT, RTF, PDF, Markdown, CSV e JSON hanno un’anteprima: Espandi apre il lettore, Scarica salva una copia. Gli altri formati sono scaricabili.',steps:['Salva prima la registrazione.','Apri il dettaglio e seleziona il file.','Premi Carica documento e verifica che compaia nell’elenco.','Usa Espandi per leggere e Chiudi o Esc per tornare.'],example:'Nel dettaglio del soggiorno di Paperino puoi aprire il verbale fittizio di riconoscimento dei crediti.'},
 {id:'history',category:'Archivio',title:'Modifiche e storico',eli:'Lo storico è un album delle versioni: puoi vedere com’era la pagina prima.',body:'Modifica registrazione riapre il percorso con i dati già compilati. Ogni salvataggio aggiunge una voce allo storico con autore, data e dati registrati. “Vedi i dati registrati” mostra la fotografia tecnica di quella versione. Consultare lo storico non ripristina una versione precedente.',steps:['Apri il dettaglio dell’attività.','Premi Modifica registrazione e aggiorna i dati.','Salva e consulta la nuova voce nello storico.'],example:'Il verbale di Paperino mostra la creazione e il successivo aggiornamento dello stato a “Conclusa”.'},
 {id:'monitoraggio',category:'Monitoraggio',title:'Leggere i conteggi',eli:'È un contatore delle cartelline: quante sono e quante aspettano ancora lavoro.',body:'Registrazioni conta tutte le attività visibili. Concluse e In corso dipendono dallo stato salvato; Non concluse comprende Aperta e In corso. La tabella raggruppa gli otto sottoprocessi, mentre il totale include anche INT.00. I conteggi non misurano da soli la qualità e non sono indicatori ufficiali AQ.',steps:['Controlla il totale delle registrazioni.','Individua i sottoprocessi con attività non concluse.','Apri Memoria e ricerca e filtra quel processo per approfondire.'],example:'La bozza di accordo di Paperone conta tra le attività non concluse di INT.07.'},
 {id:'backup',category:'Account e dati',title:'Archivio locale, esportazione e importazione',eli:'I dati sono nel cassetto di questo browser. Esportare significa portarsi via una copia della cartellina.',body:'In modalità locale ogni account ha un archivio separato nel browser. Non c’è sincronizzazione automatica fra computer. Esporta dati salva attività, storico, allegati, documenti testuali, bozze e modelli personali in JSON, senza credenziali. Importa dati sostituisce l’intero archivio dell’account, incluse bozze e modelli, dopo conferma. Il laboratorio è temporaneo e non offre importazione o esportazione.',steps:['Usa Esporta dati per conservare una copia completa.','Conserva il file prima di cambiare browser o percorso del file HTML.','Per ripristinare accedi all’account e usa Importa dati.','Leggi la conferma: l’importazione sostituisce le registrazioni esistenti.'],example:'Il CSV di Paperina è un elenco; il JSON esportato è la copia completa con i suoi documenti.'},
 {id:'account',category:'Account e dati',title:'Accesso e ruoli',eli:'L’account è l’etichetta sul tuo cassetto personale.',body:'Registrati con un nome utente di 3–40 caratteri e una password di almeno 12 caratteri. Nel sistema locale l’account può consultare i processi e registrare attività. Il visitatore demo consulta gli esempi. Il laboratorio consente prove temporanee. L’amministrazione è disponibile solo per un ruolo amministrativo fornito da un eventuale server.',steps:['Scegli Registrati per creare un account locale.','Accedi con le credenziali appena create.','Esporta periodicamente l’archivio.','Usa Esci al termine; al ricaricamento serve un nuovo accesso.'],example:'L’account locale di Paperina e quello di Paperino hanno archivi distinti.'}
];

// Explicit topics for each meaningful label; missing mappings produce no help button.
window.DQFieldTopics = {
  "Nome del processo": "field-name",
  "Codice": "field-code",
  "Area di riferimento": "field-area",
  "Responsabile istituzionale": "field-institutional",
  "Responsabile operative": "field-operational",
  "Responsabile operativo": "field-operational",
  "Attori coinvolti": "field-actors",
  "Scopo": "field-purpose",
  "Output principali": "field-outputs",
  "Struttura operativa": "field-structure",
  "Quando si attiva": "field-trigger",
  "Attività continue o ricorrenti": "field-recurring",
  "Finalità pratica": "field-practical",
  "Evidenze documentali": "field-evidence",
  "Indicatori di monitoraggio": "field-indicators",
  "Criticità ricorrenti": "field-issues",
  "Criticità ricorrenti / attenzione": "field-issues"
};
window.DQGuide.push(...[
  {
    "id": "INT.00",
    "title": "Internazionalizzazione",
    "category": "Voci delle schede",
    "eli": "Significa far collaborare il Dipartimento con università e persone di altri Paesi: studiare, insegnare, formarsi o fare ricerca insieme.",
    "body": "Il processo riunisce mobilità di studenti e personale, ospitalità di docenti e ricercatori, candidature internazionali e accordi con altri atenei. INT.00 è la scheda generale che coordina questi ambiti. Il termine non indica il semplice tradurre un documento in inglese.",
    "steps": [
      "Individua se l’attività riguarda studio, tirocinio, docenza, formazione, candidature, ospiti, accordi o monitoraggio.",
      "Apri il sottoprocesso corrispondente per i passaggi e i responsabili."
    ],
    "example": "Paperino trascorre un semestre di studio presso un’università estera: è un’attività di internazionalizzazione, in INT.01.",
    "examples": [
      "Pico de Paperis invita una ricercatrice di un ateneo estero per un seminario: il riferimento è INT.06.",
      "Rinominare in inglese una cartella interna, da solo, non avvia un’attività internazionale."
    ]
  },
  {
    "id": "INT.01",
    "title": "Erasmus Studio",
    "category": "Ambiti di lavoro",
    "eli": "Un periodo di studio presso un’università estera, con attività formative da concordare e riconoscere.",
    "body": "Questa scheda organizza la diffusione del bando Erasmus Studio, le informazioni agli studenti, la selezione secondo le competenze previste e la conservazione dei materiali.",
    "steps": [
      "Leggi “Quando si attiva” per capire se la procedura è quella giusta.",
      "Consulta i passaggi e collega qui solo le attività pertinenti."
    ],
    "example": "Paperino segue corsi in un ateneo estero: usa INT.01.",
    "examples": [
      "Qui svolge un tirocinio presso un museo estero: cerca INT.02, non questa scheda."
    ]
  },
  {
    "id": "INT.02",
    "title": "Erasmus Traineeship",
    "category": "Ambiti di lavoro",
    "eli": "Un tirocinio all’estero: impari lavorando presso un ente ospitante.",
    "body": "La scheda riguarda il bando di tirocinio, l’orientamento sulla sede, la lettera di accettazione quando richiesta e la documentazione della candidatura. La ricerca dell’ente è a carico del candidato salvo diverse indicazioni.",
    "steps": [
      "Leggi “Quando si attiva” per capire se la procedura è quella giusta.",
      "Consulta i passaggi e collega qui solo le attività pertinenti."
    ],
    "example": "Qui, Quo e Qua propongono un tirocinio in un museo estero e richiedono la lettera di accettazione.",
    "examples": [
      "Seguire lezioni con esami in un ateneo estero rientra invece in Erasmus Studio."
    ]
  },
  {
    "id": "INT.03",
    "title": "Staff Mobility for Teaching · mobilità per docenza",
    "category": "Ambiti di lavoro",
    "eli": "Un docente si reca all’estero per insegnare.",
    "body": "STA identifica la mobilità per attività didattica. La scheda prevede la verifica di sedi e accordi, la comunicazione del bando ai docenti e il supporto informativo alle candidature.",
    "steps": [
      "Leggi “Quando si attiva” per capire se la procedura è quella giusta.",
      "Consulta i passaggi e collega qui solo le attività pertinenti."
    ],
    "example": "Pico de Paperis tiene lezioni presso un’università partner: INT.03.",
    "examples": [
      "Archimede frequenta un corso per migliorare il proprio lavoro: è formazione, INT.04."
    ]
  },
  {
    "id": "INT.04",
    "title": "Staff Mobility for Training · mobilità per formazione",
    "category": "Ambiti di lavoro",
    "eli": "Una persona del personale va all’estero per imparare qualcosa di utile al proprio lavoro.",
    "body": "Riguarda la formazione di docenti e personale tecnico-amministrativo, secondo i destinatari del bando. L’esperienza deve essere coerente con il ruolo e produrre ricadute utili sui servizi o sulle attività del Dipartimento.",
    "steps": [
      "Leggi “Quando si attiva” per capire se la procedura è quella giusta.",
      "Consulta i passaggi e collega qui solo le attività pertinenti."
    ],
    "example": "Archimede impara a gestire archivi digitali presso un ente estero e al rientro condivide una procedura.",
    "examples": [
      "Pico che va a tenere un corso svolge docenza, non formazione: INT.03."
    ]
  },
  {
    "id": "INT.05",
    "title": "UniSa Scholarship e candidati extra-UE",
    "category": "Ambiti di lavoro",
    "eli": "Le procedure per borse e candidature di persone provenienti da Paesi esterni all’Unione europea.",
    "body": "La scheda distingue le competenze per corsi triennali e magistrali e descrive controllo delle candidature, requisiti di accesso, competenze linguistiche e comunicazione degli esiti. Universitaly è la piattaforma ministeriale usata quando pertinente alla procedura.",
    "steps": [
      "Leggi “Quando si attiva” per capire se la procedura è quella giusta.",
      "Consulta i passaggi e collega qui solo le attività pertinenti."
    ],
    "example": "Paperina rileva una candidatura extra-UE per una magistrale e coinvolge i referenti competenti per la valutazione.",
    "examples": [
      "Una richiesta di integrazione deve indicare il documento mancante e la scadenza della procedura, senza confonderla con un esito di ammissione."
    ]
  },
  {
    "id": "INT.06",
    "title": "Visiting Professors / Researchers · docenti e ricercatori ospiti",
    "category": "Ambiti di lavoro",
    "eli": "Un docente o un ricercatore di un’altra istituzione viene ospitato per lezioni, seminari o ricerca.",
    "body": "La scheda segue le proposte di candidatura, la compatibilità con le attività dipartimentali, il piano del soggiorno, gli eventuali passaggi agli organi competenti e la traccia delle attività svolte.",
    "steps": [
      "Leggi “Quando si attiva” per capire se la procedura è quella giusta.",
      "Consulta i passaggi e collega qui solo le attività pertinenti."
    ],
    "example": "Nonna Papera viene invitata dall’estero per un ciclo di seminari: si prepara un piano di attività.",
    "examples": [
      "Un professore interno che parte per insegnare all’estero segue invece la mobilità per docenza INT.03."
    ]
  },
  {
    "id": "INT.07",
    "title": "Cotutele dottorali e accordi internazionali",
    "category": "Ambiti di lavoro",
    "eli": "Una cotutela organizza un dottorato seguito da due atenei; un accordo stabilisce come due istituzioni collaborano.",
    "body": "Il contenuto della cotutela, compresi supervisione, periodi e titolo previsto, dipende dalla convenzione e dai regolamenti applicabili. La scheda traccia documenti, pareri, bozze, delibere e aggiornamenti dei registri. Una bozza non equivale a un accordo approvato.",
    "steps": [
      "Leggi “Quando si attiva” per capire se la procedura è quella giusta.",
      "Consulta i passaggi e collega qui solo le attività pertinenti."
    ],
    "example": "Pico e un ateneo estero preparano la convenzione per seguire insieme un dottorando.",
    "examples": [
      "Paperone invia una bozza di accordo: finché mancano le approvazioni resta una proposta, non un’intesa conclusa."
    ]
  },
  {
    "id": "INT.08",
    "title": "Rendicontazione e monitoraggio",
    "category": "Ambiti di lavoro",
    "eli": "Raccogliere ciò che è stato fatto e controllare cosa funziona, cosa manca e cosa migliorare.",
    "body": "La scheda usa dati ed evidenze dei sottoprocessi INT.01–INT.07 per preparare note periodiche, individuare criticità e proporre azioni verificabili. Non coincide con il solo conteggio delle registrazioni nel cruscotto.",
    "steps": [
      "Leggi “Quando si attiva” per capire se la procedura è quella giusta.",
      "Consulta i passaggi e collega qui solo le attività pertinenti."
    ],
    "example": "Paperina nota che mancano spesso gli attestati e propone una checklist prima della partenza.",
    "examples": [
      "Paperino registra chi deve preparare la checklist e quando verificarne l’efficacia: la proposta diventa un’azione controllabile."
    ]
  },
  {
    "id": "field-name",
    "title": "Nome del processo",
    "category": "Voci delle schede",
    "eli": "È il nome del lavoro organizzato che la scheda descrive.",
    "body": "In una scheda da redigere indica un ambito riconoscibile e stabile, non il titolo di un singolo evento. Nella schermata Processi il nome è già definito e si consulta.",
    "steps": [
      "Usa un nome che riassuma lo scopo comune delle attività.",
      "Per il titolo di un evento usa invece Oggetto nella registrazione."
    ],
    "example": "“Internazionalizzazione” può essere il nome del processo.",
    "examples": [
      "“Lezione di Pico del 12 ottobre” è un oggetto di attività, non il nome del processo."
    ]
  },
  {
    "id": "field-code",
    "title": "Codice del processo",
    "category": "Voci delle schede",
    "eli": "È la sigla che permette di riconoscere la procedura senza confonderla con altre.",
    "body": "INT identifica la famiglia Internazionalizzazione; INT.00 è la scheda generale e INT.01–INT.08 le schede operative. I codici sono assegnati nel catalogo: nella registrazione scegli il processo esistente, senza inventarne uno.",
    "steps": [
      "Copia il codice esatto se lo citi in una nota.",
      "Seleziona il codice dal menu quando registri un’attività."
    ],
    "example": "INT.02 individua Erasmus Traineeship.",
    "examples": [
      "INT.08 individua monitoraggio e rendicontazione."
    ]
  },
  {
    "id": "field-area",
    "title": "Area di riferimento",
    "category": "Voci delle schede",
    "eli": "È l’ambito organizzativo a cui appartiene il processo, non il nome di una persona.",
    "body": "Se stai predisponendo una scheda, indica la delega, il servizio o la funzione competente. Non inserire qui il responsabile, la sede geografica o il nome del progetto. Nella scheda attuale il valore è “Delega all’internazionalizzazione / AQ dipartimentale” e si consulta. AQ significa Assicurazione della Qualità.",
    "steps": [
      "Individua la funzione organizzativa che presidia il processo.",
      "Usa la denominazione adottata dal Dipartimento.",
      "Metti i ruoli delle persone nei campi dei responsabili."
    ],
    "example": "Esempio di area: “Delega all’internazionalizzazione / AQ dipartimentale”.",
    "examples": [
      "“Paperina” identifica una persona: non è un’area di riferimento."
    ]
  },
  {
    "id": "field-institutional",
    "title": "Responsabile istituzionale",
    "category": "Voci delle schede",
    "eli": "È il ruolo che risponde del processo a livello istituzionale.",
    "body": "Nel modello attuale è il Direttore di Dipartimento. Se redigi una scheda, indica il ruolo previsto dall’organizzazione; un eventuale nominativo deve essere accompagnato dal ruolo e coerente con l’incarico vigente. Non confonderlo con chi gestisce ogni giorno le attività. Questa schermata mostra la scheda validata e non modifica gli incarichi.",
    "steps": [
      "Verifica a chi compete la responsabilità istituzionale.",
      "Indica la qualifica prevista, evitando un elenco indistinto di collaboratori."
    ],
    "example": "“Direttore di Dipartimento” è il ruolo istituzionale indicato nella scheda.",
    "examples": [
      "Paperina può seguire le comunicazioni operative senza diventare per questo responsabile istituzionale."
    ]
  },
  {
    "id": "field-operational",
    "title": "Responsabile operativo",
    "category": "Voci delle schede",
    "eli": "È chi coordina concretamente il lavoro di tutti i giorni.",
    "body": "Indica il ruolo o l’ufficio che segue l’esecuzione e il raccordo fra gli attori. Nei sottoprocessi la responsabilità può variare: non dedurla soltanto da chi scrive una registrazione. Il valore presente nella scheda è consultabile, non assegnabile da questa pagina.",
    "steps": [
      "Leggi la responsabilità prevista per questa specifica scheda.",
      "Distingui coordinamento operativo da approvazione istituzionale."
    ],
    "example": "“Delegato del Dipartimento all’internazionalizzazione” coordina il processo generale.",
    "examples": [
      "Per alcune candidature extra-UE intervengono Ufficio didattica e Presidenti dei CdS secondo il livello del corso."
    ]
  },
  {
    "id": "field-actors",
    "title": "Attori coinvolti",
    "category": "Voci delle schede",
    "eli": "Sono le persone, i ruoli e gli uffici che partecipano, anche se non coordinano il processo.",
    "body": "Se redigi una scheda, elenca le funzioni che forniscono informazioni, svolgono verifiche, ricevono comunicazioni o contribuiscono alle decisioni. Non attribuire a tutti lo stesso compito: i passaggi operativi specificano le responsabilità. CdS significa Corso di Studio; PTA significa personale tecnico-amministrativo.",
    "steps": [
      "Elenca i ruoli e gli uffici effettivamente coinvolti.",
      "Indica nei passaggi quale attore fa che cosa."
    ],
    "example": "Docenti, studenti, Ufficio didattica e partner esteri possono essere attori dello stesso processo.",
    "examples": [
      "Pico può proporre un ospite mentre la Direzione segue le approvazioni: entrambi partecipano con compiti diversi."
    ]
  },
  {
    "id": "field-purpose",
    "title": "Scopo",
    "category": "Voci delle schede",
    "eli": "È il motivo per cui il processo esiste e il risultato generale che vuole ottenere.",
    "body": "Se redigi una scheda, scrivi il beneficio atteso in modo comprensibile. Non inserire qui il calendario dei passaggi o un elenco di file: quelli appartengono ad altre sezioni.",
    "steps": [
      "Rispondi a “Perché organizziamo questo lavoro?”.",
      "Descrivi il risultato generale, poi usa i passaggi per il come."
    ],
    "example": "“Promuovere mobilità e collaborazioni internazionali in modo tracciabile” esprime uno scopo.",
    "examples": [
      "“Inviare una mail lunedì” descrive invece una singola attività."
    ]
  },
  {
    "id": "field-outputs",
    "title": "Output principali",
    "category": "Voci delle schede",
    "eli": "Sono i risultati concreti prodotti dal lavoro.",
    "body": "Se redigi una scheda, indica documenti, comunicazioni, decisioni o altri risultati verificabili che devono essere disponibili alla fine. Distingui il risultato dall’azione che lo produce e dall’input usato per partire.",
    "steps": [
      "Nomina il risultato che sarà possibile controllare.",
      "Indica dove conservarlo nelle attività e negli allegati."
    ],
    "example": "Azione: inviare l’avviso sul bando. Output: mail inviata o avviso pubblicato.",
    "examples": [
      "Azione: discutere un accordo. Output: bozza, verbale o delibera secondo il passaggio."
    ]
  },
  {
    "id": "field-structure",
    "title": "Struttura operativa",
    "category": "Voci delle schede",
    "eli": "È la mappa di come la scheda generale si divide in procedure più specifiche.",
    "body": "Nel catalogo attuale INT.00 coordina INT.01–INT.08. Ogni sottoprocesso descrive input, responsabile, attività e output, seguiti da evidenze, indicatori e criticità. Questa voce illustra l’organizzazione del modello, non una registrazione da compilare.",
    "steps": [
      "Parti dalla scheda generale per orientarti.",
      "Apri la scheda operativa relativa al tipo di lavoro."
    ],
    "example": "Una mobilità per tirocinio segue INT.02; la nota periodica complessiva segue INT.08.",
    "examples": [
      "La singola attività di Paperino si collega alla procedura: non diventa un nuovo sottoprocesso."
    ]
  },
  {
    "id": "field-trigger",
    "title": "Quando si attiva",
    "category": "Voci delle schede",
    "eli": "È l’evento che fa partire questa procedura.",
    "body": "Se redigi una scheda, indica un fatto riconoscibile, come la pubblicazione di un bando o la ricezione di una proposta. Non è la data in cui hai aperto la piattaforma e non è lo stato di una singola attività.",
    "steps": [
      "Individua l’evento che richiede di iniziare il lavoro.",
      "Controlla se quell’evento si è verificato nel tuo caso."
    ],
    "example": "Per Erasmus Studio la procedura parte con la pubblicazione del bando di Ateneo.",
    "examples": [
      "Per una cotutela può partire da una richiesta o da una delibera del Collegio di Dottorato."
    ]
  },
  {
    "id": "field-recurring",
    "title": "Attività continue o ricorrenti",
    "category": "Voci delle schede",
    "eli": "Sono i compiti che si ripetono mentre la procedura è attiva.",
    "body": "Se redigi una scheda, descrivi le azioni da mantenere nel tempo, senza confonderle con il solo evento iniziale. Nella registrazione annota gli interventi significativi, non necessariamente ogni richiesta ordinaria.",
    "steps": [
      "Indica quali richieste o controlli tornano più volte.",
      "Distingui il presidio ricorrente dai passaggi una tantum."
    ],
    "example": "Rispondere alle domande sul bando è un’attività ricorrente.",
    "examples": [
      "La pubblicazione del bando è invece l’evento iniziale, descritto in “Quando si attiva”."
    ]
  },
  {
    "id": "field-practical",
    "title": "Finalità pratica",
    "category": "Voci delle schede",
    "eli": "È ciò che questa specifica procedura deve rendere possibile.",
    "body": "Se redigi una scheda, spiega quale problema risolve per i suoi destinatari. È più concreta dello scopo generale e non si esaurisce nell’elenco dei documenti da produrre.",
    "steps": [
      "Chiediti cosa devono poter fare gli utenti grazie alla procedura.",
      "Descrivi un risultato utile nel contesto della scheda."
    ],
    "example": "Per il tirocinio: far capire al candidato come individuare la sede e preparare i documenti richiesti.",
    "examples": [
      "Per una visita: pianificare lezioni e ricerca coerenti con le attività del Dipartimento."
    ]
  },
  {
    "id": "field-evidence",
    "title": "Evidenze documentali",
    "category": "Voci delle schede",
    "eli": "Sono le prove conservate che permettono di verificare ciò che è stato fatto.",
    "body": "Indica documenti pertinenti e rintracciabili: mail, verbali, delibere, attestazioni o report. Un risultato può diventare evidenza quando viene conservato e collegato alla sua attività. Nella piattaforma gli allegati si aggiungono dopo il salvataggio della registrazione.",
    "steps": [
      "Scegli il documento che dimostra l’azione o la decisione.",
      "Collegalo all’attività con un nome comprensibile."
    ],
    "example": "L’avviso sul bando e la mail inviata agli studenti dimostrano la diffusione dell’opportunità.",
    "examples": [
      "Una nota “fatto” senza documento o riferimento può non bastare a ricostruire la decisione."
    ]
  },
  {
    "id": "field-indicators",
    "title": "Indicatori di monitoraggio",
    "category": "Voci delle schede",
    "eli": "Sono misure che aiutano a capire come sta andando il processo.",
    "body": "Se redigi una scheda, specifica cosa misuri, su quale periodo e da quali dati. I conteggi della piattaforma descrivono soltanto le attività registrate: non diventano automaticamente indicatori ufficiali o misure di qualità.",
    "steps": [
      "Definisci la misura in modo ripetibile.",
      "Specifica periodo, fonte e, se usi percentuali, il totale di riferimento."
    ],
    "example": "“Candidature ricevute nel semestre” ha un periodo riconoscibile.",
    "examples": [
      "“4 fascicoli completi su 5 verificati” è più interpretabile di un generico “80% completato”."
    ]
  },
  {
    "id": "field-issues",
    "title": "Criticità ricorrenti e punti di attenzione",
    "category": "Voci delle schede",
    "eli": "Sono gli ostacoli che tornano o gli aspetti da controllare con cura.",
    "body": "Descrivi un problema osservabile, le conseguenze sul lavoro e un eventuale accorgimento. Distingui una criticità ripetuta da un caso isolato e dal suo rimedio: l’azione di miglioramento deve avere un responsabile e una verifica.",
    "steps": [
      "Indica cosa accade e in quali casi.",
      "Collega esempi o evidenze pertinenti.",
      "Proponi una prossima azione concreta."
    ],
    "example": "“Attestati ricevuti spesso dopo la chiusura del fascicolo” descrive una criticità.",
    "examples": [
      "“Inviare una checklist prima della partenza” è una possibile azione per ridurla."
    ]
  },
  {
    "id": "subprocesses",
    "title": "Sottoprocessi collegati",
    "category": "Voci delle schede",
    "eli": "Sono le diverse strade operative dentro lo stesso processo generale.",
    "body": "Ogni sottoprocesso ha un codice e uno scopo specifico. Non è una sottoattività di una registrazione e non è un ufficio. Questa sezione indica quando usare ciascuna scheda INT.01–INT.08.",
    "steps": [
      "Scegli in base al tipo di lavoro, non al nome dell’autore.",
      "Apri la scheda dal menu per consultare l’intera procedura."
    ],
    "example": "Il tirocinio di Qui e il tirocinio di Quo sono due attività dello stesso sottoprocesso INT.02.",
    "examples": [
      "Un accordo internazionale segue INT.07; il suo monitoraggio complessivo può alimentare INT.08."
    ]
  },
  {
    "id": "operational-steps",
    "title": "Passaggi operativi: input, responsabile, attività e output",
    "category": "Voci delle schede",
    "eli": "Ogni passaggio dice cosa serve per partire, chi agisce, cosa fa e quale risultato lascia.",
    "body": "Input è il materiale di partenza. Responsabile è il ruolo che svolge quel passaggio. Attività è l’azione. Output è il risultato atteso. Apri una riga per consultare i quattro elementi. Una casella vuota nel documento originale non autorizza a inventare un requisito.",
    "steps": [
      "Leggi l’input disponibile.",
      "Verifica il ruolo assegnato e l’azione.",
      "Conserva l’output quando registri l’attività."
    ],
    "example": "Per comunicare il bando: input = bando pubblicato; responsabile = Delegato; attività = inviare la comunicazione; output = mail inviata.",
    "examples": [
      "Per approvare una proposta: input = bozza; responsabile = organo competente; attività = discutere e deliberare; output = verbale o delibera."
    ]
  },
  {
    "id": "search-text",
    "title": "Testo da cercare",
    "category": "Filtri di ricerca",
    "eli": "Scrivi una parola che ricordi del titolo, della nota o del nome di un allegato.",
    "body": "La ricerca non legge il contenuto dei documenti allegati. La parola si combina con i filtri scelti; premi Cerca o Invio per aggiornare i risultati.",
    "steps": [
      "Inserisci una parola riconoscibile.",
      "Se non trovi nulla, controlla anche i filtri attivi."
    ],
    "example": "“Paperina” trova i riferimenti a Paperina presenti in titoli o annotazioni.",
    "examples": [
      "“verbale” può trovare un file chiamato verbale.txt, ma non una parola presente soltanto al suo interno."
    ]
  },
  {
    "id": "filter-code",
    "title": "Filtro per processo",
    "category": "Filtri di ricerca",
    "eli": "Mostra solo le attività archiviate nella procedura selezionata.",
    "body": "Scegli un codice esistente oppure “Tutti i processi”. Il filtro restringe i risultati senza spostare o modificare le registrazioni.",
    "steps": [
      "Seleziona il processo da consultare.",
      "Torna a Tutti i processi per ampliare la ricerca."
    ],
    "example": "INT.02 mostra i tirocini, anche se hanno autori diversi.",
    "examples": [
      "Un accordo in INT.07 non appare mentre è selezionato INT.01."
    ]
  },
  {
    "id": "filter-status",
    "title": "Filtro per stato",
    "category": "Filtri di ricerca",
    "eli": "Mostra solo il lavoro che è al punto che ti interessa.",
    "body": "Aperta, In corso e Conclusa corrispondono allo stato salvato nelle registrazioni. “Tutti gli stati” li include tutti. Cambiare questo filtro non cambia lo stato delle attività.",
    "steps": [
      "Scegli lo stato da trovare.",
      "Per modificare uno stato apri il dettaglio e Modifica registrazione."
    ],
    "example": "In corso mostra anche la formazione di Archimede ancora in attesa di attestato.",
    "examples": [
      "Conclusa mostra il seminario terminato di Pico, se registrato con quello stato."
    ]
  },
  {
    "id": "filter-date",
    "title": "A partire dal",
    "category": "Filtri di ricerca",
    "eli": "È il primo giorno da includere nei risultati.",
    "body": "Il filtro considera la data dell’attività e include il giorno selezionato. Non usa la data di creazione della registrazione. Lascia vuoto il campo per non applicare un limite iniziale.",
    "steps": [
      "Inserisci il primo giorno del periodo che vuoi consultare.",
      "Svuota il campo per includere anche le attività precedenti."
    ],
    "example": "Con 1 novembre trovi le attività del 1 novembre e dei giorni successivi.",
    "examples": [
      "Una lezione svolta il 12 ottobre non compare da novembre, anche se è stata registrata a novembre."
    ]
  }
]);
const extraGuideExamples = {
  "inizio": "Puoi iniziare da una procedura senza creare registrazioni: Pico consulta prima la scheda Visiting e poi prepara il suo invito.",
  "demo": "Creare una prova nel laboratorio non aggiunge attività all’archivio locale personale di Paperina.",
  "processi": "Due bandi Erasmus Studio in anni diversi producono attività distinte sotto la stessa procedura INT.01.",
  "code": "La bozza di convenzione di Paperone va in INT.07; il riepilogo annuale dei risultati va in INT.08.",
  "step": "Una nota trasversale sul bando può restare senza passaggio specifico: non occorre forzare un collegamento.",
  "subject": "“Tirocinio di Quo: ricevuta la lettera di accettazione” distingue il candidato e l’aggiornamento.",
  "date": "Paperina corregge oggi una nota su un evento di ottobre: lo storico registra la modifica di oggi, la data dell’evento resta ottobre.",
  "status": "L’accordo di Paperone ancora in bozza è Aperto; il seminario terminato di Pico è Concluso.",
  "description": "“Quo ha ricevuto la lettera di accettazione. Paperina controllerà la firma prima dell’invio” conserva fatto e prossima azione.",
  "review": "Se noti che il tirocinio è stato collegato a Erasmus Studio, torna al primo passaggio e scegli INT.02 prima di salvare.",
  "search": "Il CSV dei risultati filtrati su INT.02 contiene le attività del tirocinio, ma non i loro allegati.",
  "attachments": "Una checklist di Paperina e una lettera di accettazione possono essere due allegati della stessa attività.",
  "history": "Se Paperina corregge una data, lo storico conserva una nuova voce; aprirne una precedente non annulla la correzione.",
  "monitoraggio": "Una sola registrazione può riassumere più azioni: il conteggio non equivale al numero di studenti partiti.",
  "backup": "Passare da un computer all’altro richiede esportazione e importazione: l’account locale non trasferisce da solo i dati.",
  "account": "Accedere sul computer di Qui non rende visibile l’archivio conservato nel browser di Quo."
};
for (const article of window.DQGuide) { if(extraGuideExamples[article.id]) article.examples = [...(article.examples || []), extraGuideExamples[article.id]]; }

window.DQGuide.push({id:'personal-workspace',category:'Documenti personali',title:'La cartella personale nel browser',eli:'Scegli una cartella del tuo computer e consulta qui gli stessi file. I documenti restano sul computer: allegarne uno a un’attività crea una copia separata.',body:'Apri Spazio personale dal menu o dalla schermata di accesso. Su Chrome ed Edge desktop puoi collegare una cartella e creare nuove note TXT. Il collegamento può richiedere una nuova autorizzazione alla riapertura. La cartella viene riletta ogni 15 secondi mentre lo spazio personale è aperto e visibile, oppure con Rileggi cartella. Negli altri browser la lettura è una fotografia da aggiornare riselezionando la cartella. A browser chiuso non c’è sincronizzazione; il backend cloud non è ancora disponibile. Dopo il primo caricamento del sito e la conferma della disponibilità offline puoi riaprire l’interfaccia senza rete.',steps:['Crea o scegli Documenti/DiSPAC Qualità sul computer e usa Collega cartella.','Apri un documento per leggerlo; per modificare un file esistente usa il programma abituale sul computer.','Rileggi la cartella per vedere gli aggiornamenti. Crea una nota per aggiungere un nuovo TXT senza sovrascrivere file.','Se sei entrato con un account operativo, seleziona un’attività e premi Allega copia per trasferire quel solo documento.'],example:'Paperina corregge un verbale dal suo programma sul computer; nel portale rilegge la cartella e apre la nuova versione.',examples:['Paperino allega una copia del verbale alla sua attività. Una correzione successiva nella cartella non modifica automaticamente quella copia.','Scollegare la cartella dal portale non elimina i documenti dal computer.']});

window.DQGuide.push(
 {id:'personal-templates',category:'Scrittura e riuso',title:'Modelli personali precompilati',eli:'Un modello è un foglio già impostato: ogni volta ne usi una copia e completi solo ciò che cambia.',body:'Nei nuovi documenti e nelle nuove attività scegli un modello e premi Usa modello. I modelli iniziali sono pronti; Salva come modello crea una tua base riutilizzabile. Sono separati per account. Le attività riusate ripartono da oggi e dallo stato Aperta: identificativi, collegamenti e allegati non vengono copiati. I campi fra parentesi quadre richiedono il tuo intervento; {{nome}} e {{data}} vengono sostituiti al momento dell’uso. La raccolta Bozze e modelli permette di usare, rinominare ed eliminare i modelli personali.',steps:['Compila un documento o un’attività con il testo che vuoi riusare.','Premi Salva come modello e scegli un nome riconoscibile.','Quando inizi un nuovo lavoro, seleziona il modello e premi Usa modello.','Controlla i contenuti prima di completare: un modello non è una copia aggiornata di una pratica.'],example:'Paperina salva un modello di richiesta di integrazione e lo riusa per candidati diversi.',examples:['Pico sceglie Verbale di riunione: trova sezioni per partecipanti, decisioni e prossime azioni già predisposte.']},
 {id:'saved-drafts',category:'Scrittura e riuso',title:'Salvare e riprendere una bozza',eli:'La bozza conserva il lavoro a metà, anche se non hai ancora un titolo, una data o tutto il testo.',body:'Premi Salva bozza in qualsiasi passaggio dell’attività o nell’editor dei documenti. Il salvataggio è esplicito: guarda il messaggio di riuscita prima di uscire. Ritrovi la bozza in Bozze e modelli, nello stesso account e browser. Le bozze non entrano nei conteggi delle attività, non generano storico e non modificano un documento completo. Quando completi e salvi, la bozza viene rimossa dopo il salvataggio riuscito. La demo è in sola lettura; nel laboratorio anche le bozze sono temporanee. Esporta dati include bozze e modelli dell’account locale.',steps:['Scrivi quello che hai già a disposizione.','Premi Salva bozza e attendi la conferma.','Riapri Bozze e modelli e scegli Riprendi bozza.','Completa i campi richiesti e salva il documento o l’attività.'],example:'Paperino lascia vuoto l’oggetto ma scrive le prime annotazioni e salva una bozza al secondo passaggio.',examples:['Paperina prepara una modifica a un verbale completo e la salva come bozza: il verbale precedente rimane disponibile fino al salvataggio completo.']},
 {id:'document-title',category:'Documenti testuali',title:'Titolo del documento',eli:'È l’etichetta del documento e la base del nome del file che scaricherai.',body:'Usa un titolo specifico, fino a 250 caratteri, per riconoscere il testo nella raccolta Documenti. Serve per salvare un documento completo; può mancare in una bozza. Il nome scaricato viene adattato ai caratteri consentiti su Mac e Windows.',steps:['Indica il tipo di documento e il suo oggetto.','Distingui documenti simili con un riferimento comprensibile.'],example:'Verbale della riunione sul tirocinio di Quo è più chiaro di Documento nuovo.',examples:['Relazione sulla visita di Archimede distingue il testo da una generica relazione annuale.']},
 {id:'document-body',category:'Documenti testuali',title:'Testo del documento',eli:'Qui scrivi il contenuto che vuoi conservare, leggere o allegare.',body:'L’editor contiene testo, fino a un milione di caratteri. Puoi usare righe vuote, paragrafi e tabulazioni; non è un elaboratore di impaginazione con immagini e tabelle Word. Anteprima mostra il risultato nel lettore. Il documento completo richiede testo non vuoto; la bozza può essere incompleta.',steps:['Scrivi o applica un modello.','Completa i segnaposto fra parentesi.','Controlla Anteprima, poi salva come completo o come bozza.'],example:'Paperina compila nel verbale le decisioni e lascia in bozza la parte sulle scadenze.',examples:['Pico riusa il modello di relazione e aggiunge gli esiti del seminario.']},
 {id:'document-format',category:'Documenti testuali',title:'Formato di esportazione',eli:'Scegli il tipo di file con cui vuoi portare il testo fuori dal portale.',body:'TXT conserva testo semplice in UTF-8. RTF rende il testo apribile in Word e LibreOffice, con caratteri Unicode, paragrafi e tabulazioni. Markdown conserva i marcatori come testo. Il portale non genera DOCX, impaginazioni complesse o PDF da questo editor. Cambiare formato non converte allegati caricati da altri programmi.',steps:['Scegli TXT per testo semplice, RTF per aprirlo in un elaboratore di testi o Markdown per conservarne i marcatori.','Salva il documento e usa Scarica nella raccolta Documenti.'],example:'Paperina esporta il verbale in RTF e lo rifinisce in Word.',examples:['Archimede conserva una nota tecnica in TXT per leggerla anche con un editor semplice.']},
 {id:'document-compatibility',category:'Lettura dei documenti',title:'Formati supportati e lettura adattiva',eli:'Il lettore cambia strumenti in base al documento: testo leggibile, tabella per i dati o lettore PDF.',body:'TXT gestisce UTF-8, UTF-16 con BOM e Windows-1252. RTF mostra testo e stili di base; immagini, oggetti e impaginazioni complesse non vengono riprodotti. Markdown viene letto come testo senza eseguire HTML. JSON valido è rientrato per leggerlo meglio; se non valido resta leggibile come testo. CSV supporta virgola, punto e virgola e tabulazioni, con righe tra virgolette e tabelle paginate. PDF usa il lettore integrato del browser: scansioni senza testo richiedono OCR, non incluso. DOCX, XLSX e ODT restano scaricabili, ma non hanno anteprima. Dimensione del testo, a capo e ricerca sono disponibili nel lettore testuale espanso; nei CSV la ricerca filtra le righe.',steps:['Apri un allegato e premi Espandi.','Per i testi regola dimensione e a capo, oppure cerca una parola.','Per i CSV filtra e sfoglia le righe.','Per formati non visualizzati scarica il documento e usa il programma abituale.'],example:'Paperina filtra una tabella CSV scrivendo il nome di un candidato.',examples:['Pico ingrandisce un verbale RTF; Paperino apre un PDF scansionato ma sa che il portale non ne riconosce automaticamente il testo.']}
);
