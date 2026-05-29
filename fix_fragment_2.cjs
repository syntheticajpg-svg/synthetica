const fs = require('fs');
let text = fs.readFileSync('src/components/Classroom.tsx', 'utf8');

text = text.replace(/\{adminTab === 'students' && \(\n\s+\{\/\* Left Student/g, "{adminTab === 'students' && (<>\n                                      {/* Left Student");
text = text.replace(/<\/section>\n\s+\)\}\n\s+\{adminTab === 'courses' && \(/g, "</section></>\n                                  )}\n                \n                {adminTab === 'courses' && (");

text = text.replace(/\{editingHomeBlockId && \(\n\s+<div className="fixed inset-0/g, "{editingHomeBlockId && (<>\n                  <div className=\"fixed inset-0");
text = text.replace(/<\/motion\.div>\n\s+<\/div>\n\s+\)\}/g, "</motion.div>\n                  </div>\n</>\n                )}");

text = text.replace(/\{currentLesson\.customContent\?\.type === 'practice' \? \(\n\s+<h2/g, "{currentLesson.customContent?.type === 'practice' ? (<>\n                              <h2");
text = text.replace(/\{language === 'RU' \? currentLesson\.customContent\?\.titleRu : currentLesson\.customContent\?\.titleEn\}\n\s+<\/h2>\n\s+\) : \(/g, "{language === 'RU' ? currentLesson.customContent?.titleRu : currentLesson.customContent?.titleEn}\n                              </h2>\n                            </>) : (<>");
text = text.replace(/<\/h2>\n\s+<\/div>/g, "</h2>\n                              </>\n                            </div>"); // actually wait.

fs.writeFileSync('src/fix_fragment.cjs', text);
