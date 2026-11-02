// Technical schematics describe a measurement principle, never a manufacturer's model.
import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=join(import.meta.dirname,'..');
const directory=join(root,'apps/instrumental-solution/assets/source');
for(const [key,guided] of [['esquema-nivel-ultrasonico',false],['esquema-nivel-guiado',true]]){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 480">
  <rect width="600" height="480" fill="#fff"/>
  <ellipse cx="302" cy="421" rx="175" ry="11" fill="#edf4fa"/>
  <g stroke="#245e9a" stroke-width="3" stroke-linejoin="round">
    <path d="M152 151v217c0 57 296 57 296 0V151" fill="#f2f7fb"/>
    <path d="M155 276v92c0 52 290 52 290 0v-92" fill="#cce5f5" stroke="none"/>
    <ellipse cx="300" cy="276" rx="145" ry="30" fill="#dbedf8" stroke="#85b6d8"/>
    <ellipse cx="300" cy="151" rx="148" ry="35" fill="#f2f7fb"/>
    <path d="M220 124v-20h160v20" fill="#e0edf6"/>
    <rect x="259" y="57" width="82" height="59" rx="12" fill="#245e9a"/>
    <rect x="274" y="70" width="52" height="23" rx="3" fill="#e9f4fb" stroke="none"/>
    <path d="M282 106v30h36v-30" fill="#7eabc9"/>
    ${guided?'<path d="M300 140v226" stroke="#102b47" stroke-width="8"/><path d="m287 217 13 13 13-13m-26 42 13 13 13-13" fill="none" stroke="#36a0d0" stroke-width="4"/><circle cx="300" cy="362" r="7" fill="#245e9a"/>':'<g fill="none" stroke="#36a0d0" stroke-width="4"><path d="M279 165q21 15 42 0M265 191q35 25 70 0M249 220q51 35 102 0"/></g><path d="M300 235v27" stroke="#85b6d8" stroke-dasharray="4 6"/>'}
    <path d="M448 203h38v18h-38M448 336h38v18h-38" fill="#d9e7f1"/>
  </g></svg>`;
  await writeFile(join(directory,`${key}.svg`),svg);
  await sharp(Buffer.from(svg)).png().toFile(join(directory,`${key}.png`));
}
console.log('Dos esquemas técnicos de nivel creados; sin modelos ni marcas atribuidos.');
