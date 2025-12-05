# Deployment Guide

This guide explains how to deploy the JobMate 2.0 application.

## 1. Backend Deployment (Render)

We will deploy the Node.js backend to [Render](https://render.com).

1.  **Push to GitHub**: Ensure your code is pushed to a GitHub repository.
2.  **Create Web Service**:
    *   Go to Render Dashboard -> New -> Web Service.
    *   Connect your GitHub repository.
    *   Select the `backend` directory as the **Root Directory**.
3.  **Configuration**:
    *   **Name**: `jobmate-backend`
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
4.  **Environment Variables**:
    Add the following environment variables in the Render dashboard:
    *   `MONGO_URI`: Your MongoDB connection string (e.g., from MongoDB Atlas).
    *   `JWT_SECRET`: A secure random string.
    *   `ADMIN_WALLET_EVM`: Your Ethereum admin wallet address.
    *   `ADMIN_WALLET_SOLANA`: Your Solana admin wallet address.
    *   `PORT`: `10000` (Render default).
5.  **Persistent Storage (Important)**:
    *   Since we use local file storage for resumes/avatars, you should attach a **Disk** in Render settings (paid feature) mounted at `/opt/render/project/src/uploads`.
    *   *Alternative (Free)*: Use the ephemeral filesystem, but be aware that uploaded files will disappear when the server restarts.

## 2. Frontend Deployment (Vercel)

We will deploy the React frontend to [Vercel](https://vercel.com).

1.  **Import Project**:
    *   Go to Vercel Dashboard -> Add New -> Project.
    *   Import your GitHub repository.
2.  **Configuration**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `.` (default)
3.  **Environment Variables**:
    *   `VITE_API_BASE_URL`: The URL of your deployed backend (e.g., `https://jobmate-backend.onrender.com/api`).
    *   `VITE_AI_SERVICE_URL`: The URL of your deployed AI service (e.g., `https://jobmate-ai.onrender.com`).
4.  **Deploy**: Click "Deploy".

## 3. Database Setup (MongoDB Atlas)

1.  Create a free account on [MongoDB Atlas](https://www.mongodb.com/atlas).
2.  Create a new Cluster (Shared/Free).
3.  Create a Database User (username/password).
4.  Get the Connection String (Driver: Node.js) and use it as `MONGO_URI` in your backend environment variables.

## 4. AI Service Deployment (Render)

The AI Service is a FastAPI application that can also be deployed on Render.

1.  **Create Web Service**:
    *   Go to Render Dashboard -> New -> Web Service.
    *   Connect your GitHub repository.
    *   Select the `ai-service` directory as the **Root Directory**.
2.  **Configuration**:
    *   **Name**: `jobmate-ai-service`
    *   **Runtime**: Python 3
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
3.  **Environment Variables**:
    *   `GROQ_API_KEY`: Your Groq API Key (Get one from [console.groq.com](https://console.groq.com)).
4.  **Update Backend**:
    *   Once deployed, copy the AI Service URL (e.g., `https://jobmate-ai.onrender.com`).
    *   Update your **Backend** environment variables to point to this service if you are using it for processing (or update the Frontend `.env` if calling directly).

## 5. Troubleshooting Common Issues

### MongoDB Connection Error
If you see `MongooseServerSelectionError`, it means Render cannot access your MongoDB Atlas cluster.
*   **Fix**: Go to MongoDB Atlas -> **Network Access**.
*   Click **Add IP Address**.
*   Select **Allow Access from Anywhere** (`0.0.0.0/0`).
*   Render uses dynamic IPs, so whitelisting specific IPs won't work.

### Firebase Service Account Error
If you see `Service account file not found`, you need to provide the credentials via environment variables.
*   **Fix**:
    1.  Open your local `serviceAccountKey.json` file.
    2.  Copy the entire content.
    3.  Minify it (remove newlines) to a single line string.
    4.  In Render Dashboard -> Environment Variables, add a new variable:
        *   **Key**: `FIREBASE_SERVICE_ACCOUNT`
        *   **Value**: Paste the JSON string.


