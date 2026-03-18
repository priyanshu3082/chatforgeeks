import * as admin from "firebase-admin";

// Use the path provided by the user
let serviceAccount: any;
try {
  serviceAccount = require("../../serviceAccountKey.json");
} catch (e: any) {
  // Graceful fallback if file is not physically present yet
  console.log("Could not load service account key", e.message);
  serviceAccount = null;
}

if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized");
  } catch (error) {
    console.log("Firebase admin initialization error", error);
  }
}

export { admin };
