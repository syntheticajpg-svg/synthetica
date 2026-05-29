const fs = require('fs');
let lines = fs.readFileSync('src/components/Classroom.tsx', 'utf8').split('\n');

lines[824] = '              </></>)}'; // wait, my previous replace was 'BACK TO ADMIN'}\n              </button>\n             </>\n          )}' but it failed.
let str = lines.join('\n');
str = str.replace(/BACK TO ADMIN'\}\n\s+<\/button>\n\s+\)\}/, "BACK TO ADMIN'}\n              </button>\n            </>\n          )}");

fs.writeFileSync('src/components/Classroom.tsx', str);
