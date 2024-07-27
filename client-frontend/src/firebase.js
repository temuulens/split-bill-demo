// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA1V4xA-Lc2SEKW5y_F40xlK3KNdULFe-E",
  authDomain: "gpt4o-receipt-process.firebaseapp.com",
  databaseURL: "https://gpt4o-receipt-process-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gpt4o-receipt-process",
  storageBucket: "gpt4o-receipt-process.appspot.com",
  messagingSenderId: "609509993586",
  appId: "1:609509993586:web:cf6ab80e87448818c526eb",
  measurementId: "G-1QK9ENPXZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
