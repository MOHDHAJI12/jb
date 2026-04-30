import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");
const SECRET_KEY = "jb-fruits-secret-key"; // In production, use process.env.JWT_SECRET

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeData(data: unknown) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Public Data
  app.get("/api/products", (req, res) => {
    const data = readData();
    res.json(data.products);
  });

  app.get("/api/blogs", (req, res) => {
    const data = readData();
    res.json(data.blogs);
  });

  // Orders
  app.post("/api/orders", (req, res) => {
    const data = readData();
    const newOrder = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    data.orders.push(newOrder);
    writeData(data);
    res.status(201).json(newOrder);
  });

  // Admin Auth
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    console.log(`Login attempt with password: ${password}`);
    const data = readData();
    
    // Simple password check for demo
    if (password === data.settings.adminPassword) {
      console.log("Login successful");
      const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: "1d" });
      res.json({ token });
    } else {
      console.log("Login failed: Invalid password");
      res.status(401).json({ message: "Invalid password" });
    }
  });

  // Admin Protected Routes
  const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    try {
      jwt.verify(token, SECRET_KEY);
      next();
    } catch {
      res.status(401).json({ message: "Invalid token" });
    }
  };

  app.get("/api/admin/orders", authenticateAdmin, (req, res) => {
    const data = readData();
    res.json(data.orders);
  });

  app.post("/api/admin/products", authenticateAdmin, (req, res) => {
    const data = readData();
    const newProduct = {
      id: Date.now().toString(),
      ...req.body
    };
    data.products.push(newProduct);
    writeData(data);
    res.status(201).json(newProduct);
  });

  app.delete("/api/admin/products/:id", authenticateAdmin, (req, res) => {
    const data = readData();
    data.products = data.products.filter((p: { id: string }) => p.id !== req.params.id);
    writeData(data);
    res.status(204).send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
