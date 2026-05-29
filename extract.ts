import { execSync } from 'child_process';
import { existsSync } from 'fs';

try {
  console.log('Listing zip directory contents...');
  const list = execSync('unzip -l "./Архив 2.zip"').toString();
  console.log(list);

  console.log('Extracting archive...');
  const extract = execSync('unzip -o "./Архив 2.zip" -d "./tmp_extracted"').toString();
  console.log(extract);
} catch (err: any) {
  console.error('Error with unzip:', err.message || err);
  // Fallback to python unzip if unzip command is not present
  try {
    console.log('Trying with python zipfile...');
    const pyExtract = execSync('python3 -m zipfile -e "./Архив 2.zip" ./tmp_extracted').toString();
    console.log('Python extract success:', pyExtract);
  } catch (pyErr: any) {
    console.error('Python extract failed too:', pyErr.message || pyErr);
  }
}
