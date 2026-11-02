import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import sharp from 'sharp';
import {pages} from '../apps/instrumental-solution/pages.mjs';
import {publicationPlan,seoHead} from '../apps/instrumental-solution/seo.mjs';

const root=resolve(import.meta.dirname,'..');
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--base-url')throw new Error('Uso: npm run seo:instrumental -- --base-url https://dominio-propuesto/');
const read=name=>readFile(join(root,`content/instrumental-solution/${name}.json`),'utf8').then(JSON.parse);
const [site,products,copy,registry]=await Promise.all(['site','productos','textos','imagenes'].map(read));
const images={};
for(const [key,file] of Object.entries({...registry,...copy.images})){
  const {width}=await sharp(join(root,'apps/instrumental-solution/assets/source',file)).metadata();
  const size=Math.min(width,Math.max(...(copy.imageWidths[key]??[480,800])));
  images[key]={variants:[{file:`${key}-${size}.webp`}]};
}
const plan=publicationPlan({baseUrl:args[1],site,products,pages:pages(products,copy),images});
// Review artifacts stay outside the public dist tree, including the proposed robots file.
const output=join(root,'.qa/isolution-seo-preparation');
await mkdir(output,{recursive:true});
await writeFile(join(output,'plan.json'),JSON.stringify(plan,null,2));
await writeFile(join(output,'sitemap.xml'),plan.sitemap);
await writeFile(join(output,'robots-propuesto.txt'),plan.robots);
await writeFile(join(output,'heads.json'),JSON.stringify(Object.fromEntries(plan.pages.map(p=>[p.slug,seoHead(p)])),null,2));
console.log(`SEO preparado para ${plan.pages.length} páginas en .qa/isolution-seo-preparation. Preview continúa noindex; no se publicó ni aplicó ninguna redirección.`);
