// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
 
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjgac1fez4UelXx5Eucgu2ET9iDMGMR-I",
  authDomain: "thiba-ingozi.firebaseapp.com",
  projectId: "thiba-ingozi",
  storageBucket: "thiba-ingozi.firebasestorage.app",
  messagingSenderId: "95888153096",
  appId: "1:95888153096:web:91a6435846023b80bc4fbd",
  measurementId: "G-5HB4QT4EN9"
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const messaging = getMessaging(app);