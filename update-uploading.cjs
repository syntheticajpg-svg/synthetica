const fs = require('fs');

let f1 = fs.readFileSync('src/components/Classroom.tsx', 'utf8');
f1 = f1.replace(/const \[actionError, setActionError\] = useState<string \| null>\(null\);/, "const [actionError, setActionError] = useState<string | null>(null);\n  const [isUploading, setIsUploading] = useState(false);");

f1 = f1.replace(/const compressedFile = await compressImage\(file\);/g, "setIsUploading(true);\n                                      try {\n                                      const compressedFile = await compressImage(file);");

f1 = f1.replace(/setCustomHomeBlocksConfig\?\.\(prev => \(\{ \.\.\.prev, \[b\.id\]: \{ \.\.\.\(prev\[b\.id\] \|\| \{\}\), image: data\.url \} \}\)\);\n.*?\}/gs, match => {
  return match + "\n                                      } catch (err) { alert('Upload failed. Try a smaller file.'); console.error(err); } finally { setIsUploading(false); }";
});
f1 = f1.replace(/setCustomHomeBlocksConfig\?\.\(prev => \(\{ \.\.\.prev, \[b\.id\]: \{ \.\.\.\(prev\[b\.id\] \|\| \{\}\), authorImage: data\.url \} \}\)\);\n.*?\}/gs, match => {
  return match + "\n                                      } catch (err) { alert('Upload failed. Try a smaller file.'); console.error(err); } finally { setIsUploading(false); }";
});


fs.writeFileSync('src/components/Classroom.tsx', f1);
