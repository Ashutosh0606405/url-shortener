# 🔗 TinyLink: Sleek URL Shortener & QR Generator

Welcome to **TinyLink**! This is a modern, single-page URL shortener designed to look stunning on your developer portfolio. 

It is designed to be **serverless** and **lightweight**—it uses only HTML, CSS, and Vanilla JavaScript, combined with a free cloud database (Firebase Firestore) or Local Storage.

---

## ✨ Features
* **Modern Design:** Dark mode UI featuring glassmorphism cards, glowing neon borders, and smooth transitions.
* **Instant QR Code:** Generates a high-quality, scan-ready QR code for every shortened link.
* **Direct Downloads:** Download the QR code directly to your device with one click.
* **Dual Database Modes:**
  * **Local Mode:** Works immediately on your machine without any setup (uses browser memory).
  * **Cloud Mode:** Connects to a free **Firebase Firestore** database so you can share your short links with the world.
* **Client-Side Redirection:** Automatically parses parameters (like `?id=xyz`) and redirects visitors directly using JavaScript.

---

## 📁 File Structure
* **`index.html`:** The core structure of the web app. Contains a form for shortening links and a clean loading screen for redirects.
* **`style.css`:** The design rules (responsive layout, gradients, card blurs, animations).
* **`app.js`:** The brain of the website. Manages random code generation, URL validity checks, QR code loading, and the database hookups.

---

## ⚡ How to Set Up Firebase (To share links globally)

To make your URL shortener work for anyone on the internet, you need a central cloud database. Firebase is a free service from Google that stores this mapping.

1. **Go to Firebase:** Open the [Firebase Console](https://console.firebase.google.com/) and click **Create a project**.
2. **Add Firestore Database:**
   * In the left-hand menu of your new project, click **Firestore Database** under the "Build" tab.
   * Click **Create Database**.
   * Choose a server location closest to you and select **Start in production mode** or **test mode** (test mode allows access for 30 days; production mode requires you to configure Rules, see below).
3. **Get Your Config Keys:**
   * Go to Project Settings (click the gear icon next to "Project Overview").
   * Scroll down to "Your Apps" and click the **Web icon (`</>`)**.
   * Register your app (e.g., call it "TinyLink").
   * Copy the `firebaseConfig` object containing the keys.
4. **Update `app.js`:**
   * Open `app.js` on your computer.
   * Change `const USE_FIREBASE = false;` to `const USE_FIREBASE = true;`.
   * Paste your config keys inside the `firebaseConfig` object:
     ```javascript
     const firebaseConfig = {
         apiKey: "YOUR_API_KEY",
         authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
         projectId: "YOUR_PROJECT_ID",
         // ... rest of your details
     };
     ```
5. **Configure Firestore Rules:**
   * Go back to your Firestore Database page in Firebase, select the **Rules** tab, and change the rules to allow reading and writing:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /urls/{document} {
           allow read, write: if true;
         }
       }
     }
     ```
     *Click **Publish**.*

---

## 🚀 How to Deploy Online (For Free!)

We recommend deploying on **Vercel** because it takes under 2 minutes and is completely free.

### Option A: Via GitHub (Recommended)
1. Push your files (`index.html`, `style.css`, `app.js`, `README.md`) to a new public repository on your GitHub account.
2. Sign up or log into [Vercel](https://vercel.com/) using your GitHub account.
3. Click **Add New** $\rightarrow$ **Project**.
4. Import your GitHub repository.
5. Click **Deploy**. Vercel will automatically host it and give you a public web URL!

### Option B: Via Vercel CLI (Directly from Terminal)
If you have node.js installed on your machine, you can deploy it directly from the terminal:
1. Open your terminal in this folder and install Vercel globally:
   ```bash
   npm install -g vercel
   ```
2. Deploy by running:
   ```bash
   vercel
   ```
3. Follow the quick terminal prompts. Once completed, run `vercel --prod` to push it live!

---

## 🎓 Concepts Learned
This project shows off several intermediate-level frontend skills:
* **Asynchronous JS & Dynamic Imports:** Loading external SDKs (like Firebase) only when needed to keep the initial page load extremely fast.
* **REST APIs & Blobs:** Fetching images from external APIs, converting them into browser blobs, and downloading them locally.
* **Single-Page Application Routing:** Handling redirects (`window.location.replace`) inside the index page using query parameters rather than maintaining a backend server.
* **Responsive Fluid Design:** Using CSS Grid, Flexbox, variables, and glassmorphism elements that scale perfectly on mobile devices.
