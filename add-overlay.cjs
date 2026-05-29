const fs = require('fs');

let f1 = fs.readFileSync('src/components/Classroom.tsx', 'utf8');
if (!f1.includes("isUploading && (")) {
  f1 = f1.replace(/(return \(\n\s+<div className="fixed inset-0 )/g, 
  "return (\n    <>\n      {isUploading && (\n        <div className=\"fixed inset-0 z-[600] flex items-center justify-center bg-white/80 backdrop-blur-sm\">\n          <div className=\"flex flex-col items-center gap-4\">\n            <div className=\"w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin\"></div>\n            <span className=\"text-xs font-mono font-bold tracking-widest text-indigo-900\">UPLOADING...</span>\n          </div>\n        </div>\n      )}\n      <div className=\"fixed inset-0 ");
  f1 = f1.replace(/(\n\s+<\/div>\n\s+\);\n\})/g, "\n    </div>\n    </>\n  );\n}");
}
fs.writeFileSync('src/components/Classroom.tsx', f1);

let f2 = fs.readFileSync('src/components/CourseBuilder.tsx', 'utf8');
if (!f2.includes("isUploading && (")) {
  f2 = f2.replace(/(return \(\n\s+<div className="fixed inset-0 )/g, 
  "return (\n    <>\n      {isUploading && (\n        <div className=\"fixed inset-0 z-[600] flex items-center justify-center bg-white/80 backdrop-blur-sm\">\n          <div className=\"flex flex-col items-center gap-4\">\n            <div className=\"w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin\"></div>\n            <span className=\"text-xs font-mono font-bold tracking-widest text-indigo-900\">PROCESSING MEDIA...</span>\n          </div>\n        </div>\n      )}\n      <div className=\"fixed inset-0 ");
  f2 = f2.replace(/(\n\s+<\/div>\n\s+\);\n\})/g, "\n    </div>\n    </>\n  );\n}");
}
fs.writeFileSync('src/components/CourseBuilder.tsx', f2);
