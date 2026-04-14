# 🚀 Guide: Deploying LatexStyleGraph to Production

This guide explains how to host your project online for free so it runs 24/7 on any device.

## Prerequisites
1.  **GitHub**: Your code must be pushed to your repository: `https://github.com/SuvijakDow/LatexStyleGraphGenerator.git`.
2.  **MongoDB Atlas**: Your database is already active and set up in your `.env`.

---

## Part 1: Deploying the Backend (API) on Render.com

Render is perfect for hosting Node.js servers.

1.  **Sign Up**: Go to [Render.com](https://render.com) and sign up using your GitHub account.
2.  **Create New Web Service**:
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repository.
3.  **Configure Web Service**:
    - **Name**: `latexstylegraphgenerator-backend`
    - **Environment**: `Node`
    - **Build Command**: `npm install` (Standard for backend)
    - **Start Command**: `node src/server.js`
4.  **Environment Variables**:
    - Click **Environment** -> **Add Environment Variable**.
    - Add these keys from your local `.env`:
        - `MONGODB_URI`: (Copy your Atlas string)
        - `JWT_SECRET`: (Your secret key)
        - `GOOGLE_CLIENT_ID`: (Your Google ID)
5.  **Deploy**: Click **Create Web Service**.
    - Once finished, Render will give you a URL like: `https://latexstylegraphgenerator-backend.onrender.com`.

---

## Part 2: Deploying the Frontend (UI) on Vercel.com

Vercel is the best way to host static HTML/JS websites.

1.  **Sign Up**: Go to [Vercel.com](https://vercel.com) and sign up with GitHub.
2.  **Import Project**:
    - Click **Add New** -> **Project**.
    - Import your GitHub repository.
3.  **Configure Project**:
    - **Framework Preset**: select `Other` (since it's vanilla HTML/JS).
    - **Root Directory**: `frontend` (Important! Select the frontend folder).
    - **Build Settings**: Leave defaults (no build command needed).
4.  **Deploy**: Click **Deploy**.
    - You will get a URL like: `https://latex-style-graph-generator.vercel.app`.

---

## Part 3: Connecting Everything

Once you have your **Render URL**, you must update your frontend config so it knows where to find the server.

1.  Open [frontend/js/api/config.js](file:///c:/Users/Dell-Laptop14/Documents/Website%20Coding/LatexStyleGraphGenerator/frontend/js/api/config.js).
2.  Make sure the production URL matches your Render URL.
3.  **Commit and Push** your changes to GitHub.
    - Vercel and Render will **automatically redeploy** your site with the latest code!

---

## Troubleshooting Tips

- **White Screen?** Check the Browser Console (F12) for errors.
- **Login doesn't work?** Remember to add your Vercel URL to the **Authorized JavaScript Origins** in your Google Cloud Console (Credentials).
- **Backend sleeping?** Free Render instances sleep after 15 mins of inactivity. The first request after a long break might take 30-50 seconds to boot up.

---
> [!IMPORTANT]
> **Don't Forget!** Always push your changes to GitHub to keep your live site up to date.
