require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());

// ✅ IMPORTANT: Add the route BEFORE static
app.get('/uploads/index.json', (req, res) => {
  const baseDir = path.join(__dirname, 'uploads');
  const index = {};

  fs.readdir(baseDir, (err, folders) => {
    if (err) return res.status(500).json({ error: err.message });

    folders.forEach(folder => {
      const folderPath = path.join(baseDir, folder);
      if (fs.lstatSync(folderPath).isDirectory()) {
        const files = fs.readdirSync(folderPath).map(file => `uploads/${folder}/${file}`);
        index[folder] = files;
      }
    });

    res.json(index);
  });
});

// ✅ Static comes after
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
