const fs = require('fs');

let f1 = fs.readFileSync('src/components/Classroom.tsx', 'utf8');

f1 = f1.replace(/<\/?\s*>\n?/g, ''); // remove <> and </>
f1 = f1.replace(/\{isUploading && \(\n\s+<div className="fixed inset-0 z-\[600\] flex items-center justify-center bg-white\/80 backdrop-blur-sm">\n\s+<div className="flex flex-col items-center gap-4">\n\s+<div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"><\/div>\n\s+<span className="text-xs font-mono font-bold tracking-widest text-indigo-900">UPLOADING\.\.\.<\/span>\n\s+<\/div>\n\s+<\/div>\n\s+\)\}/g, '');
f1 = f1.replace(/\{isUploading && \(\n\s+<div className="fixed inset-0 z-\[600\] flex items-center justify-center bg-white\/80 backdrop-blur-sm">\n\s+<div className="flex flex-col items-center gap-4">\n\s+<div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"><\/div>\n\s+<span className="text-xs font-mono font-bold tracking-widest text-indigo-900">PROCESSING MEDIA\.\.\.<\/span>\n\s+<\/div>\n\s+<\/div>\n\s+\)\}/g, '');

fs.writeFileSync('src/components/Classroom.tsx', f1);

let f2 = fs.readFileSync('src/components/CourseBuilder.tsx', 'utf8');

f2 = f2.replace(/<\/?\s*>\n?/g, '');
f2 = f2.replace(/\{isUploading && \(\n\s+<div className="fixed inset-0 z-\[600\] flex items-center justify-center bg-white\/80 backdrop-blur-sm">\n\s+<div className="flex flex-col items-center gap-4">\n\s+<div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"><\/div>\n\s+<span className="text-xs font-mono font-bold tracking-widest text-indigo-900">PROCESSING MEDIA\.\.\.<\/span>\n\s+<\/div>\n\s+<\/div>\n\s+\)\}/g, '');

fs.writeFileSync('src/components/CourseBuilder.tsx', f2);
