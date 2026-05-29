const fs = require('fs');
let text = fs.readFileSync('src/components/Classroom.tsx', 'utf8');

text = text.replace(/\{isImpersonating && \(\n\s+<div className="h-4/g, '{isImpersonating && (\n<>\n              <div className="h-4');
text = text.replace(/BACK TO ADMIN'\}\n\s+<\/button>\n\s+\)\}/g, "BACK TO ADMIN'}\n              </button>\n             </>\n          )}");

text = text.replace(/\{adminTab === 'students' && \(\n\s+\{\/\* Left Student/g, "{adminTab === 'students' && (\n                  <>\n                    {/* Left Student");
text = text.replace(/<\/div>\n\s+\)\}\n\s+<\/section>\n\s+\)\}\n\s+\{adminTab === 'courses' && \(/g, "</div>\n                  )}</section>\n                  </>\n                )}\n                \n                {adminTab === 'courses' && (");

text = text.replace(/\{adminTab === 'courses' && \(\n\s+<section/g, "{adminTab === 'courses' && (\n                  <>\n                  <section");
text = text.replace(/\{\/\* Add New Course Block \*\/\}\n\s+<button/g, "{/* Add New Course Block */}\n                    <button");
// wait, where is the end of courses tab?
fs.writeFileSync('src/fix_fragment.cjs', text);
