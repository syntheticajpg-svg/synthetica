const fs = require('fs');

let f1 = fs.readFileSync('src/components/CourseBuilder.tsx', 'utf8');
f1 = f1.replace(/const \[modules, setModules\] = useState<CustomModule\[\]>\(customConfig\?\.modules \|\| \[\]\);/, 
"const [modules, setModules] = useState<CustomModule[]>(customConfig?.modules || []);\n  const [isUploading, setIsUploading] = useState(false);");

f1 = f1.replace(/const compressedFile = await compressImage\(file\);\nconst formData = new FormData\(\);\nformData\.append\("image", compressedFile\);\n\n\s+try \{/g, 
"setIsUploading(true);\n    try {\n    const compressedFile = await compressImage(file);\n    const formData = new FormData();\n    formData.append('image', compressedFile);");

f1 = f1.replace(/\} catch \(err\) \{\n\s+console\.error\('Upload error', err\);\n\s+alert\('Upload failed'\);\n\s+\}/g, 
"} catch (err) {\n      console.error('Upload error', err);\n      alert('Upload failed');\n    } finally {\n      setIsUploading(false);\n    }");


f1 = f1.replace(/const formData = new FormData\(\);\n\s+formData\.append\('image', file\);\n\n\s+try \{/g, 
"setIsUploading(true);\n    try {\n      const compressedFile = await compressImage(file);\n      const formData = new FormData();\n      formData.append('image', compressedFile);");

fs.writeFileSync('src/components/CourseBuilder.tsx', f1);
