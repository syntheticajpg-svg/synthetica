const fs = require('fs');

let lines = fs.readFileSync('src/components/Classroom.tsx', 'utf8').split('\n');

// 1. Line 773 return ( \n <div
if (lines[771].includes('return (')) {
  lines[771] = '  return ( <>';
}

// 2. Line 814
const idx814 = lines.findIndex(l => l.includes('{isImpersonating && ('));
if (idx814 !== -1) {
  lines[idx814] = '          {isImpersonating && (<>';
}
const idxBackToAdmin = lines.findIndex(l => l.includes('BACK TO ADMIN'));
if (idxBackToAdmin !== -1) {
  lines[idxBackToAdmin+1] = lines[idxBackToAdmin+1].replace('</button>', '</button></>');
}

// 3. Line 1015
const idxTabStudents = lines.findIndex(l => l.includes("{adminTab === 'students' && ("));
if (idxTabStudents !== -1) {
  lines[idxTabStudents] = "                {adminTab === 'students' && (<>";
  // find end
  const idxEnd = lines.findIndex((l, i) => i > idxTabStudents && l.includes('{adminTab === \'courses\' && ('));
  if (idxEnd !== -1) {
    if (lines[idxEnd-2].includes(')}')) {
       lines[idxEnd-2] = lines[idxEnd-2].replace(')}', ')}</>');
    }
  }
}

// 4. Line 1736 editingHomeBlockId
const idxEditingBlock = lines.findIndex(l => l.includes("{editingHomeBlockId && ("));
if (idxEditingBlock !== -1) {
  lines[idxEditingBlock] = "              {editingHomeBlockId && (<>";
  const endEditingBlock = lines.findIndex((l, i) => i > idxEditingBlock && l.includes("</motion.div>"));
  if (endEditingBlock !== -1 && lines[endEditingBlock+2].includes(')}')) {
    lines[endEditingBlock+2] = "                )}</>";
  }
}

// 5. Line 2773
const pracIdx = lines.findIndex(l => l.includes("{currentLesson.customContent?.type === 'practice' ? ("));
if (pracIdx !== -1) {
  lines[pracIdx] = lines[pracIdx].replace('(', '(<>');
  const elseIdx = lines.findIndex((l,i) => i > pracIdx && l.includes(') : ('));
  if (elseIdx !== -1) {
    lines[elseIdx - 1] = lines[elseIdx - 1].replace('</h2>', '</h2></>');
    lines[elseIdx] = lines[elseIdx].replace(') : (', ') : (<>');
    lines[elseIdx + 6] = lines[elseIdx + 6].replace('</h2>', '</h2></>');
  }
}

// Final closing fragment
const endIdx = lines.findIndex(l => l === '}');
if (endIdx > 3100) {
  lines[endIdx-1] = lines[endIdx-1] + '</>';
}

fs.writeFileSync('src/components/Classroom.tsx', lines.join('\n'));
