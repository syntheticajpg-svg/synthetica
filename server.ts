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
import { getStorage } from 'firebase-admin/storage';

dotenv.config();

// Handle __dirname gracefully for both ESM and CJS
const resolvedDirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

// Initialize Firebase Admin SDK
let firebaseConfig: any = {};
try {
  const configContent = readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8');
  firebaseConfig = JSON.parse(configContent);
} catch (e) {
  console.log("INFO: firebase-applet-config.json not found. Using environment variables.");
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  };
}

// Support for Service Account via Environment Variable (Base64 or JSON string)
let serviceAccount: any = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const decoded = process.env.FIREBASE_SERVICE_ACCOUNT.startsWith('{') 
      ? process.env.FIREBASE_SERVICE_ACCOUNT 
      : Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decoded);
    console.log("Firebase Service Account loaded from environment variable.");
  } catch (err) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT env var:", err);
  }
}

const adminApp = getApps().length === 0
  ? initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : undefined,
      projectId: firebaseConfig.projectId || undefined,
      storageBucket: firebaseConfig.storageBucket || (firebaseConfig.projectId ? `${firebaseConfig.projectId}.firebasestorage.app` : undefined)
    })
  : getApp();

const db = getFirestore(adminApp);
db.settings({ ignoreUndefinedProperties: true });

// Configure Firebase Admin Cloud Storage Bucket
let bucket: any = null;
try {
  const bucketName = firebaseConfig.storageBucket || (firebaseConfig.projectId ? `${firebaseConfig.projectId}.firebasestorage.app` : undefined);
  if (bucketName) {
    bucket = getStorage(adminApp).bucket(bucketName);
    console.log(`Firebase Storage bucket initialized: ${bucketName}`);
  }
} catch (err: any) {
  console.error('Firebase Storage initialization error:', err.message);
}

// Test Firestore Connection
let isFirestoreAccessible = false;
async function testFirestoreConnection() {
  try {
    await db.collection('classroom_config').doc('healthcheck').set({ lastSeen: new Date().toISOString() }, { merge: true });
    isFirestoreAccessible = true;
    console.log("Firestore connection verified!");
  } catch (error: any) {
    isFirestoreAccessible = false;
    console.warn("Firestore access limited. Using local fallback for data.");
  }
}
testFirestoreConnection();

// Multer configuration
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /png|jpg|jpeg|webp|mp4|webm|mov/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image or video files are allowed!'));
  }
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '200mb' }));
  app.use(express.urlencoded({ limit: '200mb', extended: true }));

  // Ensure uploads directory exists for local fallback
  const publicUploads = path.join(process.cwd(), 'public', 'uploads');
  if (!existsSync(publicUploads)) mkdirSync(publicUploads, { recursive: true });
  
  // Serve uploads
  app.use('/uploads', express.static(publicUploads));
  const distUploads = path.join(process.cwd(), 'dist', 'uploads');
  if (existsSync(distUploads)) app.use('/uploads', express.static(distUploads));

  // Config Paths
  const configPath = path.join(publicUploads, 'home_blocks_config.json');
  const coursesConfigPath = path.join(publicUploads, 'courses_config.json');
  const classroomDbPath = path.join(publicUploads, 'classroom_db.json');

  // Helper: Get Home Config
  const getHomeConfig = async () => {
    try {
      const doc = await db.collection('site_config').doc('home_blocks').get();
      if (doc.exists) return doc.data();
    } catch (e) {}
    try {
      if (existsSync(configPath)) return JSON.parse(await fs.readFile(configPath, 'utf8'));
    } catch (e) {}
    return {};
  };

  // API: Upload
  app.post('/api/upload', (req, res) => {
    upload.single('image')(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      const fileName = `uploads/${uniqueSuffix}${fileExt}`;

      // 1. Try Firebase Storage
      if (bucket) {
        try {
          const fileRef = bucket.file(fileName);
          await fileRef.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
            public: true // Attempt to make public during save
          });

          // Fallback to makePublic if the bucket allows it
          try { await fileRef.makePublic(); } catch (e) {}

          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          console.log('Uploaded to Firebase Storage:', publicUrl);
          return res.json({ url: publicUrl });
        } catch (storageErr: any) {
          console.error('Firebase Storage upload failed:', storageErr.message);
        }
      }

      // 2. Local Fallback (Ephemeral)
      try {
        const diskFileName = `${uniqueSuffix}${fileExt}`;
        const diskPath = path.join(publicUploads, diskFileName);
        await fs.writeFile(diskPath, req.file.buffer);
        console.warn('Saved to local fallback (will be lost on restart):', diskFileName);
        return res.json({ url: `/uploads/${diskFileName}` });
      } catch (writeErr: any) {
        return res.status(500).json({ error: 'Failed to save file' });
      }
    });
  });

  // API: Configs
  app.get('/api/config/home-blocks', async (req, res) => res.json(await getHomeConfig()));
  app.post('/api/config/home-blocks', async (req, res) => {
    try {
      await db.collection('site_config').doc('home_blocks').set(req.body);
      await fs.writeFile(configPath, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to save' }); }
  });

  // API: Courses
  app.get('/api/config/courses', async (req, res) => {
    try {
      const doc = await db.collection('site_config').doc('courses').get();
      if (doc.exists) return res.json(doc.data());
    } catch (e) {}
    try {
      if (existsSync(coursesConfigPath)) return res.json(JSON.parse(await fs.readFile(coursesConfigPath, 'utf8')));
    } catch (e) {}
    res.json({});
  });

  app.post('/api/config/courses', async (req, res) => {
    try {
      await db.collection('site_config').doc('courses').set(req.body);
      await fs.writeFile(coursesConfigPath, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to save' }); }
  });

  // API: Chat (Gemini)
  const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || '');
  app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API key missing' });
    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const chat = model.startChat({
        history: (history || []).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        systemInstruction: "Вы — ассистент Ирины SYNTHETICA. Отвечайте на русском языке.",
      });
      const result = await chat.sendMessage(message);
      res.json({ text: result.response.text() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Production Serving
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', async (req, res) => {
      try {
        let template = await fs.readFile(path.join(distPath, 'index.html'), 'utf-8');
        const config = await getHomeConfig();
        const script = `<script>window.__HOME_BLOCKS_CONFIG__ = ${JSON.stringify(config)};</script>`;
        template = template.replace('</head>', `${script}</head>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) { res.status(500).end('Error'); }
    });
  } else {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'custom' });
    app.use(vite.middlewares);
    app.get('*', async (req, res, next) => {
      try {
        let template = await fs.readFile(path.resolve(resolvedDirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const config = await getHomeConfig();
        const script = `<script>window.__HOME_BLOCKS_CONFIG__ = ${JSON.stringify(config)};</script>`;
        template = template.replace('</head>', `${script}</head>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) { next(e); }
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(Number(port), '0.0.0.0', () => console.log(`Server running on port ${port}`));
}

startServer();
