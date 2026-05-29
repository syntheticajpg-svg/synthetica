const fs = require('fs');
let lines = fs.readFileSync('src/components/Classroom.tsx', 'utf8').split('\n');

for(let i=2775; i<2790; i++) {
    if (lines[i] && lines[i].includes(')}')) {
        lines[i] = lines[i].replace(')}', '</>)}');
        break; // Only replace the first one
    }
}
// check line 3125 again too, for trailing `}`
fs.writeFileSync('src/components/Classroom.tsx', lines.join('\n'));
