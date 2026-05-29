const fs = require('fs');

let f1 = fs.readFileSync('src/components/Classroom.tsx', 'utf8');

f1 = f1.replace(/\} catch \(err\) \{\n\s+console\.error\('Upload failed', err\);\n\s+alert\(language === 'RU' \? 'Ошибка загрузки' : 'Upload failed'\);\n\s+\}\n\s+e\.target\.value = '';/g, 
"} catch (err) {\n                                    console.error('Upload failed', err);\n                                    alert(language === 'RU' ? 'Ошибка загрузки' : 'Upload failed');\n                                  } finally {\n                                    setIsUploading(false);\n                                  }\n                                  e.target.value = '';");

f1 = f1.replace(/\} catch \(err\) \{\n\s+console\.error\('Upload failed', err\);\n\s+alert\(language === 'RU' \? 'Ошибка загрузки' : 'Upload failed'\);\n\s+\}\n\s+\/\/ Reset file input\n\s+e\.target\.value = '';/g, 
"} catch (err) {\n                                        console.error('Upload failed', err);\n                                        alert(language === 'RU' ? 'Ошибка загрузки' : 'Upload failed');\n                                      } finally {\n                                        setIsUploading(false);\n                                      }\n                                      // Reset file input\n                                      e.target.value = '';");


fs.writeFileSync('src/components/Classroom.tsx', f1);
