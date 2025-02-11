// Firebase configuration and initialization (Firebase.js)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyA3AghsUSBDW37aaLmGRZ98G3amnT-Rwa4",
  authDomain: "ncsututorapp.firebaseapp.com",
  projectId: "ncsututorapp",
  storageBucket: "ncsututorapp.firebasestorage.app",
  messagingSenderId: "957893919124",
  appId: "1:957893919124:web:ab4dbfaafcabd07b20cf81",
  measurementId: "G-FJT02Z8WYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth
export const auth = getAuth(app);
export const db = getFirestore(app);
