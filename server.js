require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

// ✅ Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const loadNumber = req.query.load || req.body.loadNumber;
    const uploadPath = path.join(__dirname, 'uploads', loadNumber);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// ✅ Upload Route
app.post('/upload', upload.array('photos', 40), (req, res) => {
  const loadNumber = req.query.load || req.body.loadNumber;
  const comments = req.body.comments || '';
  const commentFilePath = path.join(__dirname, 'uploads', loadNumber, 'comments.txt');
  fs.writeFileSync(commentFilePath, comments);
  res.status(200).send('Upload successful');
});

// ✅ File index for Power Automate
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

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
