import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const content=JSON.parse(await read('content.json'));
// A script wrapper also works under file://, without fetch or a local server.
const contentScript='window.DISPAC_CONTENT = '+JSON.stringify(content).replace(/</g,'\\u003c')+';\n';
await writeFile(new URL('web/content-data.js',root),contentScript);
let html=await read('index.html');
const css=await read('web/style.css');
html=html.replace('<link rel="stylesheet" href="./web/style.css">',()=>'<style>'+css+'</style>');
for(const name of ['config.js','web/content-data.js','web/data-service.js','web/document-preview.js','web/app.js']){
  const source=name==='web/content-data.js'?contentScript:await read(name);
  html=html.replace('<script src="./'+name+'"></script>',()=>'<script>\n'+source.replace(/<\/script/gi,'<\\/script')+'\n</script>');
}
await mkdir(new URL('dist/',root),{recursive:true});
await writeFile(new URL('dist/dispac.html',root),html);
await writeFile(new URL('dist/index.html',root),html);
await writeFile(new URL('dist/.nojekyll',root),'');
console.log('Creati web/content-data.js e '+fileURLToPath(new URL('dist/dispac.html',root)));
