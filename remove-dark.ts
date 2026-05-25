import fs from 'fs';

const file = 'src/components/PinAuth.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace all dark classes
content = content.replace(/dark:[a-zA-Z0-9\-\/\.]+/g, '');
// Replace any double spaces that might occur
content = content.replace(/  +/g, ' ');

fs.writeFileSync(file, content);
console.log('Removed dark classes');
