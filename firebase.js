// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcJtypfdfIK2EeL99oiD_Y56BKkro0WPc",
  authDomain: "ai-games-71e28.firebaseapp.com",
  projectId: "ai-games-71e28",
  storageBucket: "ai-games-71e28.firebasestorage.app",
  messagingSenderId: "282925787457",
  appId: "1:282925787457:web:98810e05d16f6fae5159c0",
  measurementId: "G-Q29DFZJMMS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export { db };