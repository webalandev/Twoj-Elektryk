const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const IMAGES_DIR = path.join(__dirname, 'images');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Body parsers for file uploads (base64 JSON)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serwowanie plików statycznych z folderu images oraz głównego katalogu
app.use('/images', express.static(IMAGES_DIR));
app.use(express.static(path.join(__dirname)));

// API zwracające listę wgranych zdjęć realizacji
app.get('/api/images', (req, res) => {
  try {
    const list = [];
    if (fs.existsSync(IMAGES_DIR)) {
      const files = fs.readdirSync(IMAGES_DIR);
      files.forEach(f => {
        if (/\.(jpg|jpeg|png|webp|svg)$/i.test(f)) {
          list.push({ name: f, url: `/images/${f}` });
        }
      });
    }
    // Sprawdź również główny katalog pod kątem plików image*.png
    const rootFiles = fs.readdirSync(__dirname);
    rootFiles.forEach(f => {
      if (/^image.*\.(jpg|jpeg|png|webp)$/i.test(f)) {
        list.push({ name: f, url: `/${f}` });
      }
    });
    res.json({ success: true, images: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API do wgrywania zdjęć z wizytówki / dysku do folderu images
app.post('/api/upload', (req, res) => {
  try {
    const { filename, base64 } = req.body;
    if (!filename || !base64) {
      return res.status(400).json({ success: false, error: 'Brak nazwy pliku lub danych' });
    }
    const cleanName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const targetPath = path.join(IMAGES_DIR, cleanName);
    fs.writeFileSync(targetPath, buffer);
    res.json({ success: true, url: `/images/${cleanName}`, name: cleanName });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback dla innych ścieżek - odsyłamy do index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serwer działa poprawnie! Możesz otworzyć stronę pod adresem http://0.0.0.0:${PORT}`);
});


