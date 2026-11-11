# Utilizzo web

## Collaudo su GitHub Pages

In GitHub → Settings → Pages selezionare **GitHub Actions** come sorgente.
Il workflow `pages.yml` pubblica a ogni push su `main`, oppure manualmente.
Il deploy effettivo richiede di caricare queste modifiche sul repository.

L'anteprima mostra accesso e registrazione e permette di entrare con **Visita la
piattaforma demo**. La demo consulta le schede originali e mostra un archivio
attività vuoto. Non autentica utenti, non invia né conserva password e non salva
attività. I form spiegano il limite alla conferma. Non inserire dati personali
per collaudare un sito pubblico. Sono pubblicati solo HTML, CSS, JavaScript e
le schede `content.json`; verificare che queste ultime siano pubblicabili.

Verifica locale (anche sotto il percorso di un repository):

```sh
python3 scripts/build_pages.py
python3 -m http.server 8080 --directory .
# Visitare /_site/ nel browser sul server locale.
```

## Server e database SQL

```sh
python3 server.py --create-admin
python3 server.py
```

Il server esistente usa SQLite, un database SQL persistente sul filesystem
`dati_privati/qualita.sqlite3`. Per un percorso persistente esterno al checkout,
impostare `DISPAC_DATA_DIR` a una directory scrivibile esistente o il cui genitore
esista. Il database e gli allegati non devono essere pubblicati come file web.
La registrazione crea solo lettori; la scelta del ruolo inviata dal client
viene ignorata. L'account appena creato può accedere al programma reale.
Gli amministratori possono già creare altri utenti con ruoli operativi.

Per hosting dedicato occorrono un servizio Python persistente, storage persistente
e un reverse proxy HTTPS. Questo server rimane un prototipo: prima di esporre
l'autenticazione pubblicamente servono almeno rate limiting sul proxy, cookie
Secure in HTTPS, recupero password, verifica/approvazione identità e collaudo di
sicurezza. Il solo hosting statico non esegue Python né permette accesso SQL.

Se l'hosting fornirà MySQL/PostgreSQL, occorreranno un adattatore backend e una
migrazione dello schema. Non è implementata una connessione a un database remoto;
nessuna credenziale SQL deve essere inserita nel frontend o su GitHub Pages.
