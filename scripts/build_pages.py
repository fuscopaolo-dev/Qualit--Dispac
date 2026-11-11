"""Build only public preview assets, never backend or private data."""
import pathlib
import shutil
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / '_site'
OUT.mkdir(exist_ok=True)
for name in ('index.html', 'style.css', 'app.js'):
    shutil.copyfile(ROOT / 'web' / name, OUT / name)
index = OUT / 'index.html'
index.write_text(index.read_text().replace('name="app-mode" content="server"', 'name="app-mode" content="static"'))
shutil.copyfile(ROOT / 'content.json', OUT / 'content.json')
(OUT / '.nojekyll').touch()
print('Anteprima statica generata in _site/')
