# Bezaleel AI Backend

## Overview
This is the backend server for the Speech-to-AI Web Application. It receives text prompts from the frontend, sends them to Google Gemini AI, and returns the AI-generated response.

Backend API: https://bezai-001.onrender.com  
Frontend App: https://bezai.netlify.app

## Features
- Receives POST requests with user prompts
- Sends prompts to Google Gemini AI
- Returns AI responses as JSON
- Handles CORS and input validation
- Uses environment variables for API security

## Tech Stack
- Node.js
- Native HTTP module (no Express)
- @google/genai SDK
- dotenv pattern
- Hosted on Render

## API Endpoints
- GET / → Health check
- POST / → { "prompt": "text" } → AI response

## Setup
1. Clone the repository:
   git clone https://github.com/Tobisimi/my-ai-project.git
2. Install dependencies:
   npm install
3. Create a .env file:
   GEMINI_API_KEY=YOUR_API_KEY  
   NODE_ENV=production  
   PORT=10000  
   ALLOWED_ORIGINS=https://bezai.netlify.app
4. Run server:
   node index.js

## How It Works
1. Receives text from the frontend  
2. Sends it to Google Gemini AI  
3. Processes the response  
4. Sends the result back to the frontend
