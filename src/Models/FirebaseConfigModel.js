// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAZkfl4wT4rtdKKbubPdGRc4EaPfR5GzDs",
    authDomain: "mychatbot-b9d27.firebaseapp.com",
    projectId: "mychatbot-b9d27",
    storageBucket: "mychatbot-b9d27.firebasestorage.app",
    messagingSenderId: "547179880720",
    appId: "1:547179880720:web:33444ee0b5a299a9310595"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app);

export { auth, db }