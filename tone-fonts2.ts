import fs from 'fs';
const file = 'src/components/Profile.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/font-black/g, 'font-semibold');
content = content.replace(/font-extrabold/g, 'font-semibold');
content = content.replace(/font-bold/g, 'font-medium');
fs.writeFileSync(file, content);
console.log('Done');
