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

app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const load = req.body.load || req.query.load;
    const folderPath = path.join(__dirname, 'uploads', load);
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});
const upload = multer({ storage });

app.post('/upload', upload.array('photos'), (req, res) => {
  const load = req.body.load || req.query.load;
  const comments = req.body.comments || '';
  const folderPath = path.join(__dirname, 'uploads', load);
  const commentFile = path.join(folderPath, 'comments.txt');

  try {
    fs.writeFileSync(commentFile, comments);
    res.status(200).send('Upload successful');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to save comment');
  }
});

app.get('/uploads/index.json', (req, res) => {
  const baseDir = path.join(__dirname, 'uploads');
  const index = {};

  try {
    fs.readdirSync(baseDir).forEach(folder => {
      const folderPath = path.join(baseDir, folder);
      if (fs.lstatSync(folderPath).isDirectory()) {
        const files = fs.readdirSync(folderPath).map(f => `uploads/${folder}/${f}`);
        index[folder] = files;
      }
    });
    res.json(index);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
