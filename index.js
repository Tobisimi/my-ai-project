import http from "node:http";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      console.log("Raw data received:", data);
      if (!data.trim()) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (error) {
        console.error("JSON parse error for data:", data);
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async function (req, res) {
  // CORS Configuration - Allow multiple origins
  const allowedOrigins = [
    "http://localhost:5173", // Vite dev server
    "http://localhost:5500", // Live Server
    "http://127.0.0.1:5500", // Live Server alternative
    "https://my-ai-project.onrender.com", // Your deployed backend
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // For development, allow all; for production, restrict
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "text/plain");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  try {
    switch (req.method) {
      case "POST": {
        console.log("POST request received");
        const body = await getRequestBody(req);
        console.log("Body parsed:", body);

        if (!body || !body.prompt) {
          res.statusCode = 400;
          return res.end("Error: Missing 'prompt' in request body");
        }

        // Call Gemini AI
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: body.prompt,
        });

        return res.end(response.text);
      }

      case "GET": {
        console.log("GET request received");
        return res.end("non-post request received");
      }

      default: {
        console.log(`Unsupported method received: ${req.method}`);
        res.statusCode = 405;
        return res.end(`Method ${req.method} not allowed`);
      }
    }
  } catch (error) {
    console.error("Server error:", error);
    res.statusCode = 500;
    res.end(`Error: ${error.message}`);
  }
});

const port = Number(process.env.PORT) || 8000;
server.listen(port, function () {
  console.log(`server running on port ${port}`);
});
