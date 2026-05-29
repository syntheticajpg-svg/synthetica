const fs = require('fs');
let lines = fs.readFileSync('src/components/Classroom.tsx', 'utf8').split('\n');

for(let i=3115; i<3130; i++) {
    if (lines[i] && lines[i].includes('</div>')) {
        lines[i] = lines[i].replace('</div>', '</div></>');
        break; // Only replace the first one
    }
}
fs.writeFileSync('src/components/Classroom.tsx', lines.join('\n'));
