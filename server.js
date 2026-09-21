const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serwowanie plików statycznych (HTML, CSS, obrazki) z bieżącego folderu
app.use(express.static(path.join(__dirname)));

// Fallback dla innych ścieżek - odsyłamy do index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serwer działa poprawnie! Możesz otworzyć stronę pod adresem http://localhost:${PORT}`);
});

