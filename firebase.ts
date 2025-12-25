
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCojE440fR7eumKnwsglylj5HRlvIh-5rQ",
  authDomain: "gestion-360-9557c.firebaseapp.com",
  projectId: "gestion-360-9557c",
  storageBucket: "gestion-360-9557c.firebasestorage.app",
  messagingSenderId: "1061234582674",
  appId: "1:1061234582674:web:b6513723e65b92fabdf24b",
  measurementId: "G-DRY92EWBL5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Exportar base de datos para uso en la App
export const db = getFirestore(app);
