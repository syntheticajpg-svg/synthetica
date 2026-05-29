const fs = require('fs');
let lines = fs.readFileSync('src/components/Classroom.tsx', 'utf8').split('\n');

// Restore 887
lines[886] = '</div>';

// Find the <motion.div> around 2035
let idx = 2000;
for(let i = 1800; i < 2200; i++) {
    if (lines[i].includes('</motion.div>')) {
        lines[i-1] = '</div></div></div></div>';
        break;
    }
}
fs.writeFileSync('src/components/Classroom.tsx', lines.join('\n'));
