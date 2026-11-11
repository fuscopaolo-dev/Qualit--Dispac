import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const context=vm.createContext({window:{},TextDecoder,Uint8Array});
vm.runInContext(await readFile(new URL('../web/document-preview.js',import.meta.url),'utf8'),context);
const {parseRTF,decodeText}=context.window.DocumentPreview;
const text=runs=>runs.map(r=>r.text).join('');
test('RTF: testo, paragrafi, accenti, Unicode e stili di base',()=>{
 const runs=parseRTF(String.raw`{\rtf1\ansi\ansicpg1252 Testo {\b forte} {\i corsivo} {\ul sottolineato}\par Citt\'e0: \u8364? e \u-10179?\u-8704?}`);
 assert.equal(text(runs),'Testo forte corsivo sottolineato\nCittà: € e 😀');
 assert.equal(runs.some(r=>r.bold&&r.text==='forte'),true);
 assert.equal(runs.some(r=>r.italic&&r.text==='corsivo'),true);
 assert.equal(runs.some(r=>r.underline&&r.text==='sottolineato'),true);
});
test('RTF: ignora metadati, oggetti, immagini, campi nascosti e istruzioni',()=>{
 const runs=parseRTF(String.raw`{\rtf1{\fonttbl{\f0 Arial;}}{\info{\author Segreto}}{\*\custom ignorato}{\pict 001122}{\object oggetto}{\field{\*\fldinst HYPERLINK "https://example.invalid"}{\fldrslt etichetta}}\par Visibile {\v nascosto} \{letterale\} <script>alert(1)</script>}`);
 assert.equal(text(runs),'etichetta\nVisibile  {letterale} <script>alert(1)</script>');
 assert.throws(()=>parseRTF('<html>non RTF</html>'),/RTF valido/);
});
test('TXT: UTF-8, Windows-1252 e UTF-16 con BOM',()=>{
 assert.equal(decodeText(new TextEncoder().encode('Città — Qualità')),'Città — Qualità');
 assert.equal(decodeText(Uint8Array.from([0x63,0x69,0x74,0x74,0xe0])),'città');
 assert.equal(decodeText(Uint8Array.from([0xff,0xfe,0x41,0,0xe0,0])),'Aà');
 assert.equal(decodeText(Uint8Array.from([0xfe,0xff,0,0x41,0,0xe0])),'Aà');
});
