---
description: How to deploy the full stack application (Frontend on Vercel, Backend on Render, MySQL on Railway)
---

# Deployment Guide

This guide outlines the steps to deploy the Online Learning Platform.

## Prerequisites
- GitHub account (to host your code).
- Accounts on [Railway](https://railway.app/), [Render](https://render.com/), and [Vercel](https://vercel.com/).
- Your project code pushed to a GitHub repository (ensure frontend and backend are in the same repo or separate repos).

## 1. Database Deployment (Railway)
1.  Log in to Railway.
2.  Click **New Project** -> **Provision MySQL**.
3.  Once provisioned, click on the MySQL service.
4.  Go to the **Variables** tab or **Connect** tab.
5.  Copy the **MYSQL_URL** (or construct it from host, user, password, port, database). It usually looks like: `mysql://root:password@host:port/railway`.
6.  *Note:* You will need this URL for the Backend configuration.

## 2. Backend Deployment (Render)
1.  Log in to Render.
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Root Directory**: `backend` (since your backend code is in a subfolder).
5.  **Build Command**: `npm install`
6.  **Start Command**: `node app.js` (or `npm start` which we updated to run `node app.js`).
7.  **Environment Variables**:
    *   `DB_HOST`: (From Railway)
    *   `DB_USER`: (From Railway)
    *   `DB_PASS`: (From Railway)
    *   `DB_NAME`: (From Railway - usually `railway`)
    *   `DB_PORT`: (From Railway - usually `3306`)
    *   `JWT_SECRET`: (Generate a strong secret)
    *   `CLOUDINARY_CLOUD_NAME`: (Your Cloudinary Name)
    *   `CLOUDINARY_API_KEY`: (Your Cloudinary Key)
    *   `CLOUDINARY_API_SECRET`: (Your Cloudinary Secret)
    *   `ADMIN_EMAIL`: (Your admin email)
    *   `ADMIN_PASS`: (Your email app password)
    *   `ADMIN_SECRET_KEY`: (Your admin secret)
    *   `FRONTEND_URL`: (You will update this later with the Vercel URL, e.g., `https://your-app.vercel.app`)
8.  Click **Create Web Service**.
9.  Wait for deployment. Once live, copy the **Service URL** (e.g., `https://backend-xyz.onrender.com`).

## 3. Frontend Deployment (Vercel)
1.  Log in to Vercel.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Framework Preset**: Vite (should detect automatically).
5.  **Root Directory**: Edit this and select `frontend`.
6.  **Environment Variables**:
    *   `VITE_API_URL`: Paste your Render Backend URL + `/api` (e.g., `https://backend-xyz.onrender.com/api`).
7.  Click **Deploy**.
8.  Once deployed, you will get a domain (e.g., `https://your-app.vercel.app`).

## 4. Final Configuration
1.  Go back to **Render (Backend)** -> **Environment Variables**.
2.  Update `FRONTEND_URL` with your new Vercel domain.
3.  Redeploy the backend (usually happens automatically on save, or trigger a manual deploy).

## 5. Verification
1.  Open your Vercel URL.
2.  Try to Register/Login.
3.  Check if data persists (Database connection).
4.  Check if images upload (Cloudinary).
