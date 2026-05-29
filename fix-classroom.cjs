const fs = require('fs');
let text = fs.readFileSync('src/components/Classroom.tsx', 'utf8');

text = text.replace(/\} catch \(err\) \{ alert\('Upload failed\. Try a smaller file\.'\); console\.error\(err\); \} finally \{ setIsUploading\(false\); \} else if \(data\.error\) \{/g, 
`} else if (data.error) {`);

text = text.replace(/Возможно, файл слишком велик \(ограничение прокси 10-20МБ\) или неверный формат\.'\n\s+: 'Server error\. The file might be too large \/ wrong format\.'\);\n\s+\}\n\s+\}\)\}\n/g, 
`Возможно, файл слишком велик (ограничение прокси 10-20МБ) или неверный формат.'\n                                        : 'Server error. The file might be too large / wrong format.');\n                                    }\n                                  } catch (err) {\n                                    alert('Upload failed.');\n                                    console.error(err);\n                                  } finally {\n                                    setIsUploading(false);\n                                  }\n                                }}\n`);

text = text.replace(/Возможно, файл слишком велик\.'\n\s+: 'Server error\. The file might be too large\.'\);\n\s+\}\n\s+\}\)\}\n/g, 
`Возможно, файл слишком велик.'\n                                            : 'Server error. The file might be too large.');\n                                        }\n                                      } catch (err) {\n                                        alert('Upload failed.');\n                                        console.error(err);\n                                      } finally {\n                                        setIsUploading(false);\n                                      }\n                                    }}\n`);


fs.writeFileSync('src/components/Classroom.tsx', text);
