// src/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyC3Jq9tKfOhY6EB_1-XeDvKl50oWar3dng",
  authDomain: "circuitdesigner-4e620.firebaseapp.com",
  projectId: "circuitdesigner-4e620",
  storageBucket: "circuitdesigner-4e620.firebasestorage.app",
  messagingSenderId: "670781521617",
  appId: "1:670781521617:web:2121dd8509a9b93478cff0"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export default app;