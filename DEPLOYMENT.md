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
4.  **Deploy**: Click "Deploy".

## 3. Database Setup (MongoDB Atlas)

1.  Create a free account on [MongoDB Atlas](https://www.mongodb.com/atlas).
2.  Create a new Cluster (Shared/Free).
3.  Create a Database User (username/password).
4.  Get the Connection String (Driver: Node.js) and use it as `MONGO_URI` in your backend environment variables.

## 4. AI Service (Optional)

If you want to deploy the Python AI service:
1.  Deploy it as a separate Web Service on Render.
2.  Root Directory: `ai-service`.
3.  Runtime: Python 3.
4.  Build Command: `pip install -r requirements.txt`.
5.  Start Command: `python main.py`.
