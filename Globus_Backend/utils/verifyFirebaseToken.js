const fs = require("fs");
const path = require("path");

/**
 * Verifies a Firebase ID token (JWT) using either:
 * 1. firebase-admin (if firebaseServiceAccount.json exists)
 * 2. Google Identity Toolkit REST API (verifies signature, exp, audience directly with Google)
 *
 * @param {string} idToken - The Firebase ID Token (JWT) sent by client
 * @returns {Promise<{ email: string, name: string, avatar: string, uid: string }>}
 */
async function verifyFirebaseIdToken(idToken) {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("Missing or invalid token format");
  }

  // 1. If service account JSON exists, use firebase-admin
  const serviceAccountPath = path.join(__dirname, "../firebaseServiceAccount.json");
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const admin = require("firebase-admin");
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(require(serviceAccountPath)),
        });
      }
      const decoded = await admin.auth().verifyIdToken(idToken);
      return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.displayName || "",
        avatar: decoded.picture || "",
      };
    } catch (adminErr) {
      console.error("firebase-admin verify error:", adminErr.message);
      throw new Error("Invalid or expired token");
    }
  }

  // 2. Direct verification with Google Firebase Auth REST API
  const apiKey = process.env.FIREBASE_API_KEY || "AIzaSyDQepFDCDFx70Gpy_yvoTAiqcKJz9jl_F8";
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  const data = await response.json();

  if (!response.ok || !data.users || data.users.length === 0) {
    const errorMsg = data?.error?.message || "Invalid or expired Firebase ID token";
    throw new Error(errorMsg);
  }

  const googleUser = data.users[0];

  return {
    uid: googleUser.localId,
    email: googleUser.email,
    name: googleUser.displayName || "",
    avatar: googleUser.photoUrl || "",
  };
}

module.exports = { verifyFirebaseIdToken };

