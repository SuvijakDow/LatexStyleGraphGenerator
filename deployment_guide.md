# 🚀 Guide: Deploying to Vercel (No Credit Card Required)

This guide explains how to host your entire project (Frontend + Backend) on Vercel for free.

## Why Vercel?
- **No Credit Card**: Vercel's Hobby tier does not require a card to get started.
- **Single URL**: Both your website and your API live on the same domain.
- **Auto-Sync**: Every time you `git push`, your website updates automatically.

---

## Part 1: Prerequisites
1.  **GitHub**: Your code must be pushed to your repository: `https://github.com/SuvijakDow/LatexStyleGraphGenerator.git`.
2.  **MongoDB Atlas**: Ensure your database is active.

---

## Part 2: Deploying to Vercel

1.  **Sign Up**: Go to [Vercel.com](https://vercel.com) and sign up using your GitHub account.
2.  **Create New Project**:
    - Click **Add New** -> **Project**.
    - Find your `LatexStyleGraphGenerator` repository and click **Import**.
3.  **Configure Project**:
    - **Framework Preset**: Select **Other**.
    - **Root Directory**: Leave it as **Root** (don't select frontend).
4.  **Environment Variables**:
    - Scroll down to the **Environment Variables** section.
    - Add these keys and values from your local `.env`:
        - `MONGODB_URI`: (Your Atlas connection string)
        - `JWT_SECRET`: (Your secret key)
        - `GOOGLE_CLIENT_ID`: (Your Google ID)
5.  **Deploy**: Click **Deploy**.
    - Vercel will build your project. Once finished, you'll get a URL like `https://latex-style-graph-generator.vercel.app`.

---

## Part 3: Google Login Setup (Crucial)

Since the URL has changed, you need to tell Google that this new URL is allowed to log in users.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Find your **OAuth 2.0 Client ID**.
3.  Add your new Vercel URL to:
    - **Authorized JavaScript origins**
    - **Authorized redirect URIs** (if applicable)
4.  Save changes. (It may take a few minutes to update).

---

## Part 4: How it Works Locally vs Production

- **Locally**: You run `npm run dev` in the backend and open `index.html`. It uses `localhost:5000`.
- **Production**: Vercel sees the `vercel.json` file we created and automatically routes your traffic correctly. No need to change any URLs in the code ever again!

---
> [!TIP]
> **Pushing Changes**: Now that everything is set up, just run these commands whenever you want to update your site:
> ```bash
> git add .
> git commit -m "Your update message"
> git push origin main
> ```

**Your site is now live! 🎊**
