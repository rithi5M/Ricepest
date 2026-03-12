import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS farmers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    district TEXT
  );

  CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district TEXT,
    temperature REAL,
    humidity REAL,
    rainfall REAL,
    bph_risk TEXT,
    stem_risk TEXT,
    leaf_risk TEXT,
    gall_risk TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_path TEXT,
    detected_pest TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/history", (req, res) => {
    const predictions = db.prepare("SELECT * FROM predictions ORDER BY date DESC LIMIT 10").all();
    const uploads = db.prepare("SELECT * FROM uploads ORDER BY date DESC LIMIT 10").all();
    res.json({ predictions, uploads });
  });

  app.post("/api/save-prediction", (req, res) => {
    const { district, temperature, humidity, rainfall, bph_risk, stem_risk, leaf_risk, gall_risk } = req.body;
    const stmt = db.prepare(`
      INSERT INTO predictions (district, temperature, humidity, rainfall, bph_risk, stem_risk, leaf_risk, gall_risk)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(district, temperature, humidity, rainfall, bph_risk, stem_risk, leaf_risk, gall_risk || 'Low');
    res.json({ success: true });
  });

  app.post("/api/save-upload", (req, res) => {
    const { image_path, detected_pest } = req.body;
    const stmt = db.prepare("INSERT INTO uploads (image_path, detected_pest) VALUES (?, ?)");
    stmt.run(image_path, detected_pest);
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    const districtStats = db.prepare(`
      SELECT district, COUNT(*) as count 
      FROM predictions 
      GROUP BY district
    `).all();
    
    const riskStats = db.prepare(`
      SELECT 
        SUM(CASE WHEN bph_risk = 'High' THEN 1 ELSE 0 END) as bph_high,
        SUM(CASE WHEN stem_risk = 'High' THEN 1 ELSE 0 END) as stem_high,
        SUM(CASE WHEN leaf_risk = 'High' THEN 1 ELSE 0 END) as leaf_high
      FROM predictions
    `).get();

    res.json({ districtStats, riskStats });
  });

  app.get("/api/weather", async (req, res) => {
    const { district } = req.query;
    
    if (!district) {
      return res.status(400).json({ error: "District is required" });
    }

    // Coordinates for Tamil Nadu districts
    const coords: Record<string, { lat: number, lon: number }> = {
      "Coimbatore": { lat: 11.0168, lon: 76.9558 },
      "Thanjavur": { lat: 10.7870, lon: 79.1378 },
      "Madurai": { lat: 9.9252, lon: 78.1198 },
      "Tiruchirappalli": { lat: 10.7905, lon: 78.7047 },
      "Salem": { lat: 11.6643, lon: 78.1460 },
      "Erode": { lat: 11.3410, lon: 77.7172 },
      "Tirunelveli": { lat: 8.7139, lon: 77.7567 },
      "Villupuram": { lat: 11.9401, lon: 79.4861 }
    };

    const location = coords[district as string];
    
    if (!location) {
      return res.status(404).json({ error: "District coordinates not found" });
    }

    try {
      // Using Open-Meteo (Free, No API Key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`
      );
      const data = await response.json();
      
      if (response.ok && data.current) {
        res.json({
          main: {
            temp: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m
          }
        });
      } else {
        res.status(response.status).json(data);
      }
    } catch (error) {
      console.error("Weather fetch error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
