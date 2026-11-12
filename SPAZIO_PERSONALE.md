# Spazio personale nel browser: funzionamento e sviluppo

## Disponibile adesso

Lo spazio personale si apre sia dalla schermata di accesso sia dal menu del
portale. Non richiede un account per leggere documenti del proprio computer.
L’archivio delle attività richiede invece il normale accesso.

Su Chrome o Edge desktop, sia Mac sia Windows, il pulsante **Collega cartella**
usa la File System Access API. L’utente può creare o scegliere, ad esempio,
`Documenti/DiSPAC Qualità` dal selettore del sistema. Il sito non può imporre un
percorso né entrare in una cartella senza il permesso del browser.

- La cartella selezionata è quella reale, visibile anche nel Finder o in Esplora
  file. Non è una seconda copia caricata nel browser.
- Il collegamento viene ricordato in IndexedDB quando consentito. Alla riapertura
  possono essere necessari **Ripristina accesso** o una nuova selezione.
- I documenti vengono riletti ogni 15 secondi mentre la finestra dello spazio
  personale è aperta e la pagina è visibile, al ritorno alla pagina e con
  **Rileggi cartella**. Non si usano API sperimentali di osservazione del filesystem.
- Se il file aperto cambia dimensione o data di modifica, l’anteprima viene
  chiusa e viene richiesto di aprire la nuova versione. Il controllo non è un
  sistema di versionamento: un programma che conserva entrambe le proprietà
  può richiedere una riapertura manuale per vedere il contenuto aggiornato.
- TXT, RTF e PDF hanno l’anteprima già disponibile nel portale. Gli altri formati
  si aprono dal normale programma sul computer; il download produce una copia.
- **Crea una nota nella cartella** scrive un nuovo TXT con nome univoco. Non
  sovrascrive documenti esistenti e non modifica un file aperto in Word o Pages.
- **Allega copia** trasferisce soltanto il file scelto all’attività selezionata.
  Questa è un’azione esplicita. La copia archiviata e il file locale restano
  indipendenti; eventuali aggiornamenti successivi non si propagano.
- **Scollega** rimuove il collegamento, senza eliminare documenti sul computer.

La cartella è personale al profilo del browser, non associata a un account del
portale. Su computer condivisi usare un profilo del browser personale e scollegare
la cartella al termine. Non vengono caricati elenchi o contenuti a un servizio
esterno durante la consultazione.

La lettura è limitata a 500 file e 8 livelli di sottocartelle; file e cartelle
nascosti vengono ignorati. Un messaggio segnala un elenco parziale. Le anteprime
sono limitate a 20 MB; gli allegati rispettano i limiti dell’archivio attuale
(2 MB locale, 20 MB nel contratto del futuro backend). Un errore di lettura viene
mostrato senza dichiarare completa una scansione non riuscita.

## Browser e modalità offline

| Modalità | Chrome/Edge desktop su Mac e Windows | Altri browser |
| --- | --- | --- |
| Cartella reale con permesso ricordabile | Sì, su HTTPS o localhost, se consentito dalle policy | Non garantita; rilevamento della capacità a runtime |
| Lettura di una cartella selezionata | Sì | Selettore di cartella, quando disponibile |
| Rilettura senza riselezionare | Sì, mentre lo spazio personale è aperto | No: riselezionare per acquisire una nuova fotografia |
| Creazione di nuovi TXT nella cartella | Sì, con permesso di scrittura | Non disponibile nella modalità di sola lettura |
| Sincronizzazione con browser chiuso | No | No |

Il service worker conserva **solo i file pubblici dell’interfaccia**. Bisogna
aprire il sito online almeno una volta, su HTTPS o localhost, e attendere la
conferma della disponibilità offline. In seguito si può riaprire lo spazio
personale senza rete. Il browser può comunque eliminare cache e permessi: questo
non elimina i file nella cartella sul computer.

La cache non include risposte API, credenziali, allegati privati o contenuti della
cartella. Le attività locali continuano a usare il loro archivio nel browser.
L’accesso e le operazioni del futuro archivio sul server richiederanno rete.
Per la distribuzione a file unico, pubblicare anche `dist/sw.js` accanto all’HTML
per abilitare la cache del sito; il solo file HTML salvato sul computer rimane
apribile direttamente, ma non installa il service worker.

Non si promette sincronizzazione continua a browser chiuso: le API web non
forniscono un processo permanente e portabile per questa funzione. La preferenza
per una soluzione senza client desktop viene rispettata.

## Sincronizzazione con il futuro cloud: proposta

Il repository non contiene ancora il backend PHP/MySQL. Il selettore di cartella
e il service worker non creano un servizio cloud. La sincronizzazione proposta
richiede un’implementazione separata, con questi vincoli:

1. **Spazi distinti e visibili.** “Personale sul computer” e “Archivio condiviso”
   devono avere etichette, ricerca e permessi distinti. Ogni documento mostra se è
   solo locale, copiato, aggiornato, in attesa oppure in conflitto.
2. **Collegamento volontario.** Un documento entra nella sincronizzazione soltanto
   dopo una scelta esplicita. Creare un manifesto locale in una sottocartella
   dedicata con UUID stabili, percorso relativo, hash SHA-256, ultima revisione
   comune e versione del formato. I nomi e le date non bastano come identità.
3. **Backend con versioni.** SQL conserva metadati e permessi; lo storage conserva
   versioni immutabili del contenuto. Il server calcola e verifica hash e dimensione.
   Le modifiche usano revisioni/ETag e `If-Match`: nessun aggiornamento cieco.
4. **Scansione al ritorno.** Dopo una pausa, una perdita di rete o la riapertura,
   rileggere manifesto, cartella e revisioni remote. Se necessario chiedere di nuovo
   il permesso. Il recupero non presume che gli eventi del filesystem siano arrivati.
5. **Coda persistente.** IndexedDB conserva operazioni idempotenti con UUID e stato.
   I tentativi interrotti possono ripartire senza duplicare documenti. Evitare
   l’accodamento di contenuti con credenziali o URL temporanei come fonte permanente.
6. **Conflitti conservativi.** Se locale e remoto cambiano rispetto alla stessa base,
   tenere entrambe le versioni. Mostrare “Conserva locale”, “Conserva cloud” e
   “Conserva entrambe”, con anteprima. Per file binari evitare fusioni automatiche.
7. **Nessuna cancellazione implicita.** Un file assente può essere spostato, non
   disponibile o realmente cancellato. La prima versione non propaga cancellazioni
   automaticamente: servono conferma, cestino e recupero della versione.
8. **Download sicuro.** Salvare nuove versioni con nome univoco invece di sostituire
   un file che un programma esterno potrebbe stare scrivendo. Anche un controllo
   hash prima della scrittura non è un blocco atomico per Word o Pages. Un eventuale
   comando di sostituzione deve preservare una copia di recupero e spiegare il limite.
9. **Permessi sul server.** Sessioni e autorizzazioni vengono verificate dal backend.
   Il portale non conserva password del computer e non trasferisce l’intera cartella
   per effetto del solo collegamento.

Una prima versione browser-only dovrebbe offrire **Sincronizza ora**, anteprima
completa dei trasferimenti e conflitti, e aggiornamento durante l’uso del portale.
L’eventuale sincronizzazione silenziosa viene dopo il collaudo del protocollo.

## Funzioni produttive proposte, in ordine

1. Bozze recuperabili automaticamente e ripresa dal passaggio lasciato incompleto.
2. Responsabile, prossima azione e scadenza per attività, con elenco “Da fare”.
3. Modelli di note e checklist specifiche per sottoprocesso; riuso di una precedente
   attività senza copiare stato e scadenze già superati.
4. Collegamento documenti–attività con versioni e ricerca per metadati; avviso se
   una copia allegata è precedente al documento nella cartella collegata.
5. Sincronizzazione cloud esplicita con il protocollo sopra, prima delle integrazioni
   con servizi esterni.
6. Integrazioni OAuth con repository documentali già usati dall’organizzazione,
   scegliendo un servizio concreto e i permessi minimi. Per i calendari, partire
   dall’esportazione `.ics` delle scadenze prima di una connessione diretta.

## Verifiche prima del rilascio Mac/Windows

Le prove automatiche eseguono la logica dei nomi, lettura e scrittura; Chromium
verifica l’interfaccia e le vere handle del filesystem privato del browser usate
come fixture al posto del selettore nativo. Questo non sostituisce una prova su
cartelle reali dei due sistemi operativi.

Il collaudo manuale deve coprire Chrome ed Edge su Windows e macOS: selezione della
cartella Documenti, riavvio del browser, permesso revocato, file aperto e modificato
in un programma esterno, salvataggio tramite sostituzione temporanea, rinomina,
spostamento e cancellazione, perdita di rete, avvio offline e cartella non disponibile.
Verificare anche la modalità di sola lettura negli altri browser. La sincronizzazione
cloud non è disponibile e non viene presentata come collaudata.
