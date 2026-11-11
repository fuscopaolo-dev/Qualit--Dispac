#!/usr/bin/env python3
"""DiSPAC Qualita - standalone local intranet application (Python stdlib only)."""
import argparse, base64, datetime, getpass, hashlib, hmac, http.cookies, http.server, io, json, mimetypes, os, pathlib, re, secrets, shutil, sqlite3, sys, threading, time, urllib.parse, zipfile
ROOT=pathlib.Path(__file__).resolve().parent
DATA=pathlib.Path(os.environ.get('DISPAC_DATA_DIR',str(ROOT/'dati_privati'))); DB=DATA/'qualita.sqlite3'; FILES=DATA/'allegati'; PUBLIC=ROOT/'web'; LOCK=threading.Lock()
MAX_UPLOAD=20*1024*1024

def utc(): return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
def conn():
 c=sqlite3.connect(DB,timeout=15);c.row_factory=sqlite3.Row;c.execute('PRAGMA foreign_keys=ON');c.execute('PRAGMA journal_mode=WAL');return c

def init():
 DATA.mkdir(exist_ok=True);FILES.mkdir(exist_ok=True)
 with conn() as c:
  c.executescript('''CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username TEXT UNIQUE NOT NULL,display_name TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','delegato','lettore')), salt TEXT NOT NULL, password_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),csrf TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS records(id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT NOT NULL,step INTEGER,subject TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',status TEXT NOT NULL CHECK(status IN ('aperta','in_corso','conclusa')),activity_date TEXT NOT NULL,author_id INTEGER NOT NULL REFERENCES users(id),created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS changes(id INTEGER PRIMARY KEY AUTOINCREMENT,record_id INTEGER NOT NULL REFERENCES records(id),author_id INTEGER NOT NULL REFERENCES users(id),at TEXT NOT NULL,action TEXT NOT NULL, snapshot TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS attachments(id INTEGER PRIMARY KEY AUTOINCREMENT,record_id INTEGER NOT NULL REFERENCES records(id),file_name TEXT NOT NULL,stored_name TEXT UNIQUE NOT NULL,mime TEXT NOT NULL,size INTEGER NOT NULL,uploaded_by INTEGER NOT NULL REFERENCES users(id),created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS ix_records_code ON records(code);CREATE INDEX IF NOT EXISTS ix_records_date ON records(activity_date);''')

def pw_hash(password,salt): return hashlib.scrypt(password.encode(),salt=bytes.fromhex(salt),n=2**14,r=8,p=1).hex()
def make_user(username,name,role,password):
 if not 12<=len(password)<=256: raise ValueError('La password deve contenere almeno 12 caratteri')
 if not re.fullmatch(r'[A-Za-z0-9._-]{3,40}',username): raise ValueError('Nome utente non valido')
 salt=secrets.token_hex(16)
 with conn() as c:c.execute('INSERT INTO users(username,display_name,role,salt,password_hash,created_at) VALUES(?,?,?,?,?,?)',(username,name,role,salt,pw_hash(password,salt),utc()))

def valid_code(code):return code=='INT.00' or any(s['code']==code for s in CONTENT['process']['subprocesses'])
CONTENT=json.loads((ROOT/'content.json').read_text(encoding='utf-8'))
class Handler(http.server.BaseHTTPRequestHandler):
 server_version='DiSPACQualita/1.0'
 def log_message(self,*args):pass
 def headers_common(self,mime,length,cookie=None):
  self.send_response(200);self.send_header('Content-Type',mime);self.send_header('Content-Length',str(length));self.send_header('X-Content-Type-Options','nosniff');self.send_header('X-Frame-Options','DENY');self.send_header('Referrer-Policy','no-referrer');self.send_header('Cache-Control','no-store');self.send_header('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'")
  if cookie:self.send_header('Set-Cookie',cookie)
  self.end_headers()
 def senddata(self,data,mime='application/json; charset=utf-8',cookie=None):
  if isinstance(data,(dict,list)):data=json.dumps(data,ensure_ascii=False).encode()
  elif isinstance(data,str):data=data.encode()
  self.headers_common(mime,len(data),cookie);self.wfile.write(data)
 def error(self,status,message):
  data=json.dumps({'error':message},ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(data)
 def request_json(self):
  n=int(self.headers.get('Content-Length','0'))
  if n>28*1024*1024:raise ValueError('Dimensione massima superata')
  return json.loads(self.rfile.read(n) or b'{}')
 def auth(self):
  cookie=http.cookies.SimpleCookie()
  try:cookie.load(self.headers.get('Cookie',''))
  except Exception:return None
  token=cookie.get('dq_session')
  if not token:return None
  with conn() as c:
   return c.execute('SELECT u.id,u.username,u.display_name,u.role,s.csrf FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires>? AND u.active=1',(hashlib.sha256(token.value.encode()).hexdigest(),int(time.time()))).fetchone()
 def required(self,write=False,admin=False):
  u=self.auth()
  if not u:self.error(401,'Accesso richiesto');return None
  if admin and u['role']!='admin':self.error(403,'Accesso riservato all’amministratore');return None
  if write and u['role']=='lettore':self.error(403,'Permesso insufficiente');return None
  if write and self.headers.get('X-CSRF-Token','')!=u['csrf']:self.error(403,'Verifica di sicurezza fallita');return None
  return u
 def do_GET(self):
  p=urllib.parse.urlparse(self.path);path=p.path;q=urllib.parse.parse_qs(p.query)
  if path in ('/','/app.js','/style.css'):
   f=PUBLIC/('index.html' if path=='/' else path.lstrip('/'))
   if f.is_file():return self.senddata(f.read_bytes(),mimetypes.guess_type(str(f))[0] or 'text/plain')
   return self.error(404,'File non trovato')
  if path=='/api/me':
   u=self.auth();return self.senddata({'user':dict(u) if u else None})
  u=self.required()
  if u is None:return
  if path=='/api/content':return self.senddata(CONTENT)
  if path=='/api/records':
   where=[];params=[]
   if q.get('code') and q['code'][0]!='all':where.append('r.code=?');params.append(q['code'][0])
   if q.get('status') and q['status'][0]!='all':where.append('r.status=?');params.append(q['status'][0])
   if q.get('search'):
    term='%'+q['search'][0][:150].replace('%','\\%').replace('_','\\_')+'%';where.append("(r.subject LIKE ? ESCAPE '\\' OR r.description LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM attachments a WHERE a.record_id=r.id AND a.file_name LIKE ? ESCAPE '\\'))");params.extend([term,term,term])
   if q.get('from'):where.append('r.activity_date>=?');params.append(q['from'][0])
   if q.get('to'):where.append('r.activity_date<=?');params.append(q['to'][0])
   query='SELECT r.*,u.display_name author FROM records r JOIN users u ON u.id=r.author_id'+(' WHERE '+' AND '.join(where) if where else '')+' ORDER BY r.activity_date DESC,r.id DESC LIMIT 1000'
   with conn() as c:
    rows=[dict(x) for x in c.execute(query,params)]
    for row in rows:row['attachments']=[dict(x) for x in c.execute('SELECT id,file_name,size,created_at FROM attachments WHERE record_id=?',(row['id'],))]
   return self.senddata({'records':rows})
  if path.startswith('/api/history/'):
   rid=int(path.rsplit('/',1)[1]);
   with conn() as c:rows=[dict(x) for x in c.execute('SELECT ch.*,u.display_name author FROM changes ch JOIN users u ON u.id=ch.author_id WHERE record_id=? ORDER BY ch.id DESC',(rid,))]
   return self.senddata({'history':rows})
  if path.startswith('/api/attachment/'):
   aid=int(path.rsplit('/',1)[1])
   with conn() as c:f=c.execute('SELECT * FROM attachments WHERE id=?',(aid,)).fetchone()
   if not f:return self.error(404,'Allegato inesistente')
   disk=FILES/f['stored_name']
   if not disk.exists():return self.error(404,'File non disponibile')
   data=disk.read_bytes();self.send_response(200);self.send_header('Content-Type','application/octet-stream');self.send_header('Content-Disposition',"attachment; filename*=UTF-8''"+urllib.parse.quote(f['file_name']));self.send_header('Content-Length',str(len(data)));self.send_header('X-Content-Type-Options','nosniff');self.send_header('Cache-Control','no-store');self.end_headers();return self.wfile.write(data)
  if path=='/api/users':
   if u['role']!='admin':return self.error(403,'Riservato')
   with conn() as c:rows=[dict(x) for x in c.execute('SELECT id,username,display_name,role,active,created_at FROM users ORDER BY username')]
   return self.senddata({'users':rows})
  if path=='/api/backup':
   if u['role']!='admin':return self.error(403,'Riservato')
   output=io.BytesIO()
   with LOCK:
    tmp=DATA/'_backup_temp.sqlite3'
    with conn() as src,sqlite3.connect(tmp) as dst:src.backup(dst)
    try:
     with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as z:
      z.write(tmp,'database/qualita.sqlite3');z.write(ROOT/'content.json','content.json')
      for f in FILES.iterdir():
       if f.is_file():z.write(f,'allegati/'+f.name)
      z.writestr('INFO_BACKUP.txt','Backup DiSPAC Qualita - '+utc()+'\nContiene dati personali, credenziali cifrate e documenti: conservare in luogo protetto.\n')
    finally:tmp.unlink(missing_ok=True)
   data=output.getvalue();self.send_response(200);self.send_header('Content-Type','application/zip');self.send_header('Content-Disposition','attachment; filename="dispac_backup_'+datetime.date.today().isoformat()+'.zip"');self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-store');self.end_headers();return self.wfile.write(data)
  return self.error(404,'Non trovato')
 def do_POST(self):
  path=urllib.parse.urlparse(self.path).path
  try:
   payload=self.request_json()
   if path=='/api/register':
    if self.headers.get('Content-Type','').split(';')[0]!='application/json':return self.error(415,'Formato richiesta non valido')
    origin=self.headers.get('Origin')
    if origin and urllib.parse.urlparse(origin).netloc!=self.headers.get('Host'):return self.error(403,'Origine non consentita')
    name=str(payload.get('display_name','')).strip();username=str(payload.get('username','')).strip()
    if not name or len(name)>100:return self.error(400,'Inserisci nome e cognome (massimo 100 caratteri)')
    try:make_user(username,name,'lettore',str(payload.get('password','')))
    except sqlite3.IntegrityError:return self.error(409,'Nome utente non disponibile. Scegline un altro.')
    return self.senddata({'ok':True})
   if path=='/api/login':
    name=str(payload.get('username',''))[:80];pw=str(payload.get('password',''))
    with conn() as c:u=c.execute('SELECT * FROM users WHERE username=? AND active=1',(name,)).fetchone()
    if not u or not hmac.compare_digest(pw_hash(pw,u['salt']),u['password_hash']):time.sleep(.35);return self.error(401,'Credenziali non valide')
    token=secrets.token_urlsafe(36);csrf=secrets.token_urlsafe(24)
    with conn() as c:c.execute('INSERT INTO sessions VALUES(?,?,?,?)',(hashlib.sha256(token.encode()).hexdigest(),u['id'],csrf,int(time.time())+28800))
    return self.senddata({'ok':True},cookie='dq_session='+token+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800')
   u=self.required(write=False if path=='/api/logout' else True)
   if u is None:return
   if self.headers.get('X-CSRF-Token','')!=u['csrf']:return self.error(403,'Verifica di sicurezza fallita')
   if path=='/api/logout':
    ck=http.cookies.SimpleCookie();ck.load(self.headers.get('Cookie',''));token=ck.get('dq_session')
    if token:
     with conn() as c:c.execute('DELETE FROM sessions WHERE token_hash=?',(hashlib.sha256(token.value.encode()).hexdigest(),))
    return self.senddata({'ok':True},cookie='dq_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0')
   if path=='/api/records':
    code=str(payload.get('code',''));subject=str(payload.get('subject','')).strip();desc=str(payload.get('description','')).strip();status=payload.get('status','aperta');date=str(payload.get('activity_date',''));step=payload.get('step')
    if not valid_code(code) or not subject or len(subject)>250 or len(desc)>10000 or status not in ('aperta','in_corso','conclusa') or not re.fullmatch(r'\d{4}-\d{2}-\d{2}',date):return self.error(400,'Dati non validi')
    if step not in (None,''):
     step=int(step);sub=next((s for s in CONTENT['process']['subprocesses'] if s['code']==code),None)
     if not sub or not 1<=step<=len(sub['steps']):return self.error(400,'Passaggio non valido')
    else:step=None
    with LOCK,conn() as c:
     now=utc();rid=payload.get('id')
     if rid is not None:
      prior=c.execute('SELECT * FROM records WHERE id=?',(int(rid),)).fetchone()
      if not prior:return self.error(404,'Registrazione assente')
      c.execute('UPDATE records SET code=?,step=?,subject=?,description=?,status=?,activity_date=?,updated_at=? WHERE id=?',(code,step,subject,desc,status,date,now,rid));action='aggiornamento'
     else:
      cur=c.execute('INSERT INTO records(code,step,subject,description,status,activity_date,author_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)',(code,step,subject,desc,status,date,u['id'],now,now));rid=cur.lastrowid;action='creazione'
     snapshot=json.dumps({'code':code,'step':step,'subject':subject,'description':desc,'status':status,'activity_date':date},ensure_ascii=False)
     c.execute('INSERT INTO changes(record_id,author_id,at,action,snapshot) VALUES(?,?,?,?,?)',(rid,u['id'],now,action,snapshot))
    return self.senddata({'ok':True,'id':rid})
   if path=='/api/attachment':
    rid=int(payload.get('record_id',0));name=pathlib.Path(str(payload.get('name',''))).name[:180];raw=payload.get('data','')
    if not name or not isinstance(raw,str):return self.error(400,'Allegato non valido')
    data=base64.b64decode(raw,validate=True)
    if len(data)>MAX_UPLOAD:return self.error(413,'File troppo grande (max 20 MB)')
    stored=secrets.token_hex(20)+'.bin'
    with LOCK,conn() as c:
     if not c.execute('SELECT id FROM records WHERE id=?',(rid,)).fetchone():return self.error(404,'Registrazione non trovata')
     (FILES/stored).write_bytes(data)
     c.execute('INSERT INTO attachments(record_id,file_name,stored_name,mime,size,uploaded_by,created_at) VALUES(?,?,?,?,?,?,?)',(rid,name,stored,'application/octet-stream',len(data),u['id'],utc()))
    return self.senddata({'ok':True})
   if path=='/api/users':
    if u['role']!='admin':return self.error(403,'Solo amministratore')
    role=payload.get('role','lettore');
    if role not in ('admin','delegato','lettore'):return self.error(400,'Ruolo non valido')
    make_user(str(payload.get('username','')),str(payload.get('display_name','')).strip()[:100],role,str(payload.get('password','')))
    return self.senddata({'ok':True})
   return self.error(404,'Non trovato')
  except (ValueError,KeyError,TypeError,OverflowError,sqlite3.IntegrityError) as e:return self.error(400,'Richiesta non valida: '+str(e)[:150])
  except Exception as e:
   print('Server error:',repr(e),file=sys.stderr);return self.error(500,'Errore interno')

def main():
 p=argparse.ArgumentParser();p.add_argument('--create-admin',action='store_true');p.add_argument('--host',default='127.0.0.1');p.add_argument('--port',type=int,default=8765);args=p.parse_args();init()
 if args.create_admin:
  name=input('Username amministratore: ').strip();display=input('Nome visualizzato: ').strip();pw=getpass.getpass('Password (min 12 caratteri): ');make_user(name,display,'admin',pw);print('Amministratore creato.');return
 with conn() as c:n=c.execute('SELECT COUNT(*) FROM users WHERE role="admin"').fetchone()[0]
 if not n:print('Prima crea un account: python server.py --create-admin');return
 print(f'DiSPAC Qualita disponibile su http://{args.host}:{args.port} (CTRL+C per terminare)')
 http.server.ThreadingHTTPServer((args.host,args.port),Handler).serve_forever()
if __name__=='__main__':main()
