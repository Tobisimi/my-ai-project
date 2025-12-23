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
  // === IMPORTANT: Add these CORS headers ===
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://your-frontend.netlify.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "text/plain");

  // Handle OPTIONS request for CORS preflight
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

        // Call Gemini AI
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: body.prompt,
        });

        return res.end(response.text);
      }
      default: {
        console.log("Non-POST request received");
        return res.end("non-post request received");
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
