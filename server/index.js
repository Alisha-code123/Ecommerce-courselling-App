import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import Razorpay from "razorpay";
import cors from "cors";
import fs from "fs";

dotenv.config();

export const instance = new Razorpay({
  key_id: process.env.Razorpay_Key,
  key_secret: process.env.Razorpay_Secret,
});

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors());

// ================= CREATE UPLOADS FOLDER SAFELY =================
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
  console.log("📁 uploads folder created");
}

// ================= STATIC FILE ACCESS =================
app.use("/uploads", express.static("uploads"));

// ================= ROUTES =================
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";

app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);

// ================= HOME =================
app.get("/", (req, res) => {
  res.send("Server is working");
});

// ================= START SERVER =================
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDb();
});