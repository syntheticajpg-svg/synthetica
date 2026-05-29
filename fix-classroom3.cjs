const fs = require('fs');

let f1 = fs.readFileSync('src/components/Classroom.tsx', 'utf8');

f1 = f1.replace(/setIsUploading\(true\);\n\s+try \{\n\s+const compressedFile = await compressImage\(file\);\nconst formData = new FormData\(\);\nformData\.append\("image", compressedFile\);\n\s+try \{/g, 
"setIsUploading(true);\n                                  try {\n                                    const compressedFile = await compressImage(file);\n                                    const formData = new FormData();\n                                    formData.append('image', compressedFile);\n");

fs.writeFileSync('src/components/Classroom.tsx', f1);
