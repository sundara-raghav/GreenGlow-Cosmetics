// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD91vBuTNXumFv8DqF1UhZS1UJIgCLMi9s",
    authDomain: "ecommerce-7f392.firebaseapp.com",
    projectId: "ecommerce-7f392",
    storageBucket: "ecommerce-7f392.firebasestorage.app",
    messagingSenderId: "1059220336690",
    appId: "1:1059220336690:web:1ac19536dce17183bf8c2b"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);