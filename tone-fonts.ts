import fs from 'fs';

const file = 'src/components/PinAuth.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace overused bold text
content = content.replace(/font-black/g, 'font-semibold');
content = content.replace(/font-extrabold/g, 'font-semibold');
content = content.replace(/font-bold/g, 'font-medium');

// Keep keypad numbers slightly bolder
content = content.replace(/text-slate-800 font-medium text-xl/g, 'text-slate-800 font-semibold text-xl');

// Tweak header text
content = content.replace(/text-2xl font-semibold/g, 'text-xl font-semibold');

// Buttons
content = content.replace(/text-white font-medium/g, 'text-white font-semibold');

fs.writeFileSync(file, content);
console.log('Toned down fonts in PinAuth.tsx');
