const fs = require('fs');
let text = fs.readFileSync('src/components/Classroom.tsx', 'utf8');

text = text.replace(/setCustomHomeBlocksConfig\?\.\(prev => \(\{ \.\.\.prev, \[b\.id\]: \{ \.\.\.\(prev\[b\.id\] \|\| \{\}\), image: data\.url \} \}\)\);\n\s+\}\n\s+\} else if \(data\.error\) \{/g, 
`setCustomHomeBlocksConfig?.(prev => ({ ...prev, [b.id]: { ...(prev[b.id] || {}), image: data.url } }));\n                                      } else if (data.error) {`);

text = text.replace(/setCustomHomeBlocksConfig\?\.\(prev => \(\{ \.\.\.prev, \[b\.id\]: \{ \.\.\.\(prev\[b\.id\] \|\| \{\}\), authorImage: data\.url \} \}\)\);\n\s+\}\n\s+\} else if \(data\.error\) \{/g, 
`setCustomHomeBlocksConfig?.(prev => ({ ...prev, [b.id]: { ...(prev[b.id] || {}), authorImage: data.url } }));\n                                          } else if (data.error) {`);


fs.writeFileSync('src/components/Classroom.tsx', text);
