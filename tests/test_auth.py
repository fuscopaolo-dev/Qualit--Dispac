import http.client
import json
import pathlib
import sys
import tempfile
import threading
import unittest
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]))
import server

class AuthTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        server.DATA = pathlib.Path(cls.temp.name)
        server.DB = server.DATA/'test.sqlite3'
        server.FILES = server.DATA/'allegati'
        server.init()
        cls.http = server.http.server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler)
        cls.thread = threading.Thread(target=cls.http.serve_forever,daemon=True)
        cls.thread.start()
    @classmethod
    def tearDownClass(cls):
        cls.http.shutdown();cls.http.server_close();cls.thread.join();cls.temp.cleanup()
    def request(self, path, payload=None, headers=None):
        conn=http.client.HTTPConnection(*self.http.server_address)
        conn.request('GET' if payload is None else 'POST',path,None if payload is None else json.dumps(payload),{'Content-Type':'application/json',**(headers or {})})
        response=conn.getresponse();result=(response.status,json.loads(response.read()),dict(response.getheaders()));conn.close();return result
    def test_registration_login_permissions_and_logout(self):
        account={'username':'test.user','display_name':'Utente Test','password':'UnaPasswordDiTest123!','role':'admin'}
        self.assertEqual(self.request('/api/records')[0],401)
        self.assertEqual(self.request('/api/register',account,{'Origin':'https://other.invalid'})[0],403)
        self.assertEqual(self.request('/api/register',{**account,'password':'short'})[0],400)
        self.assertEqual(self.request('/api/register',{**account,'display_name':' '})[0],400)
        self.assertEqual(self.request('/api/register',account)[0],200)
        self.assertEqual(self.request('/api/register',account)[0],409)
        self.assertEqual(self.request('/api/login',{**account,'password':'wrong'})[0],401)
        status,body,headers=self.request('/api/login',account)
        self.assertEqual(status,200)
        cookie={'Cookie':headers['Set-Cookie'].split(';')[0]}
        self.assertIn('HttpOnly',headers['Set-Cookie'])
        me=self.request('/api/me',headers=cookie)[1]['user']
        self.assertEqual(me['role'],'lettore')
        self.assertEqual(self.request('/api/content',headers=cookie)[0],200)
        self.assertEqual(self.request('/api/records',headers=cookie)[1],{'records':[]})
        self.assertEqual(self.request('/api/users',headers=cookie)[0],403)
        self.assertEqual(self.request('/api/records',{},cookie)[0],403)
        self.assertEqual(self.request('/api/logout',{},cookie)[0],403)
        self.assertEqual(self.request('/api/logout',{}, {**cookie,'X-CSRF-Token':me['csrf']})[0],200)
        self.assertIsNone(self.request('/api/me',headers=cookie)[1]['user'])
        with server.conn() as connection:
            row=connection.execute('SELECT password_hash FROM users WHERE username=?',(account['username'],)).fetchone()
            self.assertNotEqual(row[0],account['password'])

if __name__=='__main__':unittest.main()
