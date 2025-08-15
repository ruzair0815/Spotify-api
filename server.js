// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend

// ---------- Connect to MongoDB ----------
const MONGO_URI = "mongodb+srv://rehmauzair:3zffOi64NLq60Qct@cluster0.rax7xgg.mongodb.net/spotifyDB";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ---------- Define Schema ----------
const trackSchema = new mongoose.Schema({
  track_name: String,
  artist_name: String,
  energy: Number,
  danceability: Number,
  tempo: Number
});

// Use exact collection name
const Track = mongoose.model('Track', trackSchema, 'artistStats');

// ---------- API Routes ----------

// Get all tracks
app.get('/artists', async (req, res) => {
  try {
    const tracks = await Track.find({});
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tracks by artist
app.get('/artist/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const tracks = await Track.find({ artist_name: name });
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top N tracks by energy
app.get('/top-energy/:n', async (req, res) => {
  try {
    const n = parseInt(req.params.n);
    const topTracks = await Track.find({}).sort({ energy: -1 }).limit(n);
    res.json(topTracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unique artist list
app.get('/artists-list', async (req, res) => {
  try {
    const artists = await Track.distinct('artist_name');
    res.json(artists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Average metrics per artist
app.get('/artist-metrics/:artist', async (req, res) => {
  try {
    const artist = req.params.artist;
    const tracks = await Track.find({ artist_name: artist });
    if (!tracks.length) return res.json({});

    const avgEnergy = tracks.reduce((sum, t) => sum + t.energy, 0) / tracks.length;
    const avgDance = tracks.reduce((sum, t) => sum + t.danceability, 0) / tracks.length;
    const avgTempo = tracks.reduce((sum, t) => sum + t.tempo, 0) / tracks.length;

    const tempoValues = tracks.map(t => t.tempo);

    res.json({ avgEnergy, avgDance, avgTempo, tempoValues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
