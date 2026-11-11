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
Esporta dati salva attività, allegati e storico dell'account, senza credenziali.
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
