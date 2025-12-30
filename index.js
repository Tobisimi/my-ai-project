import http from "node:http";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      console.log("📦 Raw data received:", data);
      if (!data.trim()) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (error) {
        console.error("❌ JSON parse error for data:", data);
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async function (req, res) {
  // ========== DEBUG LOGS ==========
  console.log("\n" + "=".repeat(50));
  console.log("📨 NEW REQUEST RECEIVED");
  console.log("📨 Method:", req.method);
  console.log("📨 URL:", req.url);
  console.log("📨 Headers origin:", req.headers.origin || "none");
  console.log("=".repeat(50));
  
  // CORS Configuration
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://bezaleel-prompt-with-speech-5178.onrender.com"
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    console.log("✅ CORS allowed for origin:", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
    console.log("🌍 CORS set to * (all origins)");
  }
  
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "text/plain");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    console.log("🔄 Handling OPTIONS preflight");
    res.writeHead(200);
    return res.end();
  }

  try {
    console.log("🔍 Entering switch for method:", req.method);
    
    switch (req.method) {
      case "POST": {
        console.log("📝 POST request handler STARTING");
        const body = await getRequestBody(req);
        console.log("📝 Body parsed:", body);
        
        if (!body || !body.prompt) {
          console.log("❌ Missing prompt in body");
          res.statusCode = 400;
          return res.end("Error: Missing 'prompt' in request body");
        }
        
        console.log("🤖 Calling Gemini AI with prompt:", body.prompt.substring(0, 50) + "...");
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: body.prompt,
        });
        
        console.log("✅ Gemini response received");
        return res.end(response.text);
      }
      
      case "GET": {
        console.log("📄 GET request handler STARTING");
        console.log("📄 Returning 'non-post request received'");
        return res.end("non-post request received");
      }
      
      default: {
        console.log("⚠️ Unsupported method:", req.method);
        res.statusCode = 405;
        return res.end(`Method ${req.method} not allowed`);
      }
    }
  } catch (error) {
    console.error("💥 SERVER ERROR:", error);
    console.error("💥 Error stack:", error.stack);
    res.statusCode = 500;
    res.end(`Error: ${error.message}`);
  }
});

const port = Number(process.env.PORT) || 8000;
server.listen(port, function () {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🔑 GEMINI_API_KEY exists: ${!!process.env.GEMINI_API_KEY}`);
  console.log(`🌐 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});