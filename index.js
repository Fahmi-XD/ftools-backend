import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import http from 'http';

import Tiktok from './controller/Tiktok.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/getSize', async (req, res) => {
  try {
    const url = req.query.url;
    const response = await axios.head(url, { responseType: 'stream' });
    const size = response.headers['content-length'];

    res.json({ size });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tiktok', async (req, res) => {
  const fhdev = req.body.url;
  if (!req.body.url) {
    return res.json({ err: 'Data tidak ada' });
  }
  try {
    const rs = await Tiktok(fhdev);
    res.json(rs);
  } catch (e) {
    res.json({ err: e.toString() });
  }
});

app.get('/tiktok/media', async (req, res) => {
  const url = req.query.url;
  if (!req.query.url) {
    return res.json({ err: 'Query tidak ada' });
  }
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const headers = response.headers;

    response.data.pipe(res);
    res.writeHead(200, headers);
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .json({ error: 'Terjadi kesalahan saat memproses permintaan' });
  }
});

http.createServer(app).listen(PORT, () => {
  console.log('Server Running on http://localhost:' + PORT);
});
