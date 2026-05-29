import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import multer from 'multer';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage, ref, uploadBytes, getBytes } from 'firebase-admin/storage';

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
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  };
}

const app = getApps().length === 0
  ? initializeApp({ projectId: firebaseConfig.projectId || undefined })
  : getApp();

const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

db.settings({
  ignoreUndefinedProperties: true
});

// Initialize Firebase Storage
let storage: any = null;
try {
  storage = getStorage(app);
  console.log("Firebase Storage initialized successfully");
} catch (e) {
  console.warn("Firebase Storage initialization warning:", e);
}

// Mandated Firebase validation check
async function testFirestoreConnection() {
  try {
    await db.collection('classroom_config').doc('completed_lessons').get();
    console.log("Firestore Cloud Database connection successfully verified!");
  } catch (error) {
    console.error("Firestore startup connection tested with error:", error);
  }
}
testFirestoreConnection();

// Configure multer for file storage (in-memory for Firebase upload)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // Increased to 100MB for high-quality videos
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

  // Static serving for default blocks from public folder
  const publicPath = path.join(process.cwd(), 'public');
  if (existsSync(publicPath)) {
    app.use(express.static(publicPath));
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
        submissions: submissionsList
      };
    } catch (e) {
      console.error('Error reading from live Firestore, falling back to local file backup:', e);
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
      firestoreSuccess = true;
    } catch (err) {
      console.error('Error writing database state to Firestore, using local file fallback:', err);
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
      if (existsSync(configPath)) {
        const data = await fs.readFile(configPath, 'utf8');
        if (data && data.trim()) {
          return JSON.parse(data);
        }
      }
    } catch (e) {
      console.error('Error reading home blocks config:', e);
    }
    return {};
  };

  const getCoursesConfig = async () => {
    try {
      if (existsSync(coursesConfigPath)) {
        const data = await fs.readFile(coursesConfigPath, 'utf8');
        if (data && data.trim()) {
          return JSON.parse(data);
        }
      }
    } catch (e) {
      console.error('Error reading courses config:', e);
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

      // Try Firebase Storage first
      if (storage) {
        try {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const fileName = `uploads/${req.file.fieldname}-${uniqueSuffix}${path.extname(req.file.originalname)}`;
          const storageRef = ref(storage, fileName);
          
          await uploadBytes(storageRef, req.file.buffer, {
            contentType: req.file.mimetype
          });

          // Generate public URL (Firebase Storage public access)
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${encodeURIComponent(fileName)}?alt=media`;
          console.log('File uploaded to Firebase Storage:', publicUrl);
          return res.json({ url: publicUrl });
        } catch (firebaseErr) {
          console.error('Firebase Storage upload failed, falling back to local storage:', firebaseErr);
        }
      }

      // Fallback: save to local disk (for development or if Firebase is unavailable)
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = req.file.fieldname + '-' + uniqueSuffix + path.extname(req.file.originalname);
        const filePath = path.join(uploadDir, fileName);
        
        await fs.writeFile(filePath, req.file.buffer);
        
        const publicUrl = `/uploads/${fileName}`;
        console.log('File uploaded to local storage (fallback):', publicUrl);
        return res.json({ url: publicUrl });
      } catch (localErr) {
        console.error('Local storage fallback also failed:', localErr);
        return res.status(500).json({ error: 'Upload failed on both Firebase and local storage' });
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

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
