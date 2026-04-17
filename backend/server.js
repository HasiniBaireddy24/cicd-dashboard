import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import Build from "./models/Build.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("🚀 MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const getAIExplanation = async (status, logs) => {
  if (status?.toLowerCase() === "success") {
    return "Build successful. All systems operational.";
  }

  try {
    console.log("🤖 Analyzing logs with Gemini 3 Flash...");
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;

    // STRICT TAGGING: This ensures the frontend button works every time
    const promptText = `Analyze these DevOps logs: "${logs}"
    1. Provide a short explanation of the error.
    2. Provide the exact terminal command to fix it.
    
    CRITICAL FORMATTING:
    Wrap the terminal command inside [FIX] and [/FIX] tags.
    Example: To resolve this, run: [FIX]npm install dotenv[/FIX]`;

    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [{ text: promptText }]
      }]
    });

    if (response.data.candidates && response.data.candidates[0].content) {
      return response.data.candidates[0].content.parts[0].text;
    } 
    return "AI was unable to parse these logs.";
  } catch (error) {
    console.error("⚠️ AI Error:", error.message);
    return "AI analysis failed due to a connection error.";
  }
};

// Routes
app.post("/build-status", async (req, res) => {
  try {
    const { status, logs } = req.body;
    const explanation = await getAIExplanation(status, logs);
    const newBuild = new Build({ status, logs, explanation, createdAt: new Date() });
    await newBuild.save();
    res.status(200).json({ message: "Manual build saved", data: newBuild });
  } catch (error) {
    res.status(500).json({ error: "Server Error", details: error.message });
  }
});

app.get("/builds", async (req, res) => {
  const builds = await Build.find().sort({ createdAt: -1 });
  res.json(builds);
});

app.delete("/clear-all", async (req, res) => {
  await Build.deleteMany({});
  res.status(200).json({ message: "Cleared all build history" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ Server Live: http://localhost:${PORT}`);
});