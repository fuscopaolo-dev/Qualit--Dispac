# Webapp senza Python

Aprire **index.html nella root** direttamente nel browser, anche con `file://`.
CSS e JavaScript si trovano in `web/`. Le schede sono caricate tramite
`web/content-data.js`, senza chiamate HTTP né problemi CORS per i file locali.
`content.json` rimane la sorgente dei contenuti; dopo averlo modificato, eseguire
la build per aggiornare il file JavaScript corrispondente.

## File unico e pubblicazione

Con Node 22 o superiore, senza dipendenze:

```sh
npm run build
npm test
```

`dist/dispac.html` è il file unico trasportabile: HTML, CSS, JavaScript e contenuti
incorporati, senza risorse esterne. Si apre direttamente con doppio clic.
La build produce anche `dist/index.html` per l'hosting. Per gli utenti finali
Node non serve. Gli allegati caricati e i dati dell'utente rimangono nello storage
del browser, non vengono aggiunti automaticamente al file HTML: si trasferiscono
con Esporta/Importa dati. I documenti Word originali non sono incorporati.

GitHub Actions pubblica `dist/` su Pages dopo un push su `main`. Impostare
Settings → Pages → Source: GitHub Actions. Non ci sono più passaggi Python.
Su un hosting statico si può caricare `dist/index.html` da solo; in alternativa,
caricare `index.html`, `config.js` e `web/` rispettando la struttura delle cartelle.

## Archivio locale

La modalità predefinita funziona su Pages e da file. Account con password
PBKDF2-SHA256 (210000 iterazioni e salt casuale), sessione in memoria fino a
ricaricamento/uscita, attività per account, storico, ricerca, CSV e allegati
sono gestiti da `web/data-service.js` tramite localStorage. Il profilo locale
può registrare e consultare attività. Non esistono ruoli amministrativi locali.
L'accesso locale organizza gli archivi: non protegge da chi controlla il browser.
Non è autenticazione multiutente sul server, né un database condiviso.
Attività e allegati non sono cifrati. Usare una password dedicata.

L'archiviazione può essere disabilitata, limitata o eliminata dal browser.
Allegati: massimo 2 MB ciascuno; lo spazio totale dipende dal browser.
Gli errori di quota vengono mostrati senza dichiarare riuscito il salvataggio.
Per `file://` il comportamento dello storage dipende dal browser e dal percorso:
esportare l'archivio prima di spostare il file o cambiare origine/profilo.
Esporta dati salva attività, allegati, storico, documenti, bozze e modelli personali dell'account, senza credenziali.
Importa dati valida e sostituisce tale archivio dopo conferma.
Il database SQLite precedente non è migrato automaticamente.

## Futuro backend PHP/MySQL (Altervista o hosting equivalente)

Un hosting con MySQL fornisce il database al codice eseguito sul server, non al
browser. Basta un endpoint sullo stesso hosting, ad esempio `api.php`: non è
necessario acquistare o gestire un servizio API separato. PHP deve tenere le
credenziali SQL sul server e usare query parametrizzate, sessioni con cookie
HttpOnly/Secure, CSRF, controlli di ruolo e validazione. Il frontend non deve
ricevere password SQL o decidere i permessi.

Il punto di collegamento è **config.js**, `apiUrl`. Lasciarlo vuoto per la modalità
locale. Quando il backend sarà implementato, impostarlo a `./api.php` prima della
build (oppure modificare config.js nella distribuzione a più file).
Il frontend inoltrerà le richieste a `api.php?route=/login`, `/register`, `/me`,
`/content`, `/records`, `/history/{id}`, `/attachment`, `/attachment/{id}`,
`/logout` e, per gli amministratori remoti, `/users` e `/backup`.
Le query di ricerca sono mantenute. Il corpo POST è JSON; le risposte sono JSON,
tranne download di allegati e backup. Gli errori HTTP usano `{ "error": "..." }`.
`/me` restituisce `{user:null}` oppure `{user:{id,username,display_name,role,csrf}}`.
`/register` e `/login` ricevono username/password (più display_name per registrazione).
`/records` restituisce `{records:[...]}`, il salvataggio `{ok:true,id}`;
`/history/{id}` restituisce `{history:[...]}`. Le strutture delle attività sono
visibili nell'adattatore locale. I POST inviano `X-CSRF-Token` ricevuto da `/me`.
Il server deve assegnare i ruoli: non fidarsi di valori inviati dal client.

Il backend PHP/MySQL non è incluso in questa modifica: richiede schema, gestione
sicura degli account e collaudo sull'hosting scelto. Il cambio di configurazione
da solo non crea il database o il servizio. Nessuna connessione SQL remota è
stata provata. I dati locali non sono sincronizzati automaticamente col server.

## Anteprime dei documenti

Nei dettagli di un'attività, gli allegati TXT, RTF, PDF, Markdown, CSV e JSON hanno un'anteprima
compatta e il pulsante **Espandi**, che apre il documento completo nella
piattaforma. Il download rimane un'azione separata. Il lettore è incluso anche
nel file HTML unico e non usa servizi esterni.

TXT: UTF-8, UTF-16 con BOM e Windows-1252. RTF: testo completo con paragrafi,
grassetto, corsivo e sottolineatura; immagini incorporate, oggetti e impaginazioni
complesse non sono riprodotti. PDF: visualizzatore integrato del browser con
navigazione e zoom; serve un browser che supporti i PDF incorporati. I file
con estensioni diverse rimangono scaricabili senza anteprima.

La finestra espansa si chiude con Chiudi o Esc e ripristina il focus sul pulsante
Espandi. Gli URL temporanei dei PDF vengono liberati quando si cambia vista
oppure si apre un altro dettaglio. Le anteprime non richiedono modifiche ai
vecchi archivi e non scaricano file sul dispositivo automaticamente.

## Wiki, aiuto contestuale e demo Paperopoli

La voce **Wiki e guide** contiene guide cercabili per ciascuna voce significativa: primi passi, processi,
compilazione, archivio, allegati, storico, monitoraggio, account e copie dei dati.
Ogni articolo propone una spiegazione in arancio pallido, senza titoletto,
istruzioni pratiche e almeno due esempi. Gli aiuti si applicano esplicitamente
alle singole etichette: area, responsabilità, finalità, evidenze e ambiti
dei sottoprocessi hanno spiegazioni distinte. Non si aggiungono aiuti generici
a schede ripetute, statistiche o voci di navigazione. I contenuti sono mantenuti in `web/guide.js` e inclusi nella build.
I pulsanti `?` compaiono al passaggio del mouse e al focus da tastiera; sui touch
restano visibili. Aprono un pannello laterale con Esc, ripristino del focus e un
collegamento alla wiki completa. Il pulsante Guida in alto è sempre disponibile.

**Visita la piattaforma demo** carica nove attività fittizie ispirate a Paperopoli,
una per ciascun codice INT.00–INT.08, con nove allegati TXT UTF-8 e storico.
`web/demo-data.js` genera questa raccolta senza scriverla in localStorage.
**Prova la compilazione** apre un laboratorio modificabile in memoria: si possono
creare e aggiornare attività, caricare allegati e leggere lo storico. Ricaricare o
uscire elimina le prove. Gli account locali restano separati e inizialmente vuoti.
La demo consultabile e il laboratorio sono disponibili solo in modalità locale.

La compilazione di nuove attività e modifiche procede in tre passaggi: contesto,
contenuto e riepilogo. I campi richiesti vengono verificati prima del riepilogo;
Indietro conserva gli input. Il salvataggio avviene solo alla conferma finale.
La navigazione con dati non salvati richiede conferma per evitare perdite.
Dopo il salvataggio si possono collegare i documenti nel dettaglio dell’attività.


## Cartella personale e interfaccia offline

**Spazio personale** è disponibile dal menu e dalla schermata di accesso. Su
Chrome/Edge desktop può collegare una cartella reale con permesso esplicito,
ricordarla, rileggere i documenti, creare nuovi TXT senza sovrascritture e
allegare una copia scelta a un’attività. Gli altri browser hanno una selezione
in sola lettura da ripetere per aggiornare i file.

La build genera `sw.js` nella root e in `dist/`. Pubblicare anche questo file:
con HTTPS, dopo il primo caricamento, il service worker conserva esclusivamente
l’interfaccia pubblica per riaprire lo spazio personale offline. Non conserva
risposte API o documenti privati nella cache. Il file unico HTML rimane utilizzabile
senza service worker; la cache del sito richiede che `sw.js` sia pubblicato accanto.

Non è una sincronizzazione cloud: la cartella viene riletta solo mentre lo spazio
personale è aperto e visibile; i file allegati sono copie indipendenti. Il progetto
browser-only, i limiti di compatibilità, le prove da svolgere su Mac e Windows e
il protocollo proposto per il futuro cloud sono in [SPAZIO_PERSONALE.md](SPAZIO_PERSONALE.md).

## Documenti, modelli e bozze

La voce **Documenti** permette di creare testi da modelli iniziali o personali,
salvarli completi, esportarli in TXT/RTF/Markdown e allegarne copie alle attività.
**Salva bozza** conserva una compilazione incompleta senza validarla come elemento
completo; le attività riprendono dal passaggio salvato. **Bozze e modelli** raccoglie
il lavoro personale. Il salvataggio delle bozze è esplicito, senza autosalvataggio.
Le raccolte sono isolate per account e incluse in Esporta/Importa dati.

Il lettore include TXT, RTF, PDF, Markdown come testo, CSV tabellare e JSON.
Nei testi espansi sono disponibili dimensione, a capo e ricerca; i CSV hanno
paginazione e filtro. La compatibilità, i limiti di fedeltà, le nuove strutture
e il contratto del futuro backend sono in
[DOCUMENTI_MODELLI_BOZZE.md](DOCUMENTI_MODELLI_BOZZE.md).
