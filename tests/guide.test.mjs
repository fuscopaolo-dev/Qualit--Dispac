import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const context=vm.createContext({window:{}});
vm.runInContext(await readFile(new URL('../web/guide.js',import.meta.url),'utf8'),context);
const {DQGuide:articles,DQFieldTopics:mapping}=context.window;
const content=JSON.parse(await readFile(new URL('../content.json',import.meta.url),'utf8'));
test('aiuti specifici per ciascuna voce delle schede, senza fallback generici',()=>{
 assert.equal(new Set(articles.map(a=>a.id)).size,articles.length);
 for(const [label] of [...content.process.mother,...content.process.subprocesses.flatMap(s=>s.fields)]){
  assert.ok(mapping[label],label);
  assert.ok(articles.find(a=>a.id===mapping[label]),label);
  assert.notEqual(mapping[label],'processi');
 }
 for(const code of ['INT.00',...content.process.subprocesses.map(s=>s.code)])assert.ok(articles.find(a=>a.id===code));
 for(const id of ['subprocesses','operational-steps','search-text','filter-code','filter-status','filter-date'])assert.ok(articles.find(a=>a.id===id));
 assert.equal(new Set(['Area di riferimento','Responsabile istituzionale','Responsabile operative'].map(k=>mapping[k])).size,3);
});
test('ogni guida ha almeno due esempi e i campi distinguono consultazione e compilazione',()=>{
 for(const article of articles){assert.ok(article.eli.trim(),article.id);assert.ok(article.body.trim(),article.id);assert.ok(article.steps.length,article.id);assert.ok(article.example&&article.examples?.length,article.id);}
 const area=articles.find(a=>a.id==='field-area');assert.match(area.body,/non.*responsabile/i);assert.match(area.body,/consulta/i);
 assert.match(articles.find(a=>a.id==='INT.00').body,/tradurre/);
});
