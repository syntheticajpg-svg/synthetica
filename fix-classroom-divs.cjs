const fs = require('fs');

let lines = fs.readFileSync('src/components/Classroom.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('</motion.div>'));
if (idx !== -1) {
    if (lines[idx-1].includes('</div>')) {
        lines[idx-1] = '</div></div></div></div>';
    }
}
fs.writeFileSync('src/components/Classroom.tsx', lines.join('\n'));
