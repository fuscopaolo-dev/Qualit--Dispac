# Documenti, modelli personali e bozze

## Capacità di lettura verificate sul codice

Il portale conserva allegati separati dalle registrazioni e usa un lettore locale,
con istanze distinte per archivio, spazio personale ed editor. Non invia i file a
servizi di conversione esterni. L’anteprima dipende dal formato del nome del file;
l’estensione non viene considerata prova della validità: PDF e RTF sono verificati
prima di mostrarli. Il download dell’originale rimane separato dalla lettura.

| Formato | Lettura attuale | Limiti |
| --- | --- | --- |
| TXT | UTF-8, UTF-16 LE/BE con BOM, fallback Windows-1252 | Non identifica tutte le codifiche legacy |
| RTF | Testo, Unicode, paragrafi, tabulazioni, grassetto, corsivo, sottolineatura | Non riproduce oggetti, immagini, intestazioni o impaginazioni complesse; codepage legacy di riferimento Windows-1252 |
| PDF | Lettore integrato nel browser, zoom e ricerca nativi quando disponibili | Nessun OCR delle scansioni; supporto dipendente dal browser |
| Markdown | Testo con marcatori preservati | Non esegue HTML e non interpreta la sintassi come una pagina web |
| CSV | Tabella con delimitatore rilevato fra virgola, punto e virgola e tabulazione; campi fra virgolette, newline interni e virgolette raddoppiate | Rilevamento euristico, nessun calcolo di formule; la prima riga è mostrata come dato, senza presumere intestazioni |
| JSON | Rientro per JSON valido; testo originale con avviso se non valido | Nessuna validazione contro uno schema applicativo |
| DOCX, XLSX, ODT e altri | Archiviazione e download | Nessuna conversione o anteprima interna |

Nel lettore testuale espanso si possono regolare dimensione del testo, a capo e
ricerca con evidenziazione e navigazione dei risultati. La ricerca RTF opera per
segmenti di stile; una parola spezzata fra stili diversi può richiedere una ricerca
più breve. Vengono evidenziati al massimo 1.000 risultati.

I CSV hanno anteprima di 5 righe, lettore di 100 righe per pagina e filtro delle
righe per contenuto. La visualizzazione è limitata a 10.000 righe, 100 colonne e
10.000 caratteri per cella, con avviso di troncamento. Scaricare il file conserva
l’originale. JSON e CSV non validi passano alla lettura testuale con avviso.

Nello spazio personale il limite di anteprima è 20 MB. Gli allegati nell’archivio
locale restano limitati a 2 MB; il futuro contratto remoto prevede 20 MB. I limiti
del browser su memoria e localStorage continuano ad applicarsi. Un errore di quota
non viene presentato come salvataggio riuscito.

## Creare un documento

La nuova voce **Documenti** contiene i testi completi dell’account. **Nuovo
documento** apre un editor con titolo, formato e corpo del testo. Può partire da
una pagina vuota, da un modello iniziale o da un modello personale.

I modelli iniziali includono verbale di riunione, relazione di attività e richiesta
di integrazione documentale. Le parti fra parentesi quadre sono da completare;
`{{nome}}` e `{{data}}` sono sostituiti letteralmente al momento dell’applicazione.
Non vengono eseguiti codice, espressioni o HTML.

L’editor produce testo e può esportarlo in TXT UTF-8, RTF Unicode o Markdown.
L’esportazione RTF conserva testo, paragrafi e tabulazioni, senza inventare immagini
o impaginazione. Un documento completo richiede titolo e corpo non vuoti. Una
bozza può avere entrambi vuoti. Titolo: massimo 250 caratteri; corpo: massimo un
milione di caratteri, subordinato alla quota di archiviazione disponibile.

Dalla raccolta si può leggere, scaricare, modificare, salvare come modello o
allegare una copia a un’attività. La copia allegata è indipendente dalle modifiche
successive del documento. La modifica dei documenti testuali non introduce un
sistema di versionamento cloud né la modifica in-place degli allegati originali.

## Modelli e bozze per utente

**Salva come modello** conserva il contenuto riutilizzabile, con nome personale.
Durante una nuova compilazione si seleziona il modello e si preme **Usa modello**.
Anche le attività guidate hanno modelli, con processo, passaggio, oggetto e note.
Identificativi, allegati, registrazioni collegate, data e stato dell’attività non
entrano nei modelli. L’uso di un modello di attività parte da oggi e stato Aperta.
I modelli possono essere usati, rinominati ed eliminati nella raccolta personale;
un modello iniziale si può applicare e salvare con un nome personale.

**Salva bozza** è disponibile in ogni passaggio delle attività e nell’editor.
Il salvataggio è esplicito, con conferma: non c’è autosalvataggio in background.
Si conservano i campi incompleti, il passaggio di compilazione e l’eventuale
riferimento all’elemento completo da modificare. La bozza non modifica quell’elemento
finché non si conferma il completamento. **Bozze e modelli** permette la ripresa
o l’eliminazione.

Le bozze non sono registrazioni operative, non alimentano storico o monitoraggio.
Il completamento salva l’elemento e rimuove la bozza con un’unica scrittura
all’archivio: se validazione o quota falliscono la bozza precedente resta presente.
Un modello è riutilizzabile; una bozza viene consumata dal completamento.

Ogni account locale ha raccolte separate nello stesso browser. La demo resta in
sola lettura; nel laboratorio documenti, bozze e modelli sono in memoria e vengono
persi al ricaricamento. Esporta/Importa dati include le raccolte nuove. I backup
precedenti senza queste raccolte rimangono importabili e le inizializzano vuote.
Importare sostituisce l’intero archivio dell’account, dopo conferma.

## Estensione del contratto per il backend futuro

Il backend PHP/MySQL non è incluso. In modalità remota il frontend usa gli endpoint
sotto riportati e mostra un errore se la raccolta non può essere caricata; non
finge la sincronizzazione e non copia i dati remoti in un archivio locale nascosto.
Il backend deve autorizzare e filtrare ogni operazione in base alla sessione.

| Route | Operazioni | Contenuto |
| --- | --- | --- |
| `/templates` | GET, POST | `{id?, name, kind, payload}`; `kind` activity/document |
| `/templates/{id}` | DELETE | Elimina solo il modello dell’utente |
| `/drafts` | GET, POST | `{id?, kind, payload, phase, record_id?, document_id?}` |
| `/drafts/{id}` | DELETE | Elimina solo la bozza dell’utente |
| `/documents` | GET, POST | `{id?, payload: {title,body,format}, draft_id?}` |
| `/records` | POST esistente | Campo opzionale `draft_id` per completare la bozza |

I GET restituiscono un oggetto con array `templates`, `drafts` o `documents`.
I POST restituiscono `{ok:true,id}`. Gli ID delle nuove raccolte sono UUID, le
registrazioni mantengono i propri identificativi numerici. Elementi delle nuove
raccolte hanno `created_at` e `updated_at`; i documenti completi hanno `author`.
`phase` va da 0 a 2; per documenti testuali vale 0. I riferimenti assenti sono null.
`payload` di un modello di attività contiene code/step/subject/description; quello
di una bozza aggiunge activity_date e status. Le risposte d’errore restano `{error}`.

Sul server il completamento e la rimozione della bozza devono essere transazionali,
con controllo del riferimento all’elemento originale. Serviranno inoltre revisioni
per conflitti fra dispositivi: i modelli e le bozze locali attuali non costituiscono
una sincronizzazione collaborativa.

## Verifiche

Test Node per isolamento fra account, validazione, backup precedenti e nuovi,
completamento e conservazione della bozza in caso di quota, non modifica del record
prima del completamento, ruoli, esportazione RTF Unicode e parsing CSV. Prove
Chromium per selezione modelli, bozze incomplete, riapertura dopo accesso, controlli
di lettura, allegazione copie, export, persistenza offline e layout mobile.
