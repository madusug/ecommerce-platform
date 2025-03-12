const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors()); // Allow all origins (for dev)
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
