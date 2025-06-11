const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(cors());

// ✅ Define this FIRST — before static middleware
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
