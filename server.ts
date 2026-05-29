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

dotenv.config();

// Handle __dirname gracefully for both ESM and CJS
const resolvedDirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

// Initialize Firebase Admin SDK
let firebaseConfig: any = {};
try {
  const configContent = readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8');
  firebaseConfig = JSON.parse(configContent);
} catch (e) {
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID
  };
}

const adminApp = getApps().length === 0
  ? initializeApp({ 
      projectId: firebaseConfig.projectId || undefined,
      storageBucket: firebaseConfig.storageBucket || `${firebaseConfig.projectId}.appspot.com`
    })
  : getApp();

const db = getFirestore(adminApp);
const storage = adminApp.storage();
db.settings({ ignoreUndefinedProperties: true });

// Test Firestore Connection
let isFirestoreAccessible = false;
async function testFirestoreConnection() {
  try {
    await db.collection('classroom_config').doc('healthcheck').get();
    isFirestoreAccessible = true;
    console.log("Firestore connection verified!");
  } catch (error: any) {
    isFirestoreAccessible = false;
    console.warn("Firestore access limited. Using local fallback.");
  }
}
testFirestoreConnection();

// Multer configuration for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB for Base64 efficiency
  fileFilter: (req, file, cb) => {
    const filetypes = /png|jpg|jpeg|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files (PNG, JPG, WEBP) are allowed for direct saving!'));
  }
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API: Upload (Firebase Storage Method)
  app.post('/api/upload', (req, res) => {
    upload.single('image')(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      try {
        const bucket = storage.bucket();
        const filename = `uploads/${Date.now()}-${req.file.originalname}`;
        const file = bucket.file(filename);

        await file.save(req.file.buffer, {
          metadata: { contentType: req.file.mimetype },
          public: true
        });

        // Use the direct public URL for Firebase Storage
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        
        console.log('File uploaded to Firebase Storage:', publicUrl);
        return res.json({ url: publicUrl });
      } catch (writeErr: any) {
        console.error('Firebase Upload Error:', writeErr);
        return res.status(500).json({ error: 'Failed to upload to cloud storage' });
      }
    });
  });

  const getHomeConfig = async () => {
    try {
      const doc = await db.collection('site_config').doc('home_blocks').get();
      if (doc.exists) return doc.data();
    } catch (e) {}
    return {};
  };

  app.get('/api/config/home-blocks', async (req, res) => res.json(await getHomeConfig()));
  app.post('/api/config/home-blocks', async (req, res) => {
    try {
      await db.collection('site_config').doc('home_blocks').set(req.body);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to save' }); }
  });

  app.get('/api/config/courses', async (req, res) => {
    try {
      const doc = await db.collection('site_config').doc('courses').get();
      if (doc.exists) return res.json(doc.data());
    } catch (e) {}
    res.json({});
  });

  app.post('/api/config/courses', async (req, res) => {
    try {
      await db.collection('site_config').doc('courses').set(req.body);
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
