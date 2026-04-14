# NovaTalk-AI 🚀

NovaTalk-AI is a modern, real-time, AI-powered chat application. It provides seamless communication with integrated artificial intelligence features, built using the latest web technologies.

## ✨ Features
- **Real-Time Messaging**: Instant communication powered by Socket.io.
- **AI Integrations**: Smart chat features utilizing OpenAI and Groq APIs for intelligent responses, transcription, and translation.
- **Secure Authentication**: Robust user authentication using JWT and Google OAuth.
- **Responsive Modern UI**: Beautiful and fluid interface built with React 19, TailwindCSS v4, Tremor components, and Framer Motion animations.
- **File & Media Handling**: Support for file and image uploads via Multer and Cloudinary.
- **Analytics & Moderation**: Built-in moderation services and analytics tracking.

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 19 + Vite 8
- **Routing**: React Router v7
- **Styling**: TailwindCSS v4, Tremor UI
- **Animations**: Framer Motion
- **State & Data**: Axios, Socket.io-client

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-Time**: Socket.io
- **Security**: Helmet, Express Rate Limit, bcryptjs
- **AI/External APIs**: OpenAI API, Google Auth Library, Cloudinary

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your machine. You will also need a MongoDB database and valid API keys for OpenAI/Cloudinary if you intend to run the full feature set.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hansh07/NovaTalk-AI.git
   cd NovaTalk-AI
   ```

2. **Install dependencies**
   Install both root, server, and client dependencies by running:
   ```bash
   npm run install-all
   ```

3. **Environment Variables**
   Set up your environment variables. 
   - Navigate to the `server` directory and review `.env.example`.
   - Create a `.env` file in the `server` directory and add your MongoDB URI, JWT Secret, Cloudinary keys, and AI API keys.
   - For the client, ensure your Google OAuth client ID is configured.

4. **Running the Application**
   From the root directory, start both the frontend and backend concurrently:
   ```bash
   npm run dev
   ```
   - The server will run on its designated port (e.g., `http://localhost:5000`).
   - The Vite dev server will start for the client (usually `http://localhost:5173`).

---
🌟 **Created by [Hansh07](https://github.com/Hansh07) - Feel free to star this repository if you find it helpful!**
