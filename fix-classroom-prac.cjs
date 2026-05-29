const fs = require('fs');
let lines = fs.readFileSync('src/components/Classroom.tsx', 'utf8').split('\n');

for(let i=2760; i<2780; i++) {
    if (lines[i] && lines[i].includes(') : (')) {
        lines[i] = lines[i].replace(') : (', ') : (<>');
    }
}
fs.writeFileSync('src/components/Classroom.tsx', lines.join('\n'));
