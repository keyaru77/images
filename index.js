const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

let views = {};

// Endpoint untuk proxying gambar
app.get('/img', async (req, res, next) => {
  const imageUrl = req.query.url;
  try {
    const response = await axios({
      url: imageUrl,
      responseType: 'stream',
    });
    response.data.pipe(res);
  } catch (error) {
    next(new Error('Error proxying image'));
  }
});

// Function to fetch chapter data
async function fetchChapterData(endpoint) {
  try {
    const response = await axios.get(`https://api.koranime.fun/manga/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chapter data:', error);
    return null;
  }
}

app.get('/next-chapter/:endpoint', async (req, res, next) => {
  const endpoint = req.params.endpoint;
  const data = await fetchChapterData(endpoint);
  if (!data) {
    return next(new Error('Chapter not found'));
  }
  res.json(data);
});

// Endpoint untuk mendapatkan jumlah views berdasarkan ID
app.get('/view/:id', (req, res) => {
  const id = req.params.id;
  if (!views[id]) {
    views[id] = 0;
  }
  res.json({ id: id, views: views[id] });
});

// Endpoint untuk menambah jumlah views berdasarkan ID
app.post('/view/:id', (req, res) => {
  const id = req.params.id;
  if (!views[id]) {
    views[id] = 0;
  }
  views[id] += 1;
  res.json({ id: id, views: views[id] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
