require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters long.");
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is required.");
}

app.disable("x-powered-by");

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "20kb" }));

app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 8,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
      path: "/",
    },
  }),
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", application: "Synapse" });
});

app.use("/api/auth", authRoutes);
app.use("/api", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found." });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) return next(error);

  res.status(500).json({
    message: "An unexpected server error occurred.",
  });
});

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Synapse API running at http://localhost:${PORT}`);
  });
}

startServer();
