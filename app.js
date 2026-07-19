/**
 * TinyLink - Portfolio URL Shortener
 * Core Application Logic
 */

// ==========================================
// ⚙️ CONFIGURATION: SET UP YOUR DATABASE HERE
// ==========================================
// Set this to true when you want to connect to your real cloud Firebase database!
const USE_FIREBASE = true; 

// Replace this with your actual config details from the Firebase Console:
const firebaseConfig = {
  apiKey: "AIzaSyCrKcLpzoXSQVyxq8WFVCO4NynSbCGiapE",
  authDomain: "url-shortner-portfolio.firebaseapp.com",
  projectId: "url-shortner-portfolio",
  storageBucket: "url-shortner-portfolio.firebasestorage.app",
  messagingSenderId: "168035867509",
  appId: "1:168035867509:web:7b35829c4d22d27fbcd13c",
  measurementId: "G-7H4TGW6EBZ"
};

// ==========================================
// 🚀 STATE & INITIALIZATION
// ==========================================
let db = null; // Firestore database reference (loaded dynamically if USE_FIREBASE is true)

// Dynamic Firebase Loader
async function initDatabase() {
    if (!USE_FIREBASE) {
        console.log("ℹ️ Running in Local Storage mode. Set USE_FIREBASE to true in app.js to use cloud database.");
        return;
    }

    try {
        // Dynamically load Firebase SDKs from gstatic CDN (Modern ES Modules)
        const firebaseAppModule = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
        const firebaseFirestoreModule = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        
        // Initialize Firebase
        const app = firebaseAppModule.initializeApp(firebaseConfig);
        db = firebaseFirestoreModule.getFirestore(app);
        
        console.log("🔥 Connected to Firebase Cloud Firestore successfully!");
    } catch (error) {
        console.error("❌ Failed to initialize Firebase. Falling back to Local Storage mode.", error);
        alert("Firebase initialization failed. Check your config in app.js. Falling back to Local Storage.");
    }
}

// ==========================================
// 🛠️ DATABASE OPERATIONS (Firestore & LocalStorage)
// ==========================================

/**
 * Saves a mapping of shortCode -> originalUrl
 */
async function saveLink(shortCode, originalUrl) {
    if (USE_FIREBASE && db) {
        // Firebase Cloud Save
        try {
            const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
            // Save inside a collection named 'urls' using the shortCode as the document ID
            await setDoc(doc(db, "urls", shortCode), {
                originalUrl: originalUrl,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error saving to Firebase:", error);
            throw new Error("Could not save URL to cloud database.");
        }
    } else {
        // LocalStorage Save (Fallback / Offline mode)
        const localUrls = JSON.parse(localStorage.getItem("tinylink_urls") || "{}");
        localUrls[shortCode] = {
            originalUrl: originalUrl,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem("tinylink_urls", JSON.stringify(localUrls));
    }
}

/**
 * Retrieves the original URL mapped to a short code
 */
async function getLink(shortCode) {
    if (USE_FIREBASE && db) {
        // Firebase Cloud Retrieve
        try {
            const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
            const docSnap = await getDoc(doc(db, "urls", shortCode));
            if (docSnap.exists()) {
                return docSnap.data().originalUrl;
            }
            return null;
        } catch (error) {
            console.error("Error retrieving from Firebase:", error);
            throw new Error("Could not contact cloud database.");
        }
    } else {
        // LocalStorage Retrieve (Fallback / Offline mode)
        const localUrls = JSON.parse(localStorage.getItem("tinylink_urls") || "{}");
        if (localUrls[shortCode]) {
            return localUrls[shortCode].originalUrl;
        }
        return null;
    }
}

// ==========================================
// 💡 UTILITY FUNCTIONS
// ==========================================

/**
 * Validates whether a string is a properly formatted URL
 */
function isValidURL(string) {
    try {
        const url = new URL(string);
        // Only accept HTTP or HTTPS links
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
}

/**
 * Generates a random 6-character alphanumeric string (e.g., 'a8g2x9')
 */
function generateShortCode() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Configures the QR code image and download button with cross-origin handling
 */
async function setupQRCode(shortUrl) {
    const qrImg = document.getElementById("qr-code-img");
    const downloadBtn = document.getElementById("btn-download-qr");
    
    // We use a free, high-performance QR code API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shortUrl)}`;
    
    qrImg.src = qrApiUrl;
    
    // Force direct download file generation by fetching image as a blob
    try {
        const response = await fetch(qrApiUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        downloadBtn.href = blobUrl;
        downloadBtn.download = "tinylink-qrcode.png";
    } catch (err) {
        console.warn("Could not generate direct download blob for QR code. Defaulting to opening URL.", err);
        downloadBtn.href = qrApiUrl;
        downloadBtn.target = "_blank";
    }
}

// ==========================================
// 🖥️ UI CONTROLLER & ROUTING
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Initialize Database configuration
    await initDatabase();

    // Elements
    const mainView = document.getElementById("main-view");
    const redirectView = document.getElementById("redirect-view");
    const shortenerForm = document.getElementById("shortener-form");
    const longUrlInput = document.getElementById("long-url");
    const errorMessage = document.getElementById("error-message");
    const resultArea = document.getElementById("result-area");
    const shortenedUrlOutput = document.getElementById("shortened-url-output");
    const btnCopy = document.getElementById("btn-copy");
    const copyBtnText = document.getElementById("copy-btn-text");
    const copyIcon = document.getElementById("copy-icon");
    const successIcon = document.getElementById("success-icon");
    const fallbackLink = document.getElementById("fallback-link");

    // 2. CHECK ROUTING: Are we redirecting a shortened link?
    // We check if the URL query parameter contains `id` (e.g., ?id=a8g2x9)
    const urlParams = new URLSearchParams(window.location.search);
    const shortCode = urlParams.get("id");

    if (shortCode) {
        // Show the loading / redirection screen, hide the creator app
        mainView.classList.add("hidden");
        redirectView.classList.remove("hidden");
        
        try {
            // Look up the original destination URL
            const originalUrl = await getLink(shortCode);
            
            if (originalUrl) {
                fallbackLink.href = originalUrl;
                // Redirect user to the original URL immediately
                window.location.replace(originalUrl);
            } else {
                // If code not found in DB
                document.querySelector(".redirect-title").textContent = "Link Not Found";
                document.querySelector(".redirect-subtitle").textContent = "This shortened code does not exist or has expired.";
                fallbackLink.textContent = "Go to Homepage";
                fallbackLink.href = window.location.origin + window.location.pathname;
            }
        } catch (error) {
            document.querySelector(".redirect-title").textContent = "Redirect Error";
            document.querySelector(".redirect-subtitle").textContent = "Could not resolve short link.";
            fallbackLink.textContent = "Go to Homepage";
            fallbackLink.href = window.location.origin + window.location.pathname;
        }
        return; // Stop execution since we are in redirect mode
    }

    // 3. MAIN FORM SUBMISSION (Shortener Mode)
    shortenerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const longUrl = longUrlInput.value.trim();
        errorMessage.classList.add("hidden");
        
        // Validation
        if (!isValidURL(longUrl)) {
            errorMessage.classList.remove("hidden");
            longUrlInput.focus();
            return;
        }
        
        // Generate a new code
        const code = generateShortCode();
        
        // Construct the shortened URL
        // Example: https://myportfolio.com/?id=abc1234
        const shortenedUrl = `${window.location.origin}${window.location.pathname}?id=${code}`;
        
        try {
            // Save mapping in database
            await saveLink(code, longUrl);
            
            // Show shortened output in UI
            shortenedUrlOutput.value = shortenedUrl;
            
            // Generate QR Code
            await setupQRCode(shortenedUrl);
            
            // Un-hide results block
            resultArea.classList.remove("hidden");
            resultArea.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            alert("Error shortening URL: " + error.message);
        }
    });

    // 4. COPY TO CLIPBOARD BUTTON
    btnCopy.addEventListener("click", () => {
        shortenedUrlOutput.select();
        shortenedUrlOutput.setSelectionRange(0, 99999); // For mobile devices
        
        navigator.clipboard.writeText(shortenedUrlOutput.value).then(() => {
            // Visual success feedback
            copyBtnText.textContent = "Copied!";
            copyIcon.classList.add("hidden");
            successIcon.classList.remove("hidden");
            btnCopy.classList.add("copied");
            
            // Reset button after 2.5 seconds
            setTimeout(() => {
                copyBtnText.textContent = "Copy";
                copyIcon.classList.remove("hidden");
                successIcon.classList.add("hidden");
                btnCopy.classList.remove("copied");
            }, 2500);
        });
    });
});
