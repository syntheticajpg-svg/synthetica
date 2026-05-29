const fs = require('fs');

let f1 = fs.readFileSync('src/components/Classroom.tsx', 'utf8');

// Undo the broken insertions
f1 = f1.replace("    </div>\n    </>\n  );\n}", "    </div>\n  );\n}");

// the others:
f1 = f1.replace(/<\/div>\n\s+<\/div>\n\s+<\/div>\n\s+<\/div>\n\s+<\/div>\n\s+<\/motion\.div>\n\s+<\/div>\n\s+\);\n\s+\}\)\(\)\}\n\s+<\/main>\n\s+\) : \(/g, 
`</div>
                      </div>
                    </motion.div>
                  </div>
                );
              })()}
            </main>
          ) : (`);

fs.writeFileSync('src/components/Classroom.tsx', f1);
