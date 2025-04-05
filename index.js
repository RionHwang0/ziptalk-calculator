var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  apartments: () => apartments,
  competitionData: () => competitionData,
  insertApartmentSchema: () => insertApartmentSchema,
  insertCompetitionDataSchema: () => insertCompetitionDataSchema,
  insertScoreSchema: () => insertScoreSchema,
  insertUserSchema: () => insertUserSchema,
  subscriptionScores: () => subscriptionScores,
  users: () => users
});
import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var subscriptionScores = pgTable("subscription_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  age: integer("age").notNull(),
  noHomePeriod: integer("no_home_period").notNull(),
  dependents: integer("dependents").notNull(),
  subscriptionPeriod: integer("subscription_period").notNull(),
  income: integer("income").notNull(),
  totalScore: integer("total_score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertScoreSchema = createInsertSchema(subscriptionScores).omit({
  id: true,
  totalScore: true,
  createdAt: true
});
var apartments = pgTable("apartments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  competitionRate: integer("competition_rate").notNull(),
  minScore: integer("min_score").notNull(),
  avgScore: integer("avg_score").notNull(),
  coordinates: jsonb("coordinates").notNull(),
  // {lat: number, lng: number}
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertApartmentSchema = createInsertSchema(apartments).omit({
  id: true,
  createdAt: true
});
var competitionData = pgTable("competition_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  fileName: text("file_name").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertCompetitionDataSchema = createInsertSchema(competitionData).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Score calculation
  async calculateScore(data) {
    let ageScore = 0;
    if (data.age >= 40) {
      ageScore = 20;
    } else if (data.age >= 35) {
      ageScore = 15;
    } else if (data.age >= 30) {
      ageScore = 10;
    } else if (data.age >= 25) {
      ageScore = 5;
    } else {
      ageScore = 2;
    }
    const noHomePeriodScore = Math.min(20, data.noHomePeriod);
    let dependentsScore = 0;
    if (data.dependents >= 3) {
      dependentsScore = 30;
    } else if (data.dependents === 2) {
      dependentsScore = 20;
    } else if (data.dependents === 1) {
      dependentsScore = 10;
    }
    const subscriptionPeriodScore = Math.min(20, data.subscriptionPeriod);
    let incomeScore = 0;
    if (data.income <= 2e3) {
      incomeScore = 10;
    } else if (data.income <= 4e3) {
      incomeScore = 5;
    } else if (data.income <= 6e3) {
      incomeScore = 2;
    }
    const totalScore = Math.min(100, ageScore + noHomePeriodScore + dependentsScore + subscriptionPeriodScore + incomeScore);
    const probability = Math.min(100, Math.round(totalScore * 0.9));
    const [savedScore] = await db.insert(subscriptionScores).values({
      userId: 1,
      // Default user ID for now
      age: data.age,
      noHomePeriod: data.noHomePeriod,
      dependents: data.dependents,
      subscriptionPeriod: data.subscriptionPeriod,
      income: data.income,
      totalScore
    }).returning();
    return {
      ageScore,
      noHomePeriodScore,
      dependentsScore,
      subscriptionPeriodScore,
      incomeScore,
      totalScore,
      probability,
      id: savedScore.id
    };
  }
  // Process competition data from Excel
  async processCompetitionData(data) {
    const nationalAvg = 12.9;
    const processedApartments = [];
    for (const row of data) {
      const name = row["\uC544\uD30C\uD2B8\uBA85"] || row[0];
      const location = row["\uC9C0\uC5ED"] || row[1];
      const competitionRate = parseFloat(row["\uACBD\uC7C1\uB960"] || row[2]);
      const minScore = parseInt(row["\uCD5C\uC800 \uB2F9\uCCA8 \uC810\uC218"] || row[3]);
      const avgScore = parseInt(row["\uD3C9\uADE0 \uB2F9\uCCA8 \uC810\uC218"] || row[4]);
      const lat = parseFloat(row["\uC704\uB3C4"] || row[5]);
      const lng = parseFloat(row["\uACBD\uB3C4"] || row[6]);
      const [apartment] = await db.insert(apartments).values({
        name,
        location,
        competitionRate,
        minScore,
        avgScore,
        coordinates: { lat, lng }
      }).returning();
      let level = this.getCompetitionLevel(competitionRate);
      processedApartments.push({
        id: apartment.id,
        name,
        location,
        competitionRate,
        level,
        requiredScore: avgScore,
        coordinates: { lat, lng }
      });
    }
    const avgCompetitionRate = processedApartments.reduce(
      (acc, apt) => acc + apt.competitionRate,
      0
    ) / processedApartments.length;
    const [competitionDataEntry] = await db.insert(competitionData).values({
      userId: 1,
      // Default user ID
      fileName: "uploaded_competition_data.xlsx",
      data: processedApartments
    }).returning();
    return {
      apartments: processedApartments,
      averageCompetitionRate: avgCompetitionRate,
      nationalAvgDiff: avgCompetitionRate - nationalAvg,
      winningChance: 3.9,
      // This would be calculated based on real data
      requiredScore: 72,
      // Average score needed for winning
      recentApartments: processedApartments.slice(0, 4).map((apt) => ({
        id: apt.id,
        name: apt.name,
        location: apt.location,
        competitionRate: apt.competitionRate,
        minScore: apt.requiredScore - 5,
        avgScore: apt.requiredScore
      }))
    };
  }
  // Get all apartments
  async getApartments() {
    const apartmentsList = await db.select().from(apartments);
    return apartmentsList.map((apt) => ({
      id: apt.id,
      name: apt.name,
      location: apt.location,
      competitionRate: apt.competitionRate,
      level: this.getCompetitionLevel(apt.competitionRate),
      requiredScore: apt.avgScore,
      coordinates: apt.coordinates
    }));
  }
  // Get apartment by ID
  async getApartment(id) {
    const [apartment] = await db.select().from(apartments).where(eq(apartments.id, id));
    if (!apartment) return void 0;
    return {
      id: apartment.id,
      name: apartment.name,
      location: apartment.location,
      competitionRate: apartment.competitionRate,
      level: this.getCompetitionLevel(apartment.competitionRate),
      requiredScore: apartment.avgScore,
      coordinates: apartment.coordinates
    };
  }
  // Helper to determine competition level
  getCompetitionLevel(rate) {
    if (rate >= 30) return "high";
    if (rate >= 15) return "medium";
    return "low";
  }
  // Initialize with sample data if needed
  async initializeWithSampleData() {
    const apartmentCount = await db.select().from(apartments);
    if (apartmentCount.length === 0) {
      const sampleApartments = [
        {
          name: "\uB798\uBBF8\uC548 \uC544\uD30C\uD2B8",
          location: "\uC11C\uC6B8\uC2DC \uAC15\uB0A8\uAD6C",
          competitionRate: 45,
          minScore: 75,
          avgScore: 82,
          coordinates: { lat: 37.5066, lng: 127.0562 }
        },
        {
          name: "\uD478\uB974\uC9C0\uC624 \uC544\uD30C\uD2B8",
          location: "\uC11C\uC6B8\uC2DC \uC1A1\uD30C\uAD6C",
          competitionRate: 32,
          minScore: 70,
          avgScore: 78,
          coordinates: { lat: 37.5145, lng: 127.1059 }
        },
        {
          name: "e-\uD3B8\uD55C\uC138\uC0C1",
          location: "\uC778\uCC9C\uC2DC \uC5F0\uC218\uAD6C",
          competitionRate: 18,
          minScore: 65,
          avgScore: 72,
          coordinates: { lat: 37.408, lng: 126.6782 }
        },
        {
          name: "\uB354\uC0F5 \uC544\uD30C\uD2B8",
          location: "\uACBD\uAE30\uB3C4 \uC131\uB0A8\uC2DC",
          competitionRate: 8,
          minScore: 60,
          avgScore: 65,
          coordinates: { lat: 37.4449, lng: 127.1389 }
        }
      ];
      for (const apt of sampleApartments) {
        await db.insert(apartments).values(apt);
      }
    }
  }
};
var storage = new DatabaseStorage();
(async () => {
  try {
    await storage.initializeWithSampleData();
    console.log("Database initialized with sample data");
  } catch (error) {
    console.error("Error initializing database with sample data:", error);
  }
})();

// server/routes.ts
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { eq as eq2 } from "drizzle-orm";
async function registerRoutes(app2) {
  app2.post("/api/calculate-score", async (req, res) => {
    const { age, noHomePeriod, dependents, subscriptionPeriod, income } = req.body;
    try {
      const result = await storage.calculateScore({
        age,
        noHomePeriod,
        dependents,
        subscriptionPeriod,
        income
      });
      res.json(result);
    } catch (error) {
      console.error("Error calculating score:", error);
      res.status(500).json({ error: "Failed to calculate score" });
    }
  });
  app2.post("/api/competition-data", async (req, res) => {
    try {
      const { data } = req.body;
      if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ error: "Invalid data format" });
      }
      const processedData = await storage.processCompetitionData(data);
      res.json(processedData);
    } catch (error) {
      console.error("Error processing competition data:", error);
      res.status(500).json({ error: "Failed to process competition data" });
    }
  });
  app2.get("/api/competition-data/all", async (req, res) => {
    try {
      const entries = await db.select().from(competitionData);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching competition data:", error);
      res.status(500).json({ error: "Failed to fetch competition data" });
    }
  });
  app2.delete("/api/competition-data/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(competitionData).where(eq2(competitionData.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting competition data:", error);
      res.status(500).json({ error: "Failed to delete competition data" });
    }
  });
  app2.get("/api/competition-data/template", (req, res) => {
    try {
      const workbook = XLSX.utils.book_new();
      const data = [
        ["\uC544\uD30C\uD2B8\uBA85", "\uC9C0\uC5ED", "\uACBD\uC7C1\uB960", "\uCD5C\uC800 \uB2F9\uCCA8 \uC810\uC218", "\uD3C9\uADE0 \uB2F9\uCCA8 \uC810\uC218", "\uC704\uB3C4", "\uACBD\uB3C4"],
        ["\uB798\uBBF8\uC548 \uC544\uD30C\uD2B8", "\uC11C\uC6B8\uC2DC \uAC15\uB0A8\uAD6C", 45, 75, 82, 37.5066, 127.0562],
        ["\uD478\uB974\uC9C0\uC624 \uC544\uD30C\uD2B8", "\uC11C\uC6B8\uC2DC \uC1A1\uD30C\uAD6C", 32, 70, 78, 37.5145, 127.1059],
        ["e-\uD3B8\uD55C\uC138\uC0C1", "\uC778\uCC9C\uC2DC \uC5F0\uC218\uAD6C", 18, 65, 72, 37.408, 126.6782],
        ["\uB354\uC0F5 \uC544\uD30C\uD2B8", "\uACBD\uAE30\uB3C4 \uC131\uB0A8\uC2DC", 8, 60, 65, 37.4449, 127.1389]
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, "\uACBD\uC7C1\uB960 \uB370\uC774\uD130");
      const tempFilePath = path.join("/tmp", "competition_data_template.xlsx");
      XLSX.writeFile(workbook, tempFilePath);
      res.download(tempFilePath, "\uCCAD\uC57D_\uACBD\uC7C1\uB960_\uB370\uC774\uD130_\uD15C\uD50C\uB9BF.xlsx", (err) => {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        if (err) {
          console.error("Error sending template file:", err);
          res.status(500).end();
        }
      });
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  });
  app2.get("/api/apartments", async (req, res) => {
    try {
      const apartments2 = await storage.getApartments();
      res.json(apartments2);
    } catch (error) {
      console.error("Error fetching apartments:", error);
      res.status(500).json({ error: "Failed to fetch apartments" });
    }
  });
  app2.get("/api/apartments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const apartment = await storage.getApartment(id);
      if (!apartment) {
        return res.status(404).json({ error: "Apartment not found" });
      }
      res.json(apartment);
    } catch (error) {
      console.error("Error fetching apartment:", error);
      res.status(500).json({ error: "Failed to fetch apartment" });
    }
  });
  app2.delete("/api/apartments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(apartments).where(eq2(apartments.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting apartment:", error);
      res.status(500).json({ error: "Failed to delete apartment" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin()
  ],
  base: "/ziptalk-calculator/",
  resolve: {
    alias: {
      "@": path2.resolve(__dirname, "client", "src"),
      "@shared": path2.resolve(__dirname, "shared"),
      "@assets": path2.resolve(__dirname, "attached_assets")
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: path2.resolve(__dirname, "client/src/main.tsx")
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(assetInfo.name)) {
            return `assets/images/[name][extname]`;
          }
          if (/\.css$/.test(assetInfo.name)) {
            return `assets/[name][extname]`;
          }
          return `assets/[name][extname]`;
        }
      }
    }
  },
  publicDir: "public"
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(__dirname2, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
