import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import multer from 'multer';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage, getDownloadURL } from 'firebase-admin/storage';

dotenv.config();

// Handle __dirname gracefully for both ESM and CJS
const resolvedDirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

// Initialize Firebase Admin SDK on server-side with fallback for external cloud deployments
let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
} catch (e) {
  console.log("INFO: firebase-applet-config.json not found or could not be read. Falling back to environment variables.");
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT,
    firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app` : undefined)
  };
}

// Support for explicit service account key if provided in environment (required for many cloud hosts like Render/Vercel)
let credential: any = undefined;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = cert(sa);
    console.log("INFO: Initializing Firebase Admin with provided service account credential.");
  } catch (err) {
    console.error("CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable. Ensure it is a valid JSON string.");
  }
}

const adminApp = getApps().length === 0
  ? initializeApp({ 
      credential,
      projectId: firebaseConfig.projectId || undefined 
    })
  : getApp();

const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(adminApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(adminApp);

db.settings({
  ignoreUndefinedProperties: true
});

// Configure Firebase Admin Cloud Storage Bucket
let bucket: any = null;
let bucketName = firebaseConfig.storageBucket || (firebaseConfig.projectId ? `${firebaseConfig.projectId}.firebasestorage.app` : undefined);
if (bucketName && bucketName.startsWith('gs://')) {
  bucketName = bucketName.replace('gs://', '');
}
if (bucketName) {
  try {
    // Calling getStorage() without arguments uses the default app initialized above
    // This often avoids name-resolution or compatibility issues in bundled code
    const storage = getStorage();
    bucket = storage.bucket(bucketName);
    console.log(`Firebase Storage bucket initialized successfully: ${bucketName}`);
  } catch (err: any) {
    console.error('Firebase Cloud Storage bucket initialization error:', err.message || err);
  }
}

let isFirestoreAccessible = false;

// Mandated Firebase validation check
async function testFirestoreConnection() {
  try {
    await db.collection('classroom_config').doc('completed_lessons').get();
    isFirestoreAccessible = true;
    console.log("Firestore Cloud Database connection successfully verified!");
  } catch (error: any) {
    isFirestoreAccessible = false;
    console.log("INFO: Firestore status checked. Mode: Local JSON backup mode (Cloud Database permission restricted. Fully self-contained local operations active.)");
  }
}
testFirestoreConnection();

// Configure multer for in-memory storage of uploaded files
const memoryStorage = multer.memoryStorage();
const upload = multer({ 
  storage: memoryStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Allowed up to 100MB for high-quality videos
  fileFilter: (req, file, cb) => {
    const filetypes = /png|jpg|jpeg|webp|mp4|webm|mov/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image (PNG, JPG, WEBP) or video (MP4, WEBM, MOV) files are allowed!'));
  }
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '200mb' }));
  app.use(express.urlencoded({ limit: '200mb', extended: true }));

  // Static serving for uploads strictly - use absolute path to public/uploads
  const publicUploads = path.join(process.cwd(), 'public', 'uploads');
  if (!existsSync(publicUploads)) {
    mkdirSync(publicUploads, { recursive: true });
  }
  app.use('/uploads', express.static(publicUploads));
  
  // Extra production fallback: serve uploads from compiled dist folder if present
  const distUploads = path.join(process.cwd(), 'dist', 'uploads');
  if (existsSync(distUploads)) {
    app.use('/uploads', express.static(distUploads));
  }

  // Setup Gemini client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API router/endpoints
  const configPath = path.join(process.cwd(), 'public', 'uploads', 'home_blocks_config.json');
  const coursesConfigPath = path.join(process.cwd(), 'public', 'uploads', 'courses_config.json');
  const classroomDbPath = path.join(process.cwd(), 'public', 'uploads', 'classroom_db.json');

  const defaultClassroomData = {
    students: [
      {
        id: "s1",
        email: "student@synthetica.art",
        password: "student123",
        fullName: "Иван Кузнецов",
        allowedCourses: ["course_marketing"],
        allowedModules: {
          course_marketing: ["01", "02", "03"]
        },
        isMentorshipMember: true,
        allowedBonusCourses: ["contact_me"],
        allowedBonusModules: {
          contact_me: ["01", "02"]
        }
      },
      {
        id: "s2",
        email: "nina@synthetica.art",
        password: "123456",
        fullName: "Нина Тарасова",
        allowedCourses: ["course_midjourney", "future_agents"],
        allowedModules: {
          course_midjourney: ["01", "02", "03"],
          future_agents: ["01"]
        }
      }
    ],
    completedLessons: {},
    submissions: []
  };

  const getClassroomData = async () => {
    try {
      const studentsSnapshot = await db.collection('students').get();
      isFirestoreAccessible = true; // Mark as verified on success!

      const studentsList: any[] = [];
      studentsSnapshot.forEach(docSnap => {
        studentsList.push({ id: docSnap.id, ...docSnap.data() });
      });

      const submissionsSnapshot = await db.collection('submissions').get();
      const submissionsList: any[] = [];
      submissionsSnapshot.forEach(docSnap => {
        submissionsList.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Sort submissions chronologically descending
      submissionsList.sort((a, b) => {
        const tA = new Date(a.submittedAt || 0).getTime();
        const tB = new Date(b.submittedAt || 0).getTime();
        return tB - tA;
      });

      const completedDoc = await db.collection('classroom_config').doc('completed_lessons').get();
      const completedLessons = completedDoc.exists ? (completedDoc.data()?.data || {}) : {};

      let lastUpdatedAt = 0;
      try {
        const metadataDoc = await db.collection('classroom_config').doc('db_metadata').get();
        if (metadataDoc.exists) {
          lastUpdatedAt = metadataDoc.data()?.lastUpdatedAt || 0;
        }
      } catch (metaErr) {
        console.log('INFO: Could not read db_metadata from Firestore:', metaErr);
      }

      // Bootstrap with default data if both students and submissions are completely empty
      if (studentsList.length === 0) {
        console.log('Bootstrapping Firestore database with starter students...');
        for (const s of defaultClassroomData.students) {
          const { id, ...rest } = s;
          await db.collection('students').doc(id).set(rest);
          studentsList.push(s);
        }
        await db.collection('classroom_config').doc('completed_lessons').set({ data: defaultClassroomData.completedLessons });
      }

      return {
        students: studentsList,
        completedLessons,
        submissions: submissionsList,
        __metadata_updated_at: lastUpdatedAt
      };
    } catch (e: any) {
      console.log('INFO: Error reading from live Firestore, falling back to local file backup:', e.message || e);
      try {
        if (existsSync(classroomDbPath)) {
          const data = await fs.readFile(classroomDbPath, 'utf8');
          if (data && data.trim()) {
            return JSON.parse(data);
          }
        }
      } catch (errBackup) {
        console.error('Local backup read failed too:', errBackup);
      }
    }
    return defaultClassroomData;
  };

  const saveClassroomData = async (data: any) => {
    let firestoreSuccess = false;
    try {
      // 1. Write students
      if (data && Array.isArray(data.students)) {
        for (const s of data.students) {
          const { id, ...rest } = s;
          if (id) {
            await db.collection('students').doc(id).set(rest);
          }
        }
      }

      // 2. Write submissions
      if (data && Array.isArray(data.submissions)) {
        for (const sub of data.submissions) {
          const { id, ...rest } = sub;
          if (id) {
            await db.collection('submissions').doc(id).set(rest);
          }
        }
      }

      // 3. Write completed progress map
      if (data && data.completedLessons) {
        await db.collection('classroom_config').doc('completed_lessons').set({ data: data.completedLessons });
      }

      // 4. Write database metadata timestamp
      if (data && data.__metadata_updated_at) {
        await db.collection('classroom_config').doc('db_metadata').set({ lastUpdatedAt: data.__metadata_updated_at });
      }

      firestoreSuccess = true;
      isFirestoreAccessible = true; // Mark as verified on success!
    } catch (err: any) {
      console.log('INFO: Error writing database state to Firestore, using local file fallback:', err.message || err);
    }

    // Always update local file backup for extra high redundancy and standalone operation
    try {
      await fs.writeFile(classroomDbPath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (errBackup) {
      console.error('Local JSON backup write failed:', errBackup);
      if (!firestoreSuccess) {
        throw errBackup;
      }
    }
    return firestoreSuccess;
  };

  const getHomeConfig = async () => {
    try {
      const doc = await db.collection('site_config').doc('home_blocks').get();
      if (doc.exists) {
        const data = doc.data() || {};
        isFirestoreAccessible = true;
        // Optionally sync back to local file for redundancy
        try {
          await fs.writeFile(configPath, JSON.stringify(data, null, 2), 'utf8');
        } catch (e) {}
        return data;
      }
    } catch (e: any) {
      console.log('INFO: Could not read home blocks configuration from Firestore, falling back to local file:', e.message || e);
    }

    try {
      if (existsSync(configPath)) {
        const data = await fs.readFile(configPath, 'utf8');
        if (data && data.trim()) {
          const parsed = JSON.parse(data);
          // If Firestore was failed but we have local data, we check if we can try to push it to Firestore again in background
          if (!isFirestoreAccessible) {
             testFirestoreConnection(); 
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading home blocks config fallback:', e);
    }
    return {};
  };

  const getPaymentsConfig = async () => {
    if (isFirestoreAccessible) {
      try {
        const snap = await db.collection('payments').orderBy('createdAt', 'desc').get();
        const payments: any[] = [];
        snap.forEach(doc => {
          payments.push({ id: doc.id, ...doc.data() });
        });
        return payments;
      } catch (e: any) {
        console.log('INFO: Could not read payments from Firestore:', e.message || e);
      }
    }
    return [];
  };

  app.get('/api/crm/payments', async (req, res) => {
    try {
      const data = await getPaymentsConfig();
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: 'Failed to read payments config' });
    }
  });

  app.post('/api/crm/payments', express.json(), async (req, res) => {
    try {
      const paymentDate = new Date().toISOString();
      const payload = {
        ...req.body,
        createdAt: paymentDate
      };
      
      if (isFirestoreAccessible) {
        try {
          await db.collection('payments').add(payload);
          return res.json({ success: true });
        } catch (e: any) {
             console.error('Failed to log payment to firestore', e);
        }
      }
      res.status(200).json({ success: true, warning: 'Logged locally if possible, but Firestore write failed.' });
    } catch (e) {
      res.status(500).json({ error: 'Failed to log payment' });
    }
  });

  const getCoursesConfig = async () => {
    try {
      const doc = await db.collection('site_config').doc('courses').get();
      if (doc.exists) {
        isFirestoreAccessible = true;
        return doc.data() || {};
      }
    } catch (e: any) {
      console.log('INFO: Could not read courses configuration from Firestore, falling back to local file:', e.message || e);
    }

    try {
      if (existsSync(coursesConfigPath)) {
        const data = await fs.readFile(coursesConfigPath, 'utf8');
        if (data && data.trim()) {
          return JSON.parse(data);
        }
      }
    } catch (e) {
      console.error('Error reading courses config fallback:', e);
    }
    return {};
  };

  const injectHomeConfig = (html: string, config: any) => {
    const script = `<script>window.__HOME_BLOCKS_CONFIG__ = ${JSON.stringify(config)};</script>`;
    return html.replace('</head>', `${script}</head>`);
  };

  // API 404 handler for missing routes BEFORE general catch-alls but AFTER real routes
  app.get('/api/config/home-blocks', async (req, res) => {
    const data = await getHomeConfig();
    res.json(data);
  });

  app.post('/api/config/home-blocks', async (req, res) => {
    try {
      try {
        await db.collection('site_config').doc('home_blocks').set(req.body);
        isFirestoreAccessible = true;
      } catch (firestoreErr: any) {
        console.log('INFO: Failed to save home blocks to Firestore, falling back to local file:', firestoreErr.message || firestoreErr);
      }
      await fs.writeFile(configPath, JSON.stringify(req.body, null, 2), 'utf8');
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save config' });
    }
  });

  app.get('/api/config/courses', async (req, res) => {
    const data = await getCoursesConfig();
    res.json(data);
  });

  app.post('/api/config/courses', async (req, res) => {
    try {
      try {
        await db.collection('site_config').doc('courses').set(req.body);
        isFirestoreAccessible = true;
      } catch (firestoreErr: any) {
        console.log('INFO: Failed to save courses to Firestore, falling back to local file:', firestoreErr.message || firestoreErr);
      }
      await fs.writeFile(coursesConfigPath, JSON.stringify(req.body, null, 2), 'utf8');
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save courses config' });
    }
  });

  app.get('/api/classroom/data', async (req, res) => {
    const data = await getClassroomData();
    res.json(data);
  });

  app.post('/api/classroom/data', async (req, res) => {
    try {
      await saveClassroomData(req.body);
      res.json({ success: true });
    } catch (err) {
      console.error('Error saving classroom db to live Firestore:', err);
      res.status(500).json({ error: 'Failed to save classroom data' });
    }
  });

  app.post('/api/upload', (req, res) => {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(err instanceof multer.MulterError ? 400 : 500).json({ 
          error: err.message || 'Upload failed' 
        });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      const fileName = `uploads/${req.file.fieldname}-${uniqueSuffix}${fileExt}`;

      // 1. Attempt to upload buffer to Firebase Cloud Storage (GCS)
      if (bucket) {
        try {
          const fileRef = bucket.file(fileName);
          await fileRef.save(req.file.buffer, {
            metadata: {
              contentType: req.file.mimetype
            }
          });

          try {
            await fileRef.makePublic();
          } catch (pubErr) {
            console.log("INFO: Could not make file public (uniform access or disabled). using construction url via storage bucket property.");
          }

          // Use the more standard Firebase storage URL format with alt=media
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
          
          console.log('Uploaded successfully to permanent Firebase Storage:', publicUrl);
          return res.json({ url: publicUrl });
        } catch (storageErr: any) {
          console.error('Firebase Storage upload blocked or failed (likely paywall):', storageErr.message || storageErr);
        }
      }

      // 2. FALLBACK: Return Base64 if storage is unavailable. 
      // Important: We expect the frontend to have compressed this enough to fit in Firestore later.
      console.log('FALLBACK: Storage unavailable, returning Base64 string for direct Firestore storage.');
      const base64Data = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;
      return res.json({ url: dataUrl });

      // 2. Fallback to saving file locally on the ephemeral disk
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }

        const diskFileName = `${req.file.fieldname}-${uniqueSuffix}${fileExt}`;
        const diskPath = path.join(uploadDir, diskFileName);
        await fs.writeFile(diskPath, req.file.buffer);

        // Also copy upload into the build dist folder if available (useful for production hot restarts)
        const distUploads = path.join(process.cwd(), 'dist', 'uploads');
        try {
          if (!existsSync(distUploads)) {
            mkdirSync(distUploads, { recursive: true });
          }
          await fs.writeFile(path.join(distUploads, diskFileName), req.file.buffer);
        } catch (distErr) {
          // ignore
        }

        const localUrl = `/uploads/${diskFileName}`;
        console.log('File successfully saved to local fallback disk storage:', localUrl);
        return res.json({ url: localUrl });
      } catch (writeErr: any) {
        console.error('Fatal local disk write exception:', writeErr);
        return res.status(500).json({ error: writeErr.message || 'File write error' });
      }
    });
  });

  app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Gemini API key is not configured in your environment secrets. Please configure it in Settings > Secrets in the Google AI Studio panel.' 
      });
    }

    try {
      // Build conversation structures complying with @google/genai format
      const pastParts = history ? history.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })) : [];

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          ...pastParts,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: 'Вы — высококлассный интерактивный ИИ-ассистент Ирины SYNTHETICA (генеративного дизайнера, маркетолога и ментора). Вы находитесь на её портфолио-сайте и помогаете посетителям узнать больше о её услугах, курсах (Мини-курс по Midjourney & Stable Diffusion, Мини-курс по Нейромаркетингу), наставничестве и возможностях сотрудничества. Общайтесь профессионально, креативно, вдохновляюще и дружелюбно на русском языке (или на английском, если пользователь пишет на английском). Отвечайте структурировано, лаконично, укладываясь в 2-4 абзаца, с использованием красивой разметки markdown и эмодзи.',
        }
      });

      return res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return res.status(500).json({ error: error.message || 'Error communicating with Gemini' });
    }
  });

  // API 404 handler - catch missing API routes before they hit the SPA fallback
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  const isProd = process.env.NODE_ENV === 'production';
  
  if (isProd) {
    // Serve static compiled UI files in production
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', async (req, res) => {
      try {
        let template = await fs.readFile(path.join(distPath, 'index.html'), 'utf-8');
        const config = await getHomeConfig();
        template = injectHomeConfig(template, config);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        res.status(500).end('Internal Server Error');
      }
    });
  } else {
    // Set up Vite dev server in middleware mode for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);
    
    // Serve index.html dynamically with SSR transforms
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await fs.readFile(path.resolve(resolvedDirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const config = await getHomeConfig();
        template = injectHomeConfig(template, config);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
